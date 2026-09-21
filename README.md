# 🩸 VITAL CONNECT

### Intelligent Emergency Blood Coordination Platform
> *"Connecting people, hospitals, and blood sources when every second matters."*

---

## 🌟 Overview

**Vital Connect** is an intelligent, full-stack emergency blood coordination platform built from scratch to bridge individuals, healthcare clinics, and blood banks when critical blood units are needed urgently.

Targeting all **38 Tamil Nadu districts**, the system combines real-time algorithmic ABO/Rh compatibility matching, geographic proximity calculations, automated address and district detection, dynamic multi-tier **Chain Rescue** escalation, Scikit-Learn machine-learning blood demand forecasting, and real PDF generation with secure QR verification.

---

## 🚀 Core Features

### 1. Tamil Nadu 38-District Geographic Engine
- Complete dataset covering all **38 districts of Tamil Nadu** (Chennai, Coimbatore, Madurai, Tiruchirappalli, Salem, Tirunelveli, The Nilgiris, etc.) with centroids, zone classifications, and demographic weightings.
- **Smart Location System**: Users are **never forced** through giant dropdowns. They input natural addresses, areas, or landmarks, or drag a marker on an interactive Leaflet/OpenStreetMap picker.
- **Automated District Resolution**: High-accuracy text analysis and Haversine spatial proximity auto-detects the district while allowing manual adjustments.

### 2. Signature Chain Rescue Engine
- When an emergency request is created and cannot be immediately fulfilled locally, Chain Rescue progressively expands the search perimeter across 5 tactical tiers:
  - **Level 1**: Immediate Blood Banks (0 – 15 km)
  - **Level 2**: Nearby Compatible Verified Donors (0 – 30 km)
  - **Level 3**: District-Wide Coordination (0 – 60 km)
  - **Level 4**: Regional Cluster Search (0 – 120 km)
  - **Level 5**: Statewide Emergency Escalation (All 38 Districts)
- Visual animated radar showing live search rings, blips, candidate counts, and escalation triggers.

### 3. Intelligent Matching Algorithm
- Multi-factor compatibility scoring (0 – 100%):
  - **ABO/Rh Compatibility**: Universal donor ($O^-$), Universal recipient ($AB^+$), and identical group point weightings.
  - **Geographic Distance**: Inverse distance decay using Haversine spherical math.
  - **Readiness & Credential Verification**: Verified status, availability toggle, emergency quick-responder opt-in.
- Clear itemized breakdown displayed for clinical coordinators.

### 4. Donor Onboarding & Preliminary Readiness Screening
- Comprehensive onboarding capturing blood group, age, weight, and contact preferences.
- **12-Question Preliminary Screening Questionnaire**: Evaluates recent fever, surgeries, medications, dental work, tattoos, recent donations, and alcohol consumption.
- **Prominent Medical Disclaimer**: Strictly clarifies that the tool provides preliminary logistical guidance and does **not** replace certified clinical examination by qualified doctors.

### 5. Digital Donor ID Card & QR Verification
- Official voluntary donor passport displaying donor name, unique Donor Code (`VC-DON-...`), blood group, district, and verified badge.
- Dynamic high-resolution QR code routing to safe public verification pages without exposing private home addresses or phone numbers.
- Print and export support.

### 6. Scikit-Learn ML Blood Demand Forecaster
- Real machine-learning pipeline built with Python, Scikit-Learn (`RandomForestRegressor`), Pandas, and NumPy.
- Trained on 180-day seasonal series across Tamil Nadu districts, population factors, and demographic group frequencies.
- Predicts 7-day expected unit volumes per blood group with risk tier categorizations (**High Demand**, **Moderate**, **Attention Required for Rare Groups**).

### 7. Real PDF Generation & Public Certificate Verification
- Generates official binary PDFs on the fly using **ReportLab** with embedded cryptographic QR codes for:
  - **Certificate of Blood Donation** (`VC-CERT-...`)
  - **Statewide Inventory Status Reports** for hospital administrators
- Public verification route (`/verify/certificate/[id]`) validates certificate authenticity safely.

### 8. Real-Time Request-Bound Coordination Chat
- Bidirectional **WebSocket** messaging bound to emergency request threads (`VC-REQ-...`).
- System audit notices automatically log status changes (e.g. *"Donor accepted emergency request"*).

### 9. Bilingual Support & Accessibility
- Native support for **English** and **தமிழ்** with an instant header switcher.
- WCAG-compliant high-contrast medical palette, dark/light mode toggle, and responsive layout.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide React, Recharts, Leaflet |
| **Backend** | Python 3.14, FastAPI, SQLAlchemy 2.0 ORM, Uvicorn, WebSockets |
| **Database** | PostgreSQL (`vital_connect`) |
| **Machine Learning** | Scikit-Learn, Pandas, NumPy |
| **Document Generation** | ReportLab, QRCode, Pillow |
| **Authentication** | JWT (PyJWT), Passlib / Bcrypt |

---

## 📂 Project Structure

```
vital-connect4/
├── backend/
│   ├── app/
│   │   ├── core/           # Config, database session, security, 38 TN districts data
│   │   ├── models/         # Relational SQLAlchemy models (User, Request, Match, etc.)
│   │   ├── routers/        # API routes (auth, districts, donors, requests, etc.)
│   │   ├── schemas/        # Pydantic validation schemas
│   │   ├── services/       # Matching, Chain Rescue, ML Forecaster, ReportLab PDF, SMS
│   │   ├── websockets/     # Real-time WebSocket connection manager
│   │   └── main.py         # FastAPI application entrypoint
│   ├── seed.py             # Database seeder with realistic Tamil Nadu healthcare data
│   ├── test_api.py         # Pytest automated test suite
│   └── pyproject.toml / uv.lock
├── frontend/
│   ├── src/
│   │   ├── app/            # Next.js App Router pages (landing, auth, requests, radar, etc.)
│   │   ├── components/     # Reusable UI (Navbar, Footer, Background, Map, Radar, Card)
│   │   ├── context/        # AuthContext, LanguageContext, ThemeContext
│   │   └── lib/            # API client, 38 districts data, translations
│   ├── tailwind.config.js
│   └── package.json
├── run.sh                  # Unified launch script
└── README.md
```

---

## ⚡ Quick Start

```


### 4. Start the Application
For Running 
---bash
cd Vital_Connect

---
and
./run.sh
and 
http://localhost:3000/splash
copy this for running as local host 

## 🔐 Demo Credentials

Use these pre-seeded accounts to explore role-based access:

| Role | Email | Password | Access Highlights |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@vitalconnect.org` | `AdminPassword123!` | System metrics, user verification, PDF reports, audit logs |
| **Donor** | `karthik.s@example.com` | `DonorPass123!` | Donor portal, Digital ID card, achievements, certificates |
| **Hospital** | `hospital1@chennaimed.org` | `HospitalPass123!` | Emergency requests, match coordination, patient beds |
| **Blood Bank** | `bloodbank1@chennaibb.org`| `BloodBankPass123!` | Live 8-group stock updating, reservation dispatch |

---

## 📜 Medical & Ethical Safety Notice

Vital Connect is a voluntary emergency coordination system.
- It does **not** diagnose medical conditions.
- It does **not** provide medical clearance.
- It does **not** replace certified hospital or blood bank transfusion guidelines.
- Blood donation in India is strictly non-commercial and voluntary.
- Final donor eligibility must be determined by qualified medical professionals.
