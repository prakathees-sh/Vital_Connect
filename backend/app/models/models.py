import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime,
    ForeignKey, Text, Enum, JSON
)
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(30), nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(30), index=True, nullable=False)  # DONOR, RECIPIENT, HOSPITAL, BLOOD_BANK, ADMIN
    district = Column(String(100), index=True, nullable=False)
    city = Column(String(100), nullable=False)
    address = Column(Text, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    is_verified = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    # Relationships
    donor_profile = relationship("DonorProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    hospital = relationship("Hospital", back_populates="user", uselist=False, cascade="all, delete-orphan")
    blood_bank = relationship("BloodBank", back_populates="user", uselist=False, cascade="all, delete-orphan")
    emergency_requests = relationship("EmergencyRequest", back_populates="requester")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    messages = relationship("Message", back_populates="sender")
    audit_logs = relationship("AuditLog", back_populates="user")


class DonorProfile(Base):
    __tablename__ = "donor_profiles"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    donor_code = Column(String(30), unique=True, index=True, nullable=False)
    blood_group = Column(String(10), index=True, nullable=False)  # A+, A-, B+, B-, AB+, AB-, O+, O-
    age = Column(Integer, nullable=False)
    weight = Column(Float, nullable=True)
    gender = Column(String(20), nullable=True)
    is_available = Column(Boolean, default=True, index=True)
    emergency_available = Column(Boolean, default=True, index=True)
    sms_notifications = Column(Boolean, default=True)
    total_donations = Column(Integer, default=0)
    last_donation_date = Column(DateTime, nullable=True)
    screening_cleared = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    user = relationship("User", back_populates="donor_profile")
    screening_responses = relationship("ScreeningResponse", back_populates="donor", cascade="all, delete-orphan")
    matches = relationship("Match", back_populates="donor")
    donations = relationship("Donation", back_populates="donor")
    achievements = relationship("Achievement", back_populates="donor", cascade="all, delete-orphan")


class ScreeningResponse(Base):
    __tablename__ = "screening_responses"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    donor_id = Column(String(36), ForeignKey("donor_profiles.id", ondelete="CASCADE"), nullable=False)
    answers = Column(JSON, nullable=False)
    is_preliminarily_eligible = Column(Boolean, default=True)
    notes = Column(Text, nullable=True)
    completed_at = Column(DateTime, default=utc_now)

    donor = relationship("DonorProfile", back_populates="screening_responses")


class Hospital(Base):
    __tablename__ = "hospitals"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    hospital_name = Column(String(255), index=True, nullable=False)
    registration_number = Column(String(100), nullable=False)
    district = Column(String(100), index=True, nullable=False)
    address = Column(Text, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    contact_phone = Column(String(30), nullable=False)
    emergency_contact = Column(String(30), nullable=False)
    is_verified = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utc_now)

    user = relationship("User", back_populates="hospital")
    donations = relationship("Donation", back_populates="hospital")


class BloodBank(Base):
    __tablename__ = "blood_banks"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    bank_name = Column(String(255), index=True, nullable=False)
    license_number = Column(String(100), nullable=False)
    district = Column(String(100), index=True, nullable=False)
    address = Column(Text, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    contact_phone = Column(String(30), nullable=False)
    is_verified = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utc_now)

    user = relationship("User", back_populates="blood_bank")
    inventory = relationship("BloodInventory", back_populates="blood_bank", cascade="all, delete-orphan")
    matches = relationship("Match", back_populates="blood_bank")
    donations = relationship("Donation", back_populates="blood_bank")


class BloodInventory(Base):
    __tablename__ = "blood_inventory"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    blood_bank_id = Column(String(36), ForeignKey("blood_banks.id", ondelete="CASCADE"), nullable=False)
    blood_group = Column(String(10), index=True, nullable=False)  # A+, A-, B+, etc.
    units_available = Column(Integer, default=0, nullable=False)
    status = Column(String(30), default="Sufficient", nullable=False)  # Critical, Low, Moderate, Sufficient
    last_updated = Column(DateTime, default=utc_now, onupdate=utc_now)

    blood_bank = relationship("BloodBank", back_populates="inventory")


class EmergencyRequest(Base):
    __tablename__ = "emergency_requests"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    request_code = Column(String(30), unique=True, index=True, nullable=False)  # e.g. VC-REQ-10291
    requester_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    patient_name = Column(String(255), nullable=False)
    blood_group = Column(String(10), index=True, nullable=False)
    units_needed = Column(Integer, nullable=False)
    units_fulfilled = Column(Integer, default=0)
    urgency = Column(String(30), index=True, nullable=False)  # NORMAL, URGENT, CRITICAL, EMERGENCY
    hospital_name = Column(String(255), nullable=False)
    address = Column(Text, nullable=False)
    area = Column(String(150), nullable=True)
    city = Column(String(100), nullable=True)
    district = Column(String(100), index=True, nullable=False)
    pincode = Column(String(20), nullable=True)
    landmark = Column(String(255), nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    description = Column(Text, nullable=False)
    status = Column(String(40), index=True, default="SEARCHING", nullable=False)
    chain_rescue_level = Column(Integer, default=1)  # 1 to 5
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    requester = relationship("User", back_populates="emergency_requests")
    matches = relationship("Match", back_populates="request", cascade="all, delete-orphan")
    donations = relationship("Donation", back_populates="request")
    conversations = relationship("Conversation", back_populates="request", cascade="all, delete-orphan")


class Match(Base):
    __tablename__ = "matches"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    request_id = Column(String(36), ForeignKey("emergency_requests.id", ondelete="CASCADE"), nullable=False)
    donor_id = Column(String(36), ForeignKey("donor_profiles.id", ondelete="CASCADE"), nullable=True)
    blood_bank_id = Column(String(36), ForeignKey("blood_banks.id", ondelete="CASCADE"), nullable=True)
    match_score = Column(Float, nullable=False)  # 0 - 100
    match_reasons = Column(JSON, nullable=False)
    status = Column(String(30), default="PENDING", nullable=False)  # PENDING, CONTACTED, ACCEPTED, REJECTED, COMPLETED
    created_at = Column(DateTime, default=utc_now)

    request = relationship("EmergencyRequest", back_populates="matches")
    donor = relationship("DonorProfile", back_populates="matches")
    blood_bank = relationship("BloodBank", back_populates="matches")


class Donation(Base):
    __tablename__ = "donations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    donor_id = Column(String(36), ForeignKey("donor_profiles.id", ondelete="CASCADE"), nullable=False)
    request_id = Column(String(36), ForeignKey("emergency_requests.id", ondelete="SET NULL"), nullable=True)
    hospital_id = Column(String(36), ForeignKey("hospitals.id", ondelete="SET NULL"), nullable=True)
    blood_bank_id = Column(String(36), ForeignKey("blood_banks.id", ondelete="SET NULL"), nullable=True)
    units_donated = Column(Integer, default=1)
    donation_date = Column(DateTime, default=utc_now)
    certificate_id = Column(String(36), nullable=True)
    notes = Column(Text, nullable=True)

    donor = relationship("DonorProfile", back_populates="donations")
    request = relationship("EmergencyRequest", back_populates="donations")
    hospital = relationship("Hospital", back_populates="donations")
    blood_bank = relationship("BloodBank", back_populates="donations")
    certificate = relationship("Certificate", back_populates="donation", uselist=False)


class Certificate(Base):
    __tablename__ = "certificates"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    certificate_code = Column(String(40), unique=True, index=True, nullable=False)  # VC-CERT-88492
    donation_id = Column(String(36), ForeignKey("donations.id", ondelete="CASCADE"), unique=True, nullable=False)
    donor_name = Column(String(255), nullable=False)
    blood_group = Column(String(10), nullable=False)
    donation_date = Column(DateTime, nullable=False)
    facility_name = Column(String(255), nullable=False)
    district = Column(String(100), nullable=False)
    verification_url = Column(String(255), nullable=False)
    qr_code_data = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now)

    donation = relationship("Donation", back_populates="certificate")


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    request_id = Column(String(36), ForeignKey("emergency_requests.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    request = relationship("EmergencyRequest", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")


class Message(Base):
    __tablename__ = "messages"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    conversation_id = Column(String(36), ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False)
    sender_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    sender_name = Column(String(255), nullable=False)
    sender_role = Column(String(30), nullable=False)
    message_text = Column(Text, nullable=False)
    is_system = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utc_now)

    conversation = relationship("Conversation", back_populates="messages")
    sender = relationship("User", back_populates="messages")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    body = Column(Text, nullable=False)
    type = Column(String(50), default="GENERAL", nullable=False)
    link = Column(String(255), nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utc_now)

    user = relationship("User", back_populates="notifications")


class Achievement(Base):
    __tablename__ = "achievements"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    donor_id = Column(String(36), ForeignKey("donor_profiles.id", ondelete="CASCADE"), nullable=False)
    badge_key = Column(String(50), nullable=False)
    title = Column(String(100), nullable=False)
    description = Column(String(255), nullable=False)
    icon = Column(String(50), nullable=False)
    unlocked_at = Column(DateTime, default=utc_now)

    donor = relationship("DonorProfile", back_populates="achievements")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    action = Column(String(100), nullable=False)
    resource_type = Column(String(100), nullable=False)
    resource_id = Column(String(100), nullable=True)
    ip_address = Column(String(50), nullable=True)
    details = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=utc_now)

    user = relationship("User", back_populates="audit_logs")


class District(Base):
    __tablename__ = "districts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name_en = Column(String(100), unique=True, nullable=False)
    name_ta = Column(String(100), nullable=False)
    zone = Column(String(50), nullable=False)  # North, South, Central, West
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    area_sq_km = Column(Float, nullable=True)
    population = Column(Integer, nullable=True)
    total_donors = Column(Integer, default=0)
    total_blood_banks = Column(Integer, default=0)
    active_requests = Column(Integer, default=0)
