from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# --- Auth & User ---
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str
    phone: str
    role: str = "DONOR"  # DONOR, RECIPIENT, HOSPITAL, BLOOD_BANK, ADMIN
    district: str
    city: str
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    phone: str
    role: str
    district: str
    city: str
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    is_verified: bool
    is_active: bool

# --- Donor & Screening ---
class ScreeningInput(BaseModel):
    answers: Dict[str, Any]
    # Answers to: age, weight, fever, medications, surgery, dental, tattoos,
    # recent_donation, alcohol, conditions, previous_deferral, willing_to_screen, emergency_ready, sms_opt_in

class DonorProfileCreate(BaseModel):
    blood_group: str
    age: int
    weight: Optional[float] = None
    gender: Optional[str] = None
    is_available: bool = True
    emergency_available: bool = True
    sms_notifications: bool = True

class DonorProfileResponse(BaseModel):
    id: str
    donor_code: str
    blood_group: str
    age: int
    weight: Optional[float] = None
    gender: Optional[str] = None
    is_available: bool
    emergency_available: bool
    sms_notifications: bool
    total_donations: int
    last_donation_date: Optional[datetime] = None
    screening_cleared: bool
    user: UserResponse

# --- Emergency Request ---
class EmergencyRequestCreate(BaseModel):
    patient_name: str
    blood_group: str
    units_needed: int = Field(..., ge=1, le=50)
    urgency: str = "URGENT"  # NORMAL, URGENT, CRITICAL, EMERGENCY
    hospital_name: str
    address: str
    area: Optional[str] = None
    city: Optional[str] = None
    district: Optional[str] = None  # If not provided, will be auto-detected!
    pincode: Optional[str] = None
    landmark: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    description: str

class EmergencyRequestResponse(BaseModel):
    id: str
    request_code: str
    patient_name: str
    blood_group: str
    units_needed: int
    units_fulfilled: int
    urgency: str
    hospital_name: str
    address: str
    area: Optional[str] = None
    city: Optional[str] = None
    district: str
    pincode: Optional[str] = None
    landmark: Optional[str] = None
    latitude: float
    longitude: float
    description: str
    status: str
    chain_rescue_level: int
    created_at: datetime
    updated_at: datetime

# --- Inventory ---
class InventoryItemResponse(BaseModel):
    id: str
    blood_bank_id: str
    bank_name: str
    district: str
    blood_group: str
    units_available: int
    status: str
    last_updated: datetime

class InventoryUpdateRequest(BaseModel):
    units_available: int
    status: Optional[str] = None

# --- Chat ---
class MessageCreate(BaseModel):
    conversation_id: str
    message_text: str

class MessageResponse(BaseModel):
    id: str
    conversation_id: str
    sender_id: Optional[str]
    sender_name: str
    sender_role: str
    message_text: str
    is_system: bool
    created_at: datetime

# --- Certificates ---
class CertificateResponse(BaseModel):
    id: str
    certificate_code: str
    donor_name: str
    blood_group: str
    donation_date: datetime
    facility_name: str
    district: str
    verification_url: str
