from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import Response
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional, List, Dict, Any
from app.core.database import get_db
from app.routers.auth import get_current_user
from app.models.models import (
    User, EmergencyRequest, BloodInventory, BloodBank, Hospital,
    DonorProfile, Donation, AuditLog
)
from app.services.pdf_service import generate_inventory_report_pdf

router = APIRouter(prefix="/admin", tags=["Admin Command Center"])

def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Admin privileges required")
    return current_user

@router.get("/overview")
def get_admin_overview(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    total_users = db.query(User).count()
    total_donors = db.query(DonorProfile).count()
    total_hospitals = db.query(Hospital).count()
    total_banks = db.query(BloodBank).count()

    total_requests = db.query(EmergencyRequest).count()
    active_requests = db.query(EmergencyRequest).filter(EmergencyRequest.status.in_(["SEARCHING", "CHAIN_RESCUE_ACTIVE", "MATCHED"])).count()
    fulfilled_requests = db.query(EmergencyRequest).filter(EmergencyRequest.status == "FULFILLED").count()

    total_units = db.query(func.sum(BloodInventory.units_available)).scalar() or 0
    total_donations = db.query(Donation).count()

    # Fulfillment rate
    fulfillment_rate = round((fulfilled_requests / max(1, total_requests)) * 100.0, 1)

    return {
        "metrics": {
            "total_users": total_users,
            "total_donors": total_donors,
            "total_hospitals": total_hospitals,
            "total_blood_banks": total_banks,
            "total_requests": total_requests,
            "active_requests": active_requests,
            "fulfilled_requests": fulfilled_requests,
            "fulfillment_rate_percent": fulfillment_rate,
            "total_units_in_stock": int(total_units),
            "total_donations_completed": total_donations
        }
    }

@router.get("/users")
def list_users(
    role: Optional[str] = None,
    district: Optional[str] = None,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    query = db.query(User)
    if role and role != "All":
        query = query.filter(User.role == role.upper())
    if district and district != "All":
        query = query.filter(User.district == district)

    users = query.order_by(User.created_at.desc()).limit(100).all()
    return [
        {
            "id": u.id,
            "full_name": u.full_name,
            "email": u.email,
            "phone": u.phone,
            "role": u.role,
            "district": u.district,
            "city": u.city,
            "is_verified": u.is_verified,
            "is_active": u.is_active,
            "created_at": u.created_at.isoformat()
        }
        for u in users
    ]

@router.put("/users/{user_id}/verify")
def toggle_user_verification(
    user_id: str,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_verified = not user.is_verified

    # Audit log
    audit = AuditLog(
        user_id=admin.id,
        action="USER_VERIFICATION_TOGGLED",
        resource_type="USER",
        resource_id=user.id,
        details={"verified_status": user.is_verified, "target_email": user.email}
    )
    db.add(audit)
    db.commit()

    return {"status": "success", "is_verified": user.is_verified}

@router.get("/audit-logs")
def get_audit_logs(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(50).all()
    return [
        {
            "id": log.id,
            "user_id": log.user_id,
            "user_email": log.user.email if log.user else "System",
            "action": log.action,
            "resource_type": log.resource_type,
            "resource_id": log.resource_id,
            "details": log.details,
            "created_at": log.created_at.isoformat()
        }
        for log in logs
    ]

@router.get("/reports/inventory-pdf")
def download_inventory_report_pdf(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Generates official downloadable PDF of current state inventory."""
    items = db.query(BloodInventory).join(BloodBank).all()
    inventory_data = [
        {
            "bank_name": i.blood_bank.bank_name,
            "district": i.blood_bank.district,
            "blood_group": i.blood_group,
            "units_available": i.units_available,
            "status": i.status
        }
        for i in items
    ]

    pdf_stream = generate_inventory_report_pdf(inventory_data, admin_name=admin.full_name)

    return Response(
        content=pdf_stream.getvalue(),
        media_type="application/pdf",
        headers={
            "Content-Disposition": "attachment; filename=VitalConnect_Inventory_Report.pdf"
        }
    )
