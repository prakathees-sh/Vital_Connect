import math
from typing import Optional, Dict, Any, List

# Complete dataset of all 38 Tamil Nadu Districts
TAMIL_NADU_DISTRICTS: List[Dict[str, Any]] = [
    {"name_en": "Ariyalur", "name_ta": "அரியலூர்", "zone": "Central", "lat": 11.1401, "lng": 79.0786, "population": 754894},
    {"name_en": "Chengalpattu", "name_ta": "செங்கல்பட்டு", "zone": "North", "lat": 12.6841, "lng": 79.9836, "population": 2556244},
    {"name_en": "Chennai", "name_ta": "சென்னை", "zone": "North", "lat": 13.0827, "lng": 80.2707, "population": 7088403},
    {"name_en": "Coimbatore", "name_ta": "கோயம்புத்தூர்", "zone": "West", "lat": 11.0168, "lng": 76.9558, "population": 3458045},
    {"name_en": "Cuddalore", "name_ta": "கடலூர்", "zone": "Central", "lat": 11.7480, "lng": 79.7714, "population": 2605914},
    {"name_en": "Dharmapuri", "name_ta": "தருமபுரி", "zone": "West", "lat": 12.1211, "lng": 78.1582, "population": 1506843},
    {"name_en": "Dindigul", "name_ta": "திண்டுக்கல்", "zone": "South", "lat": 10.3673, "lng": 77.9803, "population": 2159775},
    {"name_en": "Erode", "name_ta": "ஈரோடு", "zone": "West", "lat": 11.3410, "lng": 77.7172, "population": 2251744},
    {"name_en": "Kallakurichi", "name_ta": "கள்ளக்குறிச்சி", "zone": "Central", "lat": 11.7384, "lng": 78.9639, "population": 1370281},
    {"name_en": "Kancheepuram", "name_ta": "காஞ்சிபுரம்", "zone": "North", "lat": 12.8342, "lng": 79.7036, "population": 1166401},
    {"name_en": "Kanniyakumari", "name_ta": "கன்னியாகுமரி", "zone": "South", "lat": 8.0883, "lng": 77.5385, "population": 1870374},
    {"name_en": "Karur", "name_ta": "கரூர்", "zone": "Central", "lat": 10.9601, "lng": 78.0766, "population": 1064493},
    {"name_en": "Krishnagiri", "name_ta": "கிருஷ்ணகிரி", "zone": "West", "lat": 12.5186, "lng": 78.2137, "population": 1879809},
    {"name_en": "Madurai", "name_ta": "மதுரை", "zone": "South", "lat": 9.9252, "lng": 78.1198, "population": 3038252},
    {"name_en": "Mayiladuthurai", "name_ta": "மயிலாடுதுறை", "zone": "Central", "lat": 11.1018, "lng": 79.6522, "population": 918356},
    {"name_en": "Nagapattinam", "name_ta": "நாகப்பட்டினம்", "zone": "Central", "lat": 10.7672, "lng": 79.8449, "population": 697069},
    {"name_en": "Namakkal", "name_ta": "நாமக்கல்", "zone": "West", "lat": 11.2189, "lng": 78.1674, "population": 1726601},
    {"name_en": "Perambalur", "name_ta": "பெரம்பலூர்", "zone": "Central", "lat": 11.2342, "lng": 78.8817, "population": 565223},
    {"name_en": "Pudukottai", "name_ta": "புதுக்கோட்டை", "zone": "Central", "lat": 10.3797, "lng": 78.8208, "population": 1618345},
    {"name_en": "Ramanathapuram", "name_ta": "இராமநாதபுரம்", "zone": "South", "lat": 9.3639, "lng": 78.8395, "population": 1353445},
    {"name_en": "Ranipet", "name_ta": "ராணிப்பேட்டை", "zone": "North", "lat": 12.9272, "lng": 79.3331, "population": 1210277},
    {"name_en": "Salem", "name_ta": "சேலம்", "zone": "West", "lat": 11.6643, "lng": 78.1460, "population": 3482056},
    {"name_en": "Sivaganga", "name_ta": "சிவகங்கை", "zone": "South", "lat": 9.8433, "lng": 78.4809, "population": 1339101},
    {"name_en": "Tenkasi", "name_ta": "தென்காசி", "zone": "South", "lat": 8.9594, "lng": 77.3152, "population": 1407627},
    {"name_en": "Thanjavur", "name_ta": "தஞ்சாவூர்", "zone": "Central", "lat": 10.7870, "lng": 79.1378, "population": 2405890},
    {"name_en": "The Nilgiris", "name_ta": "நீலகிரி", "zone": "West", "lat": 11.4102, "lng": 76.6950, "population": 735394},
    {"name_en": "Theni", "name_ta": "தேனி", "zone": "South", "lat": 10.0104, "lng": 77.4768, "population": 1245899},
    {"name_en": "Thoothukudi", "name_ta": "தூத்துக்குடி", "zone": "South", "lat": 8.7642, "lng": 78.1348, "population": 1750176},
    {"name_en": "Tiruchirappalli", "name_ta": "திருச்சிராப்பள்ளி", "zone": "Central", "lat": 10.7905, "lng": 78.7047, "population": 2722290},
    {"name_en": "Tirunelveli", "name_ta": "திருநெல்வேலி", "zone": "South", "lat": 8.7139, "lng": 77.7567, "population": 1665253},
    {"name_en": "Tirupathur", "name_ta": "திருப்பத்தூர்", "zone": "North", "lat": 12.4926, "lng": 78.5678, "population": 1111812},
    {"name_en": "Tiruppur", "name_ta": "திருப்பூர்", "zone": "West", "lat": 11.1085, "lng": 77.3411, "population": 2479052},
    {"name_en": "Tiruvallur", "name_ta": "திருவள்ளூர்", "zone": "North", "lat": 13.1432, "lng": 79.9074, "population": 3728104},
    {"name_en": "Tiruvannamalai", "name_ta": "திருவண்ணாமலை", "zone": "North", "lat": 12.2253, "lng": 79.0747, "population": 2464875},
    {"name_en": "Tiruvarur", "name_ta": "திருவாரூர்", "zone": "Central", "lat": 10.7725, "lng": 79.6365, "population": 1264277},
    {"name_en": "Vellore", "name_ta": "வேலூர்", "zone": "North", "lat": 12.9165, "lng": 79.1325, "population": 1614242},
    {"name_en": "Viluppuram", "name_ta": "விழுப்புரம்", "zone": "Central", "lat": 11.9401, "lng": 79.4861, "population": 2092703},
    {"name_en": "Virudhunagar", "name_ta": "விருதுநகர்", "zone": "South", "lat": 9.5680, "lng": 77.9624, "population": 1942288},
]

def calculate_haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates distance between two lat/long points in kilometers using Haversine formula."""
    R = 6371.0  # Earth's radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)

def detect_district_from_coords(lat: float, lng: float) -> str:
    """Finds nearest Tamil Nadu district given latitude and longitude."""
    closest_district = "Chennai"
    min_dist = float("inf")

    for d in TAMIL_NADU_DISTRICTS:
        dist = calculate_haversine_distance(lat, lng, d["lat"], d["lng"])
        if dist < min_dist:
            min_dist = dist
            closest_district = d["name_en"]

    return closest_district

def detect_district_from_text(address_text: str) -> Optional[str]:
    """Scans text for district names or major cities in Tamil Nadu."""
    text_lower = address_text.lower()
    
    # Check direct district names
    for d in TAMIL_NADU_DISTRICTS:
        if d["name_en"].lower() in text_lower or d["name_ta"] in text_lower:
            return d["name_en"]
            
    # Major city aliases
    aliases = {
        "madras": "Chennai",
        "kovai": "Coimbatore",
        "trichy": "Tiruchirappalli",
        "tiruchi": "Tiruchirappalli",
        "ooty": "The Nilgiris",
        "udhagamandalam": "The Nilgiris",
        "kanyakumari": "Kanniyakumari",
        "trivellore": "Tiruvallur",
        "conjeevaram": "Kancheepuram",
        "tuticorin": "Thoothukudi",
        "tanjore": "Thanjavur",
        "rs puram": "Coimbatore",
        "gandhipuram": "Coimbatore",
        "peelamedu": "Coimbatore",
        "anna nagar": "Chennai",
        "t nagar": "Chennai",
        "mylapore": "Chennai",
        "adyar": "Chennai",
        "velachery": "Chennai",
        "tambaram": "Chengalpattu",
        "omr": "Chengalpattu",
        "guindy": "Chennai",
    }
    for alias, dist in aliases.items():
        if alias in text_lower:
            return dist

    return None

def resolve_district(address_text: str, lat: Optional[float] = None, lng: Optional[float] = None) -> str:
    """Primary district resolution engine using text matching with fallback to coordinate distance."""
    from_text = detect_district_from_text(address_text)
    if from_text:
        return from_text
    if lat is not None and lng is not None:
        return detect_district_from_coords(lat, lng)
    return "Chennai"  # Default fallback
