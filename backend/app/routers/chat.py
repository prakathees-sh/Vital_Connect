from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timezone
from app.core.database import get_db, SessionLocal
from app.routers.auth import get_current_user
from app.models.models import Conversation, Message, EmergencyRequest, User
from app.schemas.schemas import MessageCreate, MessageResponse
from app.websockets.manager import ws_manager

router = APIRouter(prefix="/chat", tags=["Real-Time Chat"])

@router.get("/conversations")
def list_user_conversations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lists emergency request conversations relevant to user's requests or responses."""
    conversations = db.query(Conversation).order_by(Conversation.updated_at.desc()).limit(20).all()

    result = []
    for c in conversations:
        latest_msg = db.query(Message).filter(Message.conversation_id == c.id).order_by(Message.created_at.desc()).first()
        result.append({
            "id": c.id,
            "request_id": c.request_id,
            "request_code": c.request.request_code if c.request else "N/A",
            "blood_group": c.request.blood_group if c.request else "N/A",
            "hospital_name": c.request.hospital_name if c.request else "Emergency Center",
            "title": c.title,
            "latest_message": latest_msg.message_text if latest_msg else "Conversation initiated",
            "latest_time": latest_msg.created_at.isoformat() if latest_msg else c.created_at.isoformat(),
            "updated_at": c.updated_at.isoformat()
        })
    return result

@router.get("/conversations/{conversation_id}/messages", response_model=List[MessageResponse])
def get_conversation_messages(
    conversation_id: str,
    db: Session = Depends(get_db)
):
    msgs = db.query(Message).filter(Message.conversation_id == conversation_id).order_by(Message.created_at.asc()).all()
    return msgs

@router.post("/messages", response_model=MessageResponse)
async def send_chat_message(
    msg_in: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    conversation = db.query(Conversation).filter(Conversation.id == msg_in.conversation_id).first()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation thread not found")

    message = Message(
        conversation_id=conversation.id,
        sender_id=current_user.id,
        sender_name=current_user.full_name,
        sender_role=current_user.role,
        message_text=msg_in.message_text,
        is_system=False
    )
    db.add(message)
    conversation.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(message)

    # Broadcast to live WebSockets in this conversation
    payload = {
        "id": message.id,
        "conversation_id": message.conversation_id,
        "sender_id": message.sender_id,
        "sender_name": message.sender_name,
        "sender_role": message.sender_role,
        "message_text": message.message_text,
        "is_system": message.is_system,
        "created_at": message.created_at.isoformat()
    }
    await ws_manager.broadcast_to_conversation(conversation.id, payload)

    return message

@router.websocket("/ws/{conversation_id}")
async def chat_websocket_endpoint(websocket: WebSocket, conversation_id: str):
    await ws_manager.connect(websocket, conversation_id)
    db = SessionLocal()
    try:
        while True:
            data = await websocket.receive_json()
            # Incoming message
            text = data.get("message_text", "")
            sender_id = data.get("sender_id")
            sender_name = data.get("sender_name", "Anonymous")
            sender_role = data.get("sender_role", "DONOR")

            if text.strip():
                msg = Message(
                    conversation_id=conversation_id,
                    sender_id=sender_id,
                    sender_name=sender_name,
                    sender_role=sender_role,
                    message_text=text,
                    is_system=False
                )
                db.add(msg)
                db.commit()
                db.refresh(msg)

                msg_payload = {
                    "id": msg.id,
                    "conversation_id": conversation_id,
                    "sender_id": msg.sender_id,
                    "sender_name": msg.sender_name,
                    "sender_role": msg.sender_role,
                    "message_text": msg.message_text,
                    "is_system": False,
                    "created_at": msg.created_at.isoformat()
                }
                await ws_manager.broadcast_to_conversation(conversation_id, msg_payload)
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, conversation_id)
    finally:
        db.close()
