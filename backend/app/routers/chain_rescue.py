from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.routers.auth import get_current_user
from app.models.models import User, EmergencyRequest
from app.services.chain_rescue_service import get_chain_rescue_state, escalate_chain_rescue

router = APIRouter(prefix="/chain-rescue", tags=["Chain Rescue"])

@router.get("/{request_id}")
def get_chain_rescue(request_id: str, db: Session = Depends(get_db)):
    """Retrieves 5-level progressive expansion data for an emergency request."""
    result = get_chain_rescue_state(db, request_id)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result

@router.post("/{request_id}/escalate")
def escalate_rescue_level(
    request_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Escalates Chain Rescue search radius to the next level (Levels 1 to 5)."""
    result = escalate_chain_rescue(db, request_id)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result
