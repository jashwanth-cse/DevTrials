def calculate_city_risk(city: str) -> float:
    high_risk = {"Chennai", "Mumbai", "Kolkata"}
    medium_risk = {"Bangalore", "Hyderabad", "Pune"}
    low_risk = {"Jaipur", "Ahmedabad", "Chandigarh"}

    if city in high_risk:
        return 0.75
    elif city in medium_risk:
        return 0.55
    elif city in low_risk:
        return 0.35
    return 0.50


def calculate_platform_risk(platform: str) -> float:
    food_delivery = {"Swiggy", "Zomato"}
    quick_commerce = {"Zepto", "Blinkit"}
    ecommerce = {"Amazon", "Flipkart"}

    if platform in food_delivery:
        return 0.10
    elif platform in quick_commerce:
        return 0.08
    elif platform in ecommerce:
        return 0.05
    return 0.06


def calculate_zone_risk(zoneType: str) -> float:
    mapping = {
        "Urban": 0.10,
        "SemiUrban": 0.05,
        "Rural": 0.02,
    }
    return mapping.get(zoneType, 0.05)


def calculate_risk_score(city: str, platform: str, zoneType: str) -> float:
    risk = calculate_city_risk(city) + calculate_platform_risk(platform) + calculate_zone_risk(zoneType)
    return round(max(0.30, min(0.90, risk)), 4)


def calculate_weekly_premium(riskScore: float) -> int:
    return round(riskScore * 40)


def calculate_coverage(dailyIncome: float) -> int:
    return round(dailyIncome * 0.7)


def determine_risk_category(riskScore: float) -> str:
    if riskScore < 0.45:
        return "Low"
    elif riskScore <= 0.70:
        return "Medium"
    return "High"
