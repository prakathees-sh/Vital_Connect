from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.models import EmergencyRequest, BloodBank, BloodInventory, DonorProfile, User, Match
from app.services.matching_service import is_blood_compatible, calculate_match_score
from app.core.tamil_nadu_districts import calculate_haversine_distance

CHAIN_RESCUE_LEVELS = [
    {
        "level": 1,
        "name": "Nearby Blood Banks",
        "description": "Scanning institutional blood banks within immediate radius (0-15 km)",
        "radius_km": 15,
        "target_type": "BLOOD_BANK"
    },
    {
        "level": 2,
        "name": "Nearby Verified Donors",
        "description": "Notifying registered, verified compatible donors nearby (0-30 km)",
        "radius_km": 30,
        "target_type": "DONOR"
    },
    {
        "level": 3,
        "name": "District-Wide Coordination",
        "description": "Expanding search radius to all facilities and donors across district (0-60 km)",
        "radius_km": 60,
        "target_type": "ALL"
    },
    {
        "level": 4,
        "name": "Regional Cluster Search",
        "description": "Engaging neighboring districts and regional hubs (0-120 km)",
        "radius_km": 120,
        "target_type": "ALL"
    },
    {
        "level": 5,
        "name": "Statewide Emergency Escalation",
        "description": "Active statewide escalation across all 38 Tamil Nadu districts",
        "radius_km": 500,
        "target_type": "ALL"
    }
]

def get_chain_rescue_state(db: Session, request_id: str) -> Dict[str, Any]:
    req = db.query(EmergencyRequest).filter(EmergencyRequest.id == request_id).first()
    if not req:
        return {"error": "Request not found"}

    current_level = req.chain_rescue_level or 1
    config = CHAIN_RESCUE_LEVELS[current_level - 1]

    # Find candidate blood banks
    blood_banks = db.query(BloodBank).all()
    compatible_banks = []
    for bb in blood_banks:
        dist = calculate_haversine_distance(req.latitude, req.longitude, bb.latitude, bb.longitude)
        if dist <= config["radius_km"]:
            # Check inventory
            inv = db.query(BloodInventory).filter(
                BloodInventory.blood_bank_id == bb.id,
                BloodInventory.blood_group == req.blood_group,
                BloodInventory.units_available > 0
            ).first()
            compatible_banks.append({
                "id": bb.id,
                "bank_name": bb.bank_name,
                "district": bb.district,
                "distance_km": dist,
                "units_available": inv.units_available if inv else 0,
                "contact_phone": bb.contact_phone,
                "status": inv.status if inv else "Out of Stock"
            })

    compatible_banks.sort(key=lambda x: x["distance_km"])

    # Find candidate donors
    donors = db.query(DonorProfile).join(User).filter(
        DonorProfile.is_available == True,
        User.is_active == True
    ).all()
    compatible_donors = []
    for d in donors:
        if is_blood_compatible(d.blood_group, req.blood_group):
            d_lat = d.user.latitude or req.latitude
            d_lng = d.user.longitude or req.longitude
            dist = calculate_haversine_distance(req.latitude, req.longitude, d_lat, d_lng)
            if dist <= config["radius_km"]:
                m_score = calculate_match_score(
                    d.blood_group,
                    req.blood_group,
                    dist,
                    is_verified=d.user.is_verified,
                    is_available=d.is_available,
                    emergency_enabled=d.emergency_available,
                    screening_cleared=d.screening_cleared
                )
                compatible_donors.append({
                    "id": d.id,
                    "donor_code": d.donor_code,
                    "blood_group": d.blood_group,
                    "distance_km": dist,
                    "match_score": m_score["score"],
                    "reasons": m_score["reasons"],
                    "district": d.user.district,
                    "is_verified": d.user.is_verified,
                    "total_donations": d.total_donations
                })

    compatible_donors.sort(key=lambda x: x["match_score"], reverse=True)

    return {
        "request_code": req.request_code,
        "blood_group": req.blood_group,
        "units_needed": req.units_needed,
        "urgency": req.urgency,
        "status": req.status,
        "current_level": current_level,
        "level_config": config,
        "levels_overview": CHAIN_RESCUE_LEVELS,
        "radius_km": config["radius_km"],
        "compatible_banks_count": len(compatible_banks),
        "compatible_banks": compatible_banks[:10],
        "compatible_donors_count": len(compatible_donors),
        "compatible_donors": compatible_donors[:15],
        "center_coords": {"lat": req.latitude, "lng": req.longitude}
    }

def escalate_chain_rescue(db: Session, request_id: str) -> Dict[str, Any]:
    req = db.query(EmergencyRequest).filter(EmergencyRequest.id == request_id).first()
    if not req:
        return {"error": "Request not found"}

    if req.chain_rescue_level < 5:
        req.chain_rescue_level += 1
        req.status = "CHAIN_RESCUE_ACTIVE"
        db.commit()
        db.refresh(req)

    return get_chain_rescue_state(db, request_id)
