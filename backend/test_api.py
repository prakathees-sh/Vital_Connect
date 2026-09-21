import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.ml_forecast_service import forecaster
from app.services.matching_service import is_blood_compatible, calculate_match_score
from app.services.pdf_service import generate_donation_certificate_pdf

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy", "service": "vital-connect-backend"}

def test_districts_count():
    response = client.get("/api/v1/districts")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 38
    names = [d["name_en"] for d in data]
    assert "Chennai" in names
    assert "Coimbatore" in names
    assert "The Nilgiris" in names

def test_auto_detect_district():
    response = client.get("/api/v1/districts/detect?address=123+RS+Puram+Coimbatore")
    assert response.status_code == 200
    assert response.json()["detected_district"] == "Coimbatore"

def test_ml_forecast():
    result = forecaster.forecast_7_days(district="Coimbatore")
    assert "disclaimer" in result
    assert "group_forecasts" in result
    assert len(result["group_forecasts"]) == 8
    assert result["district"] == "Coimbatore"

def test_blood_compatibility():
    # O- can donate to all
    assert is_blood_compatible("O-", "AB+") is True
    assert is_blood_compatible("O-", "O-") is True
    # AB+ can receive from all, but can only give to AB+
    assert is_blood_compatible("AB+", "O+") is False
    assert is_blood_compatible("AB+", "AB+") is True
    # O+ cannot give to O-
    assert is_blood_compatible("O+", "O-") is False

def test_pdf_generation():
    cert_data = {
        "certificate_code": "VC-CERT-TEST",
        "donor_name": "Test Donor",
        "blood_group": "O+",
        "donation_date": "October 20, 2026",
        "facility_name": "Test Hospital",
        "district": "Coimbatore",
        "verification_url": "https://vitalconnect.org/verify/certificate/VC-CERT-TEST"
    }
    stream = generate_donation_certificate_pdf(cert_data)
    pdf_bytes = stream.getvalue()
    assert len(pdf_bytes) > 1000
    assert pdf_bytes.startswith(b"%PDF")

def test_admin_login():
    response = client.post("/api/v1/auth/login", json={
        "email": "admin@vitalconnect.org",
        "password": "AdminPassword123!"
    })
    assert response.status_code == 200
    token = response.json()["access_token"]
    assert len(token) > 20
