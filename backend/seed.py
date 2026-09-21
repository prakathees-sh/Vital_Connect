import sys
import os
import random
from datetime import datetime, timedelta, timezone

# Add parent directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.core.database import SessionLocal, engine, Base
from app.core.security import get_password_hash
from app.core.tamil_nadu_districts import TAMIL_NADU_DISTRICTS
from app.models.models import (
    User, DonorProfile, ScreeningResponse, Hospital, BloodBank,
    BloodInventory, EmergencyRequest, Match, Donation, Certificate,
    Conversation, Message, Notification, Achievement, AuditLog, District
)

BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

def seed_database():
    print("🌱 Initializing database schema...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if already seeded
        if db.query(User).filter(User.email == "admin@vitalconnect.org").first():
            print("Database already contains seed data. Refreshing...")

        # 1. Seed all 38 Tamil Nadu Districts
        print("📍 Seeding 38 Tamil Nadu Districts...")
        for d in TAMIL_NADU_DISTRICTS:
            existing_d = db.query(District).filter(District.name_en == d["name_en"]).first()
            if not existing_d:
                dist_obj = District(
                    name_en=d["name_en"],
                    name_ta=d["name_ta"],
                    zone=d["zone"],
                    latitude=d["lat"],
                    longitude=d["lng"],
                    population=d.get("population", 1500000),
                    total_donors=random.randint(40, 250),
                    total_blood_banks=random.randint(3, 15),
                    active_requests=random.randint(1, 6)
                )
                db.add(dist_obj)
        db.commit()

        # 2. Seed Admin User
        admin_email = "admin@vitalconnect.org"
        admin = db.query(User).filter(User.email == admin_email).first()
        if not admin:
            admin = User(
                email=admin_email,
                phone="+919876543210",
                password_hash=get_password_hash("AdminPassword123!"),
                full_name="Dr. Sundararajan (Admin Director)",
                role="ADMIN",
                district="Chennai",
                city="Chennai",
                address="Vital Connect Central Operations, Anna Salai, Chennai",
                latitude=13.0827,
                longitude=80.2707,
                is_verified=True,
                is_active=True
            )
            db.add(admin)
            db.commit()
            db.refresh(admin)
            print(f"Created Admin: {admin_email}")

        # 3. Seed Major Hospitals
        hospitals_data = [
            {"name": "Rajiv Gandhi Government General Hospital", "dist": "Chennai", "city": "Chennai", "lat": 13.0805, "lng": 80.2798, "phone": "+914425305000"},
            {"name": "Apollo Hospitals Greams Road", "dist": "Chennai", "city": "Chennai", "lat": 13.0569, "lng": 80.2527, "phone": "+914428290200"},
            {"name": "Coimbatore Medical College Hospital", "dist": "Coimbatore", "city": "Coimbatore", "lat": 11.0028, "lng": 76.9691, "phone": "+914222301393"},
            {"name": "Ganga Hospital", "dist": "Coimbatore", "city": "Coimbatore", "lat": 11.0264, "lng": 76.9426, "phone": "+914222485000"},
            {"name": "Government Rajaji Hospital", "dist": "Madurai", "city": "Madurai", "lat": 9.9324, "lng": 78.1332, "phone": "+914522532535"},
            {"name": "Meenakshi Mission Hospital", "dist": "Madurai", "city": "Madurai", "lat": 9.9678, "lng": 78.1634, "phone": "+914524263000"},
            {"name": "Mahatma Gandhi Memorial Govt Hospital", "dist": "Tiruchirappalli", "city": "Tiruchirappalli", "lat": 10.8122, "lng": 78.6853, "phone": "+914312415152"},
            {"name": "Govt Mohan Kumaramangalam Medical College", "dist": "Salem", "city": "Salem", "lat": 11.6612, "lng": 78.1408, "phone": "+914272383313"},
            {"name": "Tirunelveli Medical College Hospital", "dist": "Tirunelveli", "city": "Tirunelveli", "lat": 8.7188, "lng": 77.7472, "phone": "+914622572733"},
            {"name": "Christian Medical College Hospital", "dist": "Vellore", "city": "Vellore", "lat": 12.9248, "lng": 79.1350, "phone": "+914162281000"},
        ]

        hospitals_objs = []
        for i, h in enumerate(hospitals_data):
            h_email = f"hospital{i+1}@{h['dist'].lower().replace(' ', '')}med.org"
            u = db.query(User).filter(User.email == h_email).first()
            if not u:
                u = User(
                    email=h_email,
                    phone=h["phone"],
                    password_hash=get_password_hash("HospitalPass123!"),
                    full_name=h["name"],
                    role="HOSPITAL",
                    district=h["dist"],
                    city=h["city"],
                    address=f"{h['name']}, {h['city']}, Tamil Nadu",
                    latitude=h["lat"],
                    longitude=h["lng"],
                    is_verified=True,
                    is_active=True
                )
                db.add(u)
                db.commit()
                db.refresh(u)

                hosp_obj = Hospital(
                    user_id=u.id,
                    hospital_name=h["name"],
                    registration_number=f"TN-HOSP-{1000 + i}",
                    district=h["dist"],
                    address=f"{h['name']}, {h['city']}, Tamil Nadu",
                    latitude=h["lat"],
                    longitude=h["lng"],
                    contact_phone=h["phone"],
                    emergency_contact=h["phone"],
                    is_verified=True
                )
                db.add(hosp_obj)
                db.commit()
                db.refresh(hosp_obj)
                hospitals_objs.append(hosp_obj)

        # 4. Seed Blood Banks and Inventories
        banks_data = [
            {"name": "Tamil Nadu State Blood Transfusion Center", "dist": "Chennai", "city": "Chennai", "lat": 13.0838, "lng": 80.2707, "phone": "+914428190001"},
            {"name": "Rotary Central Blood Bank", "dist": "Chennai", "city": "Chennai", "lat": 13.0604, "lng": 80.2496, "phone": "+914428264567"},
            {"name": "Coimbatore Blood Bank Society", "dist": "Coimbatore", "city": "Coimbatore", "lat": 11.0183, "lng": 76.9602, "phone": "+914222212345"},
            {"name": "Indian Red Cross Society Blood Center", "dist": "Madurai", "city": "Madurai", "lat": 9.9200, "lng": 78.1150, "phone": "+914522345678"},
            {"name": "Trichy Voluntary Blood Donors Bank", "dist": "Tiruchirappalli", "city": "Tiruchirappalli", "lat": 10.7950, "lng": 78.6900, "phone": "+914312700123"},
            {"name": "Salem Voluntary Blood Bank", "dist": "Salem", "city": "Salem", "lat": 11.6680, "lng": 78.1420, "phone": "+914272445566"},
        ]

        bank_objs = []
        for i, b in enumerate(banks_data):
            b_email = f"bloodbank{i+1}@{b['dist'].lower().replace(' ', '')}bb.org"
            u = db.query(User).filter(User.email == b_email).first()
            if not u:
                u = User(
                    email=b_email,
                    phone=b["phone"],
                    password_hash=get_password_hash("BloodBankPass123!"),
                    full_name=b["name"],
                    role="BLOOD_BANK",
                    district=b["dist"],
                    city=b["city"],
                    address=f"{b['name']}, {b['city']}, Tamil Nadu",
                    latitude=b["lat"],
                    longitude=b["lng"],
                    is_verified=True,
                    is_active=True
                )
                db.add(u)
                db.commit()
                db.refresh(u)

                bb_obj = BloodBank(
                    user_id=u.id,
                    bank_name=b["name"],
                    license_number=f"TN-BB-LIC-{2000 + i}",
                    district=b["dist"],
                    address=f"{b['name']}, {b['city']}, Tamil Nadu",
                    latitude=b["lat"],
                    longitude=b["lng"],
                    contact_phone=b["phone"],
                    is_verified=True
                )
                db.add(bb_obj)
                db.commit()
                db.refresh(bb_obj)
                bank_objs.append(bb_obj)

                # Seed Inventory for all 8 blood groups
                for bg in BLOOD_GROUPS:
                    # Rare groups have lower stock
                    if bg in ["AB-", "B-", "A-"]:
                        units = random.randint(2, 8)
                        stat = "Low"
                    elif bg == "O-":
                        units = random.randint(1, 5)
                        stat = "Critical"
                    else:
                        units = random.randint(15, 60)
                        stat = "Sufficient" if units > 25 else "Moderate"

                    inv = BloodInventory(
                        blood_bank_id=bb_obj.id,
                        blood_group=bg,
                        units_available=units,
                        status=stat,
                        last_updated=datetime.now(timezone.utc) - timedelta(hours=random.randint(1, 12))
                    )
                    db.add(inv)
                db.commit()

        # 5. Seed Donors with Profiles and Badges
        donors_seed = [
            {"name": "Karthik Subramanian", "email": "karthik.s@example.com", "phone": "+919840123456", "dist": "Coimbatore", "city": "Coimbatore", "bg": "O+", "age": 28, "weight": 68.0, "lat": 11.0168, "lng": 76.9558, "donations": 4},
            {"name": "Ananya Ramachandran", "email": "ananya.r@example.com", "phone": "+919840234567", "dist": "Chennai", "city": "Chennai", "bg": "A+", "age": 24, "weight": 56.0, "lat": 13.0600, "lng": 80.2400, "donations": 2},
            {"name": "Muthu Vel", "email": "muthu.v@example.com", "phone": "+919840345678", "dist": "Madurai", "city": "Madurai", "bg": "B+", "age": 32, "weight": 74.0, "lat": 9.9250, "lng": 78.1190, "donations": 6},
            {"name": "Divya Priya", "email": "divya.p@example.com", "phone": "+919840456789", "dist": "Tiruchirappalli", "city": "Tiruchirappalli", "bg": "O-", "age": 29, "weight": 58.0, "lat": 10.7900, "lng": 78.7000, "donations": 3},
            {"name": "Saravanan Kumar", "email": "saravanan.k@example.com", "phone": "+919840567890", "dist": "Salem", "city": "Salem", "bg": "AB+", "age": 35, "weight": 80.0, "lat": 11.6640, "lng": 78.1450, "donations": 5},
            {"name": "Meera Venkatesh", "email": "meera.v@example.com", "phone": "+919840678901", "dist": "Coimbatore", "city": "Coimbatore", "bg": "A-", "age": 27, "weight": 52.0, "lat": 11.0250, "lng": 76.9650, "donations": 1},
            {"name": "Aravindhan Selvam", "email": "aravind.s@example.com", "phone": "+919840789012", "dist": "Chennai", "city": "Chennai", "bg": "O+", "age": 30, "weight": 70.0, "lat": 13.0850, "lng": 80.2650, "donations": 7},
            {"name": "Pavithra Natarajan", "email": "pavithra.n@example.com", "phone": "+919840890123", "dist": "Tirunelveli", "city": "Tirunelveli", "bg": "B-", "age": 26, "weight": 54.0, "lat": 8.7200, "lng": 77.7500, "donations": 2},
        ]

        donor_profiles = []
        for i, d in enumerate(donors_seed):
            u = db.query(User).filter(User.email == d["email"]).first()
            if not u:
                u = User(
                    email=d["email"],
                    phone=d["phone"],
                    password_hash=get_password_hash("DonorPass123!"),
                    full_name=d["name"],
                    role="DONOR",
                    district=d["dist"],
                    city=d["city"],
                    address=f"{d['city']}, Tamil Nadu",
                    latitude=d["lat"],
                    longitude=d["lng"],
                    is_verified=True,
                    is_active=True
                )
                db.add(u)
                db.commit()
                db.refresh(u)

                dp = DonorProfile(
                    user_id=u.id,
                    donor_code=f"VC-DON-{10100 + i}",
                    blood_group=d["bg"],
                    age=d["age"],
                    weight=d["weight"],
                    gender="Not Specified",
                    is_available=True,
                    emergency_available=True,
                    sms_notifications=True,
                    total_donations=d["donations"],
                    last_donation_date=datetime.now(timezone.utc) - timedelta(days=random.randint(60, 180)),
                    screening_cleared=True
                )
                db.add(dp)
                db.commit()
                db.refresh(dp)
                donor_profiles.append(dp)

                # Seed achievements
                achievements_list = [
                    ("first_donation", "First Step Lifesaver", "Completed maiden voluntary blood donation", "Award"),
                    ("emergency_responder", "Emergency Responder", "Active rapid-response opt-in for critical requests", "Zap"),
                    ("community_hero", "Community Guardian", "Contributed over 3 successful donation cycles", "ShieldCheck")
                ]
                for key, title, desc, icon in achievements_list:
                    ach = Achievement(
                        donor_id=dp.id,
                        badge_key=key,
                        title=title,
                        description=desc,
                        icon=icon
                    )
                    db.add(ach)
                db.commit()

        # 6. Seed Sample Emergency Requests
        sample_requests = [
            {
                "code": "VC-REQ-10291",
                "patient": "K. Meenakshi (Trauma ICU)",
                "bg": "O+",
                "units": 2,
                "urgency": "EMERGENCY",
                "hosp": "Coimbatore Medical College Hospital",
                "addr": "Avinashi Road, Civil Aerodrome Post, Peelamedu",
                "area": "Peelamedu",
                "city": "Coimbatore",
                "dist": "Coimbatore",
                "lat": 11.0028,
                "lng": 76.9691,
                "desc": "Urgent requirement of 2 units of O+ blood for post-operative trauma patient in ICU Bed 4. Cross-matching in progress.",
                "status": "SEARCHING",
                "level": 2
            },
            {
                "code": "VC-REQ-10344",
                "patient": "R. Selvaraj (Cardiothoracic Surgery)",
                "bg": "A+",
                "units": 3,
                "urgency": "CRITICAL",
                "hosp": "Rajiv Gandhi Government General Hospital",
                "addr": "EVR Periyar Salai, Park Town",
                "area": "Park Town",
                "city": "Chennai",
                "dist": "Chennai",
                "lat": 13.0805,
                "lng": 80.2798,
                "desc": "Immediate need of 3 units of A+ blood for emergency cardiac surgery scheduled today. Hospital blood bank supply running low.",
                "status": "CHAIN_RESCUE_ACTIVE",
                "level": 3
            },
            {
                "code": "VC-REQ-10412",
                "patient": "Baby of Lakshmi (Pediatric Ward)",
                "bg": "O-",
                "units": 1,
                "urgency": "EMERGENCY",
                "hosp": "Government Rajaji Hospital",
                "addr": "Panagal Road, Shenoy Nagar",
                "area": "Shenoy Nagar",
                "city": "Madurai",
                "dist": "Madurai",
                "lat": 9.9324,
                "lng": 78.1332,
                "desc": "Extremely rare O- negative blood needed for pediatric exchange transfusion. Universal donor search initiated.",
                "status": "SEARCHING",
                "level": 1
            }
        ]

        for sreq in sample_requests:
            existing_req = db.query(EmergencyRequest).filter(EmergencyRequest.request_code == sreq["code"]).first()
            if not existing_req:
                req_obj = EmergencyRequest(
                    request_code=sreq["code"],
                    requester_id=admin.id,
                    patient_name=sreq["patient"],
                    blood_group=sreq["bg"],
                    units_needed=sreq["units"],
                    urgency=sreq["urgency"],
                    hospital_name=sreq["hosp"],
                    address=sreq["addr"],
                    area=sreq["area"],
                    city=sreq["city"],
                    district=sreq["dist"],
                    latitude=sreq["lat"],
                    longitude=sreq["lng"],
                    description=sreq["desc"],
                    status=sreq["status"],
                    chain_rescue_level=sreq["level"]
                )
                db.add(req_obj)
                db.commit()
                db.refresh(req_obj)

                # Conversation
                convo = Conversation(
                    request_id=req_obj.id,
                    title=f"Emergency Coordination: {sreq['code']}"
                )
                db.add(convo)
                db.commit()
                db.refresh(convo)

                # Messages
                m1 = Message(
                    conversation_id=convo.id,
                    sender_id=None,
                    sender_name="Vital Connect Emergency Bot",
                    sender_role="SYSTEM",
                    message_text=f"Emergency Blood Request {sreq['code']} created for {sreq['units']} units of {sreq['bg']} at {sreq['hosp']}.",
                    is_system=True
                )
                m2 = Message(
                    conversation_id=convo.id,
                    sender_id=admin.id,
                    sender_name="Hospital Duty Officer",
                    sender_role="HOSPITAL",
                    message_text="Emergency team is ready. Please reach out if you are within 30 minutes transit distance.",
                    is_system=False
                )
                db.add_all([m1, m2])
                db.commit()

        # 7. Seed Sample Certificate for Demo
        if donor_profiles:
            dp = donor_profiles[0]
            existing_cert = db.query(Certificate).filter(Certificate.certificate_code == "VC-CERT-88492").first()
            if not existing_cert:
                don = Donation(
                    donor_id=dp.id,
                    units_donated=1,
                    donation_date=datetime.now(timezone.utc) - timedelta(days=12),
                    notes="Voluntary whole blood donation during emergency drive."
                )
                db.add(don)
                db.commit()
                db.refresh(don)

                cert = Certificate(
                    certificate_code="VC-CERT-88492",
                    donation_id=don.id,
                    donor_name=dp.user.full_name,
                    blood_group=dp.blood_group,
                    donation_date=datetime.now(timezone.utc) - timedelta(days=12),
                    facility_name="Coimbatore Medical College Hospital",
                    district="Coimbatore",
                    verification_url="http://localhost:3000/verify/certificate/VC-CERT-88492"
                )
                db.add(cert)
                db.commit()
                print("Created Sample Certificate VC-CERT-88492")

        print("✅ Database seeding completed successfully!")
    except Exception as e:
        db.rollback()
        print(f"❌ Error during seeding: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
