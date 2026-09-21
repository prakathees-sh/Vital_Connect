import random
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone
from app.core.database import get_db
from app.routers.auth import get_current_user
from app.core.tamil_nadu_districts import resolve_district, calculate_haversine_distance
from app.models.models import (
    User, EmergencyRequest, Match, Conversation, Message,
    DonorProfile, BloodBank, BloodInventory, AuditLog
)
from app.schemas.schemas import EmergencyRequestCreate, EmergencyRequestResponse
from app.services.matching_service import is_blood_compatible, calculate_match_score
from app.websockets.manager import ws_manager

router = APIRouter(prefix="/requests", tags=["Emergency Requests"])

@router.post("", response_model=EmergencyRequestResponse)
async def create_emergency_request(
    req_in: EmergencyRequestCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Auto-resolve district if not explicitly provided
    resolved_district = req_in.district or resolve_district(
        f"{req_in.address} {req_in.area or ''} {req_in.city or ''}",
        req_in.latitude,
        req_in.longitude
    )

    req_code = f"VC-REQ-{random.randint(10000, 99999)}"
    
    # Coordinates fallback if map picker was not moved
    lat = req_in.latitude if req_in.latitude else 11.0168
    lng = req_in.longitude if req_in.longitude else 76.9558

    request_record = EmergencyRequest(
        request_code=req_code,
        requester_id=current_user.id,
        patient_name=req_in.patient_name,
        blood_group=req_in.blood_group,
        units_needed=req_in.units_needed,
        urgency=req_in.urgency.upper(),
        hospital_name=req_in.hospital_name,
        address=req_in.address,
        area=req_in.area,
        city=req_in.city,
        district=resolved_district,
        pincode=req_in.pincode,
        landmark=req_in.landmark,
        latitude=lat,
        longitude=lng,
        description=req_in.description,
        status="SEARCHING",
        chain_rescue_level=1
    )
    db.add(request_record)
    db.commit()
    db.refresh(request_record)

    # 1. Create a dedicated real-time conversation thread for this emergency request
    conversation = Conversation(
        request_id=request_record.id,
        title=f"Emergency Coordination: {req_code}"
    )
    db.add(conversation)
    db.commit()
    db.refresh(conversation)

    # 2. Add initial system message
    sys_msg = Message(
        conversation_id=conversation.id,
        sender_id=None,
        sender_name="Vital Connect Emergency Bot",
        sender_role="SYSTEM",
        message_text=f"Emergency Blood Request {req_code} initiated for {req_in.units_needed} units of {req_in.blood_group} at {req_in.hospital_name}.",
        is_system=True
    )
    db.add(sys_msg)

    # 3. Compute initial immediate matches from nearby Blood Banks and Donors
    nearby_banks = db.query(BloodBank).all()
    for bb in nearby_banks:
        dist = calculate_haversine_distance(lat, lng, bb.latitude, bb.longitude)
        inv = db.query(BloodInventory).filter(
            BloodInventory.blood_bank_id == bb.id,
            BloodInventory.blood_group == req_in.blood_group,
            BloodInventory.units_available > 0
        ).first()
        if inv and dist <= 40.0:
            m = Match(
                request_id=request_record.id,
                blood_bank_id=bb.id,
                match_score=round(max(50.0, 95.0 - dist), 1),
                match_reasons=[
                    f"Blood bank has {inv.units_available} available units of {req_in.blood_group}",
                    f"Distance: {dist} km from {req_in.hospital_name}",
                    "Verified institutional facility"
                ],
                status="PENDING"
            )
            db.add(m)

    nearby_donors = db.query(DonorProfile).join(User).filter(
        DonorProfile.is_available == True,
        User.is_active == True
    ).all()
    for d in nearby_donors:
        if is_blood_compatible(d.blood_group, req_in.blood_group):
            d_lat = d.user.latitude or lat
            d_lng = d.user.longitude or lng
            dist = calculate_haversine_distance(lat, lng, d_lat, d_lng)
            if dist <= 50.0:
                res = calculate_match_score(
                    d.blood_group,
                    req_in.blood_group,
                    dist,
                    is_verified=d.user.is_verified,
                    is_available=d.is_available,
                    emergency_enabled=d.emergency_available,
                    screening_cleared=d.screening_cleared
                )
                if res["score"] >= 40.0:
                    m = Match(
                        request_id=request_record.id,
                        donor_id=d.id,
                        match_score=res["score"],
                        match_reasons=res["reasons"],
                        status="PENDING"
                    )
                    db.add(m)

    # 4. Audit Log
    audit = AuditLog(
        user_id=current_user.id,
        action="EMERGENCY_REQUEST_CREATED",
        resource_type="EMERGENCY_REQUEST",
        resource_id=request_record.id,
        details={"code": req_code, "blood_group": req_in.blood_group, "district": resolved_district}
    )
    db.add(audit)
    db.commit()

    # 5. Broadcast live emergency event to connected WebSocket clients
    await ws_manager.broadcast_emergency({
        "type": "NEW_EMERGENCY_REQUEST",
        "request_code": req_code,
        "blood_group": req_in.blood_group,
        "urgency": req_in.urgency,
        "district": resolved_district,
        "hospital": req_in.hospital_name
    })

    return request_record

@router.get("", response_model=List[EmergencyRequestResponse])
def list_emergency_requests(
    blood_group: Optional[str] = None,
    district: Optional[str] = None,
    urgency: Optional[str] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db)
):
    query = db.query(EmergencyRequest)
    if blood_group:
        query = query.filter(EmergencyRequest.blood_group == blood_group)
    if district and district != "All":
        query = query.filter(EmergencyRequest.district == district)
    if urgency and urgency != "All":
        query = query.filter(EmergencyRequest.urgency == urgency.upper())
    if status_filter and status_filter != "All":
        query = query.filter(EmergencyRequest.status == status_filter.upper())

    return query.order_by(EmergencyRequest.created_at.desc()).limit(100).all()

@router.get("/{request_id}")
def get_emergency_request_detail(request_id: str, db: Session = Depends(get_db)):
    req = db.query(EmergencyRequest).filter(
        (EmergencyRequest.id == request_id) | (EmergencyRequest.request_code == request_id)
    ).first()
    if not req:
        raise HTTPException(status_code=404, detail="Emergency request not found")

    matches = db.query(Match).filter(Match.request_id == req.id).order_by(Match.match_score.desc()).all()
    conversation = db.query(Conversation).filter(Conversation.request_id == req.id).first()

    matches_data = []
    for m in matches:
        entity_name = "Compatible Blood Bank"
        if m.donor:
            entity_name = f"Donor {m.donor.donor_code}"
        elif m.blood_bank:
            entity_name = m.blood_bank.bank_name

        matches_data.append({
            "id": m.id,
            "entity_name": entity_name,
            "score": m.match_score,
            "reasons": m.match_reasons,
            "status": m.status,
            "is_donor": bool(m.donor),
            "donor_code": m.donor.donor_code if m.donor else None,
            "blood_group": m.donor.blood_group if m.donor else None
        })

    return {
        "request": req,
        "matches": matches_data,
        "conversation_id": conversation.id if conversation else None
    }

@router.put("/{request_id}/status")
async def update_request_status(
    request_id: str,
    status_update: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    req = db.query(EmergencyRequest).filter(EmergencyRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")

    new_status = status_update.get("status")
    if new_status:
        req.status = new_status
        db.commit()

        # Add system update to conversation
        convo = db.query(Conversation).filter(Conversation.request_id == req.id).first()
        if convo:
            sys_msg = Message(
                conversation_id=convo.id,
                sender_name="System",
                sender_role="SYSTEM",
                message_text=f"Request status updated to {new_status} by {current_user.full_name} ({current_user.role}).",
                is_system=True
            )
            db.add(sys_msg)
            db.commit()

    return {"status": "success", "new_status": req.status}
