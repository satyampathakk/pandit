import bcrypt
import math

def hash_password(password: str):
    # Hash password using bcrypt
    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
    return hashed.decode("utf-8")

def verify_password(plain, hashed):
    # Verify password
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))

def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate distance between two coordinates using Haversine formula.
    Returns distance in kilometers.
    """
    if not all([lat1, lon1, lat2, lon2]):
        return float('inf')
    
    R = 6371  # Earth's radius in kilometers
    
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lon = math.radians(lon2 - lon1)
    
    a = math.sin(delta_lat / 2) ** 2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lon / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    return R * c

def calculate_match_score(distance_km: float, price: float, rating: float, 
                         max_distance: float = 50, max_price: float = 5000,
                         distance_weight: float = 0.4, price_weight: float = 0.3, 
                         rating_weight: float = 0.3) -> float:
    """
    Calculate match score for a pandit based on multiple factors.
    Returns score between 0 and 100.
    """
    distance_score = max(0, 100 * (1 - distance_km / max_distance)) if distance_km <= max_distance else 0
    price_score = max(0, 100 * (1 - price / max_price)) if price > 0 else 50
    rating_score = (rating / 5) * 100 if rating > 0 else 50

    total_score = (
        distance_score * distance_weight +
        price_score * price_weight +
        rating_score * rating_weight
    )

    return round(total_score, 2)