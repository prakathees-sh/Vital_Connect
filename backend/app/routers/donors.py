import qrcode
import io
import base64
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any, List
from app.core.database import get_db
from app.routers.auth import get_current_user
from app.models.models import User, DonorProfile, ScreeningResponse, Achievement, Donation, AuditLog
from app.schemas.schemas import ScreeningInput, DonorProfileResponse

router = APIRouter(prefix="/donors", tags=["Donors"])

@router.get("/profile", response_model=DonorProfileResponse)
def get_donor_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(DonorProfile).filter(DonorProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Donor profile not found")
    return profile

@router.put("/profile")
def update_donor_profile(
    profile_data: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(DonorProfile).filter(DonorProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Donor profile not found")

    if "blood_group" in profile_data:
        profile.blood_group = profile_data["blood_group"]
    if "age" in profile_data:
        profile.age = profile_data["age"]
    if "weight" in profile_data:
        profile.weight = profile_data["weight"]
    if "gender" in profile_data:
        profile.gender = profile_data["gender"]
    if "is_available" in profile_data:
        profile.is_available = profile_data["is_available"]
    if "emergency_available" in profile_data:
        profile.emergency_available = profile_data["emergency_available"]
    if "sms_notifications" in profile_data:
        profile.sms_notifications = profile_data["sms_notifications"]

    db.commit()
    db.refresh(profile)
    return {"status": "success", "profile": profile}

@router.post("/screening")
def submit_preliminary_screening(
    screening_in: ScreeningInput,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Evaluates 12+ preliminary readiness questions.
    Provides immediate feedback while emphasizing this is NOT medical clearance.
    """
    profile = db.query(DonorProfile).filter(DonorProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Donor profile not found")

    ans = screening_in.answers
    
    # Preliminary safety checks
    disqualifiers = []
    age = int(ans.get("age", profile.age or 25))
    weight = float(ans.get("weight", profile.weight or 55))

    if age < 18 or age > 65:
        disqualifiers.append("Standard donation age range is between 18 and 65 years.")
    if weight < 45.0:
        disqualifiers.append("Minimum donor body weight is generally 45 kg.")
    if ans.get("recent_fever", False):
        disqualifiers.append("Active or recent fever within past 14 days requires deferral.")
    if ans.get("recent_alcohol", False):
        disqualifiers.append("Alcohol consumption within the past 24 hours requires a 24-hour wait.")
    if ans.get("recent_tattoo", False):
        disqualifiers.append("Tattoos or piercings within the past 6 months require observation.")
    if ans.get("recent_surgery", False):
        disqualifiers.append("Major surgeries in the past 6-12 months require medical clearance.")

    is_eligible = len(disqualifiers) == 0

    # Save response
    response_rec = ScreeningResponse(
        donor_id=profile.id,
        answers=ans,
        is_preliminarily_eligible=is_eligible,
        notes="; ".join(disqualifiers) if disqualifiers else "All preliminary screening criteria met."
    )
    db.add(response_rec)

    # Update donor profile status
    profile.screening_cleared = is_eligible
    if "blood_group" in ans:
        profile.blood_group = ans["blood_group"]
    if "emergency_ready" in ans:
        profile.emergency_available = ans["emergency_ready"]
    if "sms_opt_in" in ans:
        profile.sms_notifications = ans["sms_opt_in"]

    # If cleared, unlock "Community Hero" or "Registered Donor" badge
    existing_badge = db.query(Achievement).filter(
        Achievement.donor_id == profile.id,
        Achievement.badge_key == "registered_hero"
    ).first()
    if not existing_badge and is_eligible:
        badge = Achievement(
            donor_id=profile.id,
            badge_key="registered_hero",
            title="Readiness Hero",
            description="Completed comprehensive donor preliminary readiness screening.",
            icon="ShieldCheck"
        )
        db.add(badge)

    audit = AuditLog(
        user_id=current_user.id,
        action="PRELIMINARY_SCREENING_SUBMITTED",
        resource_type="DONOR_PROFILE",
        resource_id=profile.id,
        details={"is_eligible": is_eligible, "disqualifiers_count": len(disqualifiers)}
    )
    db.add(audit)
    db.commit()

    return {
        "is_preliminarily_eligible": is_eligible,
        "disqualifiers": disqualifiers,
        "disclaimer": (
            "This questionnaire is a preliminary screening tool and does not determine "
            "final eligibility to donate blood. Final eligibility must be determined by "
            "qualified medical professionals or blood-bank staff."
        )
    }

@router.get("/digital-card")
def get_digital_donor_card(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Generates official digital donor ID card with verified QR code."""
    profile = db.query(DonorProfile).filter(DonorProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Donor profile not found")

    # Safe verification URL that doesn't expose address or phone
    verify_url = f"https://vitalconnect.org/verify/donor/{profile.donor_code}"

    # Generate QR Code as Base64 image
    qr = qrcode.QRCode(version=1, box_size=5, border=1)
    qr.add_data(verify_url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="#DC2626", back_color="white")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    qr_base64 = base64.b64encode(buf.getvalue()).decode("utf-8")

    return {
        "donor_code": profile.donor_code,
        "full_name": current_user.full_name,
        "blood_group": profile.blood_group,
        "district": current_user.district,
        "is_verified": current_user.is_verified,
        "screening_cleared": profile.screening_cleared,
        "total_donations": profile.total_donations,
        "last_donation_date": profile.last_donation_date.isoformat() if profile.last_donation_date else None,
        "qr_code_base64": f"data:image/png;base64,{qr_base64}",
        "verification_url": verify_url
    }

@router.get("/achievements")
def get_donor_achievements(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(DonorProfile).filter(DonorProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Donor profile not found")

    achievements = db.query(Achievement).filter(Achievement.donor_id == profile.id).all()
    return achievements
