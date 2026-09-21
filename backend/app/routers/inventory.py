from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
from app.core.database import get_db
from app.routers.auth import get_current_user
from app.models.models import BloodInventory, BloodBank, User
from app.schemas.schemas import InventoryUpdateRequest

router = APIRouter(prefix="/inventory", tags=["Blood Inventory & Availability"])

BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

@router.get("/summary")
def get_inventory_summary(
    district: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Returns aggregated availability summary across all 8 blood groups.
    Used for landing page preview, hero stats, and dashboard overview.
    """
    query = db.query(
        BloodInventory.blood_group,
        func.sum(BloodInventory.units_available).label("total_units")
    ).join(BloodBank)

    if district and district != "All":
        query = query.filter(BloodBank.district == district)

    results = query.group_by(BloodInventory.blood_group).all()
    group_map = {r[0]: int(r[1] or 0) for r in results}

    summary = []
    for bg in BLOOD_GROUPS:
        units = group_map.get(bg, 0)
        # Status calculation
        if units == 0:
            status = "Critical"
        elif units < 10:
            status = "Low"
        elif units < 30:
            status = "Moderate"
        else:
            status = "Sufficient"

        summary.append({
            "blood_group": bg,
            "units_available": units,
            "status": status,
            "last_updated": datetime.now(timezone.utc).isoformat()
        })

    return {
        "district": district or "All Tamil Nadu",
        "total_units_statewide": sum(s["units_available"] for s in summary),
        "groups": summary
    }

@router.get("/items")
def list_inventory_items(
    blood_group: Optional[str] = None,
    district: Optional[str] = None,
    bank_id: Optional[str] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db)
):
    """Lists granular inventory entries per blood bank facility."""
    query = db.query(BloodInventory).join(BloodBank)

    if blood_group and blood_group != "All":
        query = query.filter(BloodInventory.blood_group == blood_group)
    if district and district != "All":
        query = query.filter(BloodBank.district == district)
    if bank_id:
        query = query.filter(BloodInventory.blood_bank_id == bank_id)
    if status_filter and status_filter != "All":
        query = query.filter(BloodInventory.status == status_filter)

    items = query.order_by(BloodBank.district.asc(), BloodInventory.blood_group.asc()).limit(150).all()

    return [
        {
            "id": item.id,
            "blood_bank_id": item.blood_bank_id,
            "bank_name": item.blood_bank.bank_name,
            "district": item.blood_bank.district,
            "blood_group": item.blood_group,
            "units_available": item.units_available,
            "status": item.status,
            "contact_phone": item.blood_bank.contact_phone,
            "last_updated": item.last_updated.isoformat() if item.last_updated else datetime.now(timezone.utc).isoformat()
        }
        for item in items
    ]

@router.put("/items/{item_id}")
def update_inventory_item(
    item_id: str,
    update_in: InventoryUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    item = db.query(BloodInventory).filter(BloodInventory.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found")

    item.units_available = update_in.units_available
    if update_in.status:
        item.status = update_in.status
    else:
        if item.units_available == 0:
            item.status = "Critical"
        elif item.units_available < 10:
            item.status = "Low"
        elif item.units_available < 30:
            item.status = "Moderate"
        else:
            item.status = "Sufficient"

    item.last_updated = datetime.now(timezone.utc)
    db.commit()
    db.refresh(item)

    return {"status": "success", "item": item}
