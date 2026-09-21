from fastapi import APIRouter, Query
from typing import Optional, List, Dict, Any
from app.core.tamil_nadu_districts import (
    TAMIL_NADU_DISTRICTS,
    detect_district_from_coords,
    detect_district_from_text,
    resolve_district
)

router = APIRouter(prefix="/districts", tags=["Districts & Geography"])

@router.get("", response_model=List[Dict[str, Any]])
def list_districts():
    """Returns all 38 Tamil Nadu districts with bilingual names, zones, coords, and population."""
    return TAMIL_NADU_DISTRICTS

@router.get("/detect")
def auto_detect_district(
    address: Optional[str] = Query(None, description="Free-text address string"),
    lat: Optional[float] = Query(None, description="Latitude"),
    lng: Optional[float] = Query(None, description="Longitude")
):
    """
    Intelligently determines the Tamil Nadu district from address text or coordinates.
    Does NOT force the user to pick from a giant dropdown.
    """
    detected_district = resolve_district(address or "", lat, lng)
    district_info = next((d for d in TAMIL_NADU_DISTRICTS if d["name_en"] == detected_district), None)

    return {
        "detected_district": detected_district,
        "details": district_info or {"name_en": detected_district, "name_ta": detected_district}
    }
