from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone
from app.core.database import get_db
from app.routers.auth import get_current_user
from app.models.models import Certificate, Donation, DonorProfile, User
from app.services.pdf_service import generate_donation_certificate_pdf

router = APIRouter(prefix="/certificates", tags=["Donation Certificates"])

@router.get("")
def list_user_certificates(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(DonorProfile).filter(DonorProfile.user_id == current_user.id).first()
    if not profile:
        return []

    certs = db.query(Certificate).join(Donation).filter(Donation.donor_id == profile.id).all()
    return [
        {
            "id": c.id,
            "certificate_code": c.certificate_code,
            "donor_name": c.donor_name,
            "blood_group": c.blood_group,
            "donation_date": c.donation_date.strftime("%B %d, %Y"),
            "facility_name": c.facility_name,
            "district": c.district,
            "verification_url": c.verification_url
        }
        for c in certs
    ]

@router.get("/verify/{certificate_code}")
def verify_certificate_public(
    certificate_code: str,
    db: Session = Depends(get_db)
):
    """
    Public verification endpoint (accessible by anyone scanning QR code).
    Does NOT expose private donor address or contact phone.
    """
    cert = db.query(Certificate).filter(
        (Certificate.certificate_code == certificate_code) | (Certificate.id == certificate_code)
    ).first()

    if not cert:
        return {
            "is_valid": False,
            "message": "Certificate record not found or could not be verified."
        }

    # Mask donor name for privacy (e.g. "Rajesh K." or "R*** K***")
    name_parts = cert.donor_name.split()
    masked_name = f"{name_parts[0]} {name_parts[1][0]}." if len(name_parts) > 1 else cert.donor_name

    return {
        "is_valid": True,
        "certificate_code": cert.certificate_code,
        "verified_participant": masked_name,
        "blood_group": cert.blood_group,
        "donation_date": cert.donation_date.strftime("%B %d, %Y"),
        "facility_name": cert.facility_name,
        "district": cert.district,
        "issuing_authority": "Vital Connect Emergency Blood Coordination Platform",
        "disclaimer": "This recognition certificate confirms voluntary blood coordination and does not constitute a clinical medical clearance."
    }

@router.get("/{certificate_id}/pdf")
def download_certificate_pdf(
    certificate_id: str,
    db: Session = Depends(get_db)
):
    """Generates and returns an official binary PDF document using ReportLab."""
    cert = db.query(Certificate).filter(
        (Certificate.id == certificate_id) | (Certificate.certificate_code == certificate_id)
    ).first()

    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found")

    cert_data = {
        "certificate_code": cert.certificate_code,
        "donor_name": cert.donor_name,
        "blood_group": cert.blood_group,
        "donation_date": cert.donation_date.strftime("%B %d, %Y"),
        "facility_name": cert.facility_name,
        "district": cert.district,
        "verification_url": cert.verification_url
    }

    pdf_stream = generate_donation_certificate_pdf(cert_data)

    return Response(
        content=pdf_stream.getvalue(),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"inline; filename={cert.certificate_code}.pdf"
        }
    )
