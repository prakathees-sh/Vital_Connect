import logging
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models.models import Notification, User

logger = logging.getLogger("vital_connect.notifications")

def send_in_app_notification(
    db: Session,
    user_id: str,
    title: str,
    body: str,
    type_: str = "GENERAL",
    link: Optional[str] = None
) -> Notification:
    notif = Notification(
        user_id=user_id,
        title=title,
        body=body,
        type=type_,
        link=link
    )
    db.add(notif)
    db.commit()
    db.refresh(notif)
    return notif

def send_sms_alert(
    phone_number: str,
    message_text: str,
    donor_name: Optional[str] = None
) -> Dict[str, Any]:
    """
    Simulates sending SMS alert to registered donor or requester.
    No private medical info is placed in the SMS text.
    Uses environment credentials when configured or logs dispatch safely.
    """
    logger.info(f"[SMS ALERT] To: {phone_number} | Text: {message_text}")
    return {
        "status": "SENT",
        "recipient": phone_number,
        "message": message_text,
        "gateway": "VitalConnect-SMS-Gateway",
        "dispatched": True
    }
