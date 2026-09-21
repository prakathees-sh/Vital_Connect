from typing import List, Dict, Any, Optional
from app.core.tamil_nadu_districts import calculate_haversine_distance

CAN_RECEIVE_FROM: Dict[str, List[str]] = {
    "O-": ["O-"],
    "O+": ["O-", "O+"],
    "A-": ["O-", "A-"],
    "A+": ["O-", "O+", "A-", "A+"],
    "B-": ["O-", "B-"],
    "B+": ["O-", "O+", "B-", "B+"],
    "AB-": ["O-", "A-", "B-", "AB-"],
    "AB+": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
}

CAN_DONATE_TO: Dict[str, List[str]] = {
    "O-": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
    "O+": ["O+", "A+", "B+", "AB+"],
    "A-": ["A-", "A+", "AB-", "AB+"],
    "A+": ["A+", "AB+"],
    "B-": ["B-", "B+", "AB-", "AB+"],
    "B+": ["B+", "AB+"],
    "AB-": ["AB-", "AB+"],
    "AB+": ["AB+"],
}

def is_blood_compatible(donor_group: str, recipient_group: str) -> bool:
    compatible_donors = CAN_RECEIVE_FROM.get(recipient_group, [])
    return donor_group in compatible_donors

def calculate_match_score(
    donor_group: str,
    needed_group: str,
    distance_km: float,
    is_verified: bool = True,
    is_available: bool = True,
    emergency_enabled: bool = True,
    screening_cleared: bool = True
) -> Dict[str, Any]:
    """
    Calculates intelligent matching score (0 to 100%) and reasons.
    NOTE: Algorithmic coordination recommendation only — not a clinical determination.
    """
    if not is_blood_compatible(donor_group, needed_group):
        return {
            "score": 0.0,
            "is_compatible": False,
            "reasons": ["Incompatible blood group"]
        }

    score = 0.0
    reasons = []

    # 1. Compatibility points (max 40)
    if donor_group == needed_group:
        score += 40.0
        reasons.append(f"Identical blood group match ({donor_group})")
    else:
        score += 32.0
        reasons.append(f"Compatible donor group ({donor_group} for {needed_group})")

    # 2. Distance points (max 30)
    if distance_km <= 5.0:
        score += 30.0
        reasons.append(f"Immediate proximity ({distance_km} km)")
    elif distance_km <= 15.0:
        score += 25.0
        reasons.append(f"Nearby vicinity ({distance_km} km)")
    elif distance_km <= 35.0:
        score += 20.0
        reasons.append(f"Within sub-district reach ({distance_km} km)")
    elif distance_km <= 70.0:
        score += 15.0
        reasons.append(f"Regional proximity ({distance_km} km)")
    else:
        score += 8.0
        reasons.append(f"Extended range ({distance_km} km)")

    # 3. Verification & Readiness (max 30)
    if is_verified:
        score += 10.0
        reasons.append("Verified credential status")
    if is_available:
        score += 10.0
        reasons.append("Currently marked available")
    if emergency_enabled:
        score += 5.0
        reasons.append("Emergency quick-responder enabled")
    if screening_cleared:
        score += 5.0
        reasons.append("Preliminary health screening cleared")

    return {
        "score": round(min(score, 100.0), 1),
        "is_compatible": True,
        "distance_km": distance_km,
        "reasons": reasons
    }
