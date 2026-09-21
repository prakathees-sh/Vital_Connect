import random
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_password_hash, verify_password, create_access_token, decode_access_token
from app.core.tamil_nadu_districts import resolve_district
from app.models.models import User, DonorProfile, Hospital, BloodBank, AuditLog
from app.schemas.schemas import UserRegister, UserLogin, Token, UserResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication token")
    user = db.query(User).filter(User.id == payload["sub"]).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found or inactive")
    return user

@router.post("/register", response_model=Token)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email.lower()).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email is already registered")

    # Auto-resolve district if missing
    resolved_district = user_in.district or resolve_district(
        f"{user_in.address or ''} {user_in.city}",
        user_in.latitude,
        user_in.longitude
    )

    user = User(
        email=user_in.email.lower(),
        phone=user_in.phone,
        password_hash=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role=user_in.role.upper(),
        district=resolved_district,
        city=user_in.city,
        address=user_in.address,
        latitude=user_in.latitude or 13.0827,
        longitude=user_in.longitude or 80.2707,
        is_verified=(user_in.role.upper() == "RECIPIENT"),  # Recipients default verified
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Automatically create sub-profile based on role
    if user.role == "DONOR":
        donor_code = f"VC-DON-{random.randint(10000, 99999)}"
        profile = DonorProfile(
            user_id=user.id,
            donor_code=donor_code,
            blood_group="O+",  # Initial default, updated during onboarding
            age=25,
            is_available=True,
            emergency_available=True,
            screening_cleared=False
        )
        db.add(profile)
    elif user.role == "HOSPITAL":
        hosp = Hospital(
            user_id=user.id,
            hospital_name=user.full_name,
            registration_number=f"TN-MED-{random.randint(1000, 9999)}",
            district=user.district,
            address=user.address or f"{user.city}, Tamil Nadu",
            latitude=user.latitude,
            longitude=user.longitude,
            contact_phone=user.phone,
            emergency_contact=user.phone,
            is_verified=False
        )
        db.add(hosp)
    elif user.role == "BLOOD_BANK":
        bank = BloodBank(
            user_id=user.id,
            bank_name=user.full_name,
            license_number=f"TN-BB-{random.randint(1000, 9999)}",
            district=user.district,
            address=user.address or f"{user.city}, Tamil Nadu",
            latitude=user.latitude,
            longitude=user.longitude,
            contact_phone=user.phone,
            is_verified=False
        )
        db.add(bank)

    # Log action
    audit = AuditLog(
        user_id=user.id,
        action="USER_REGISTERED",
        resource_type="USER",
        resource_id=user.id,
        details={"role": user.role, "district": user.district}
    )
    db.add(audit)
    db.commit()

    token = create_access_token(user.id, user.role)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "district": user.district,
            "city": user.city,
            "is_verified": user.is_verified
        }
    }

@router.post("/login", response_model=Token)
def login(login_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_in.email.lower()).first()
    if not user or not verify_password(login_in.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is deactivated")

    # Record login
    audit = AuditLog(
        user_id=user.id,
        action="USER_LOGIN",
        resource_type="USER",
        resource_id=user.id
    )
    db.add(audit)
    db.commit()

    token = create_access_token(user.id, user.role)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "district": user.district,
            "city": user.city,
            "is_verified": user.is_verified
        }
    }

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/verify-email")
def verify_email(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    current_user.is_verified = True
    db.commit()
    db.refresh(current_user)
    return {"status": "success", "message": "Email verified successfully", "is_verified": current_user.is_verified}

@router.post("/verify-phone")
def verify_phone(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    current_user.is_verified = True
    db.commit()
    db.refresh(current_user)
    return {"status": "success", "message": "Phone number verified successfully", "is_verified": current_user.is_verified}
