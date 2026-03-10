from dataclasses import dataclass, field
from typing import Optional


@dataclass
class FraudResult:
    fraudProbability: float       # 0.0 – 1.0
    fraudDetected: bool
    fraudReasons: list[str] = field(default_factory=list)


# ── Thresholds ────────────────────────────────────────────────────────────────

FRAUD_DETECTION_THRESHOLD = 0.6

RAIN_RAINFALL_MINIMUM   = 40.0   # mm  — below this, Heavy Rain claim is suspicious
POLLUTION_AQI_MINIMUM   = 250.0  # AQI — below this, Pollution claim is suspicious
MAX_CLAIMS_PER_WEEK     = 3      # claims in 7 days above this trigger frequency flag


# ── Individual checks ─────────────────────────────────────────────────────────

def check_weather_verification(
    claim_event: str,
    weather_rainfall: float,
) -> tuple[float, Optional[str]]:
    """
    Check 1: Heavy Rain verification.
    If the worker claims 'Heavy Rain' but actual rainfall < 40 mm → +0.4.
    """
    if claim_event.strip().lower() == "heavy rain" and weather_rainfall < RAIN_RAINFALL_MINIMUM:
        return 0.4, (
            f"Claimed 'Heavy Rain' but recorded rainfall is only {weather_rainfall} mm "
            f"(minimum required: {RAIN_RAINFALL_MINIMUM} mm)"
        )
    return 0.0, None


def check_pollution_verification(
    claim_event: str,
    aqi: float,
) -> tuple[float, Optional[str]]:
    """
    Check 2: Pollution verification.
    If the worker claims 'Pollution' but AQI < 250 → +0.3.
    """
    if claim_event.strip().lower() == "pollution" and aqi < POLLUTION_AQI_MINIMUM:
        return 0.3, (
            f"Claimed 'Pollution' but recorded AQI is {aqi} "
            f"(minimum required: {POLLUTION_AQI_MINIMUM})"
        )
    return 0.0, None


def check_location_mismatch(
    city: str,
    gps_city: str,
) -> tuple[float, Optional[str]]:
    """
    Check 3: Location mismatch.
    If the GPS-detected city differs from the policy city → +0.4.
    """
    if city.strip().lower() != gps_city.strip().lower():
        return 0.4, (
            f"GPS location '{gps_city}' does not match policy city '{city}'"
        )
    return 0.0, None


def check_claim_frequency(
    recent_claim_count: int,
) -> tuple[float, Optional[str]]:
    """
    Check 4: Excessive claim frequency.
    If the worker has filed more than 3 claims in the last 7 days → +0.3.
    """
    if recent_claim_count > MAX_CLAIMS_PER_WEEK:
        return 0.3, (
            f"{recent_claim_count} claims filed in the last 7 days "
            f"(maximum allowed: {MAX_CLAIMS_PER_WEEK})"
        )
    return 0.0, None


# ── Composite analyser ────────────────────────────────────────────────────────

def analyze_claim(
    claim_event: str,
    weather_rainfall: float,
    aqi: float,
    city: str,
    gps_city: str,
    recent_claim_count: int,
) -> FraudResult:
    """
    Run all four fraud checks and return a combined FraudResult.

    fraudProbability = sum of triggered check weights, clamped to [0.0, 1.0].
    fraudDetected    = True when fraudProbability > FRAUD_DETECTION_THRESHOLD (0.6).
    """
    reasons: list[str] = []
    total_weight: float = 0.0

    checks = [
        check_weather_verification(claim_event, weather_rainfall),
        check_pollution_verification(claim_event, aqi),
        check_location_mismatch(city, gps_city),
        check_claim_frequency(recent_claim_count),
    ]

    for weight, reason in checks:
        if weight > 0.0 and reason:
            total_weight += weight
            reasons.append(reason)

    fraud_probability = round(min(1.0, max(0.0, total_weight)), 4)
    fraud_detected = fraud_probability > FRAUD_DETECTION_THRESHOLD

    return FraudResult(
        fraudProbability=fraud_probability,
        fraudDetected=fraud_detected,
        fraudReasons=reasons,
    )
