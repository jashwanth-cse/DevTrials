from dataclasses import dataclass
from typing import Optional

PAYOUT_SEVERITY_THRESHOLD = 0.7


@dataclass
class DisruptionResult:
    disruptionDetected: bool
    disruptionType: Optional[str]
    severityScore: float          # 0.0 – 1.0
    triggerPayout: bool
    reason: str


# ── Individual detectors ──────────────────────────────────────────────────────

def detect_rain_disruption(rainfall: float) -> DisruptionResult:
    if rainfall > 80:
        return DisruptionResult(
            disruptionDetected=True,
            disruptionType="Heavy Rain",
            severityScore=0.9,
            triggerPayout=0.9 > PAYOUT_SEVERITY_THRESHOLD,
            reason="Rainfall exceeded 80 mm — severe disruption threshold",
        )
    if rainfall >= 50:
        return DisruptionResult(
            disruptionDetected=True,
            disruptionType="Heavy Rain",
            severityScore=0.6,
            triggerPayout=0.6 > PAYOUT_SEVERITY_THRESHOLD,
            reason="Rainfall between 50–80 mm — moderate disruption",
        )
    return DisruptionResult(
        disruptionDetected=False,
        disruptionType=None,
        severityScore=0.0,
        triggerPayout=False,
        reason="Rainfall within normal range",
    )


def detect_heatwave(temperature: float) -> DisruptionResult:
    detected = temperature > 42
    return DisruptionResult(
        disruptionDetected=detected,
        disruptionType="Heat Wave" if detected else None,
        severityScore=0.85 if detected else 0.0,
        triggerPayout=0.85 > PAYOUT_SEVERITY_THRESHOLD if detected else False,
        reason="Temperature exceeded 42°C — heat wave disruption" if detected else "Temperature within normal range",
    )


def detect_pollution(aqi: float) -> DisruptionResult:
    detected = aqi > 350
    return DisruptionResult(
        disruptionDetected=detected,
        disruptionType="Air Pollution" if detected else None,
        severityScore=0.8 if detected else 0.0,
        triggerPayout=0.8 > PAYOUT_SEVERITY_THRESHOLD if detected else False,
        reason="AQI exceeded 350 — hazardous air quality" if detected else "AQI within acceptable range",
    )


def detect_traffic_disruption(trafficIndex: float) -> DisruptionResult:
    detected = trafficIndex > 0.85
    return DisruptionResult(
        disruptionDetected=detected,
        disruptionType="Traffic Disruption" if detected else None,
        severityScore=round(trafficIndex, 4) if detected else 0.0,
        triggerPayout=trafficIndex > PAYOUT_SEVERITY_THRESHOLD if detected else False,
        reason="Traffic index exceeded 0.85 — severe congestion" if detected else "Traffic within normal range",
    )


def detect_curfew(curfewActive: bool) -> DisruptionResult:
    return DisruptionResult(
        disruptionDetected=curfewActive,
        disruptionType="Curfew / City Shutdown" if curfewActive else None,
        severityScore=0.95 if curfewActive else 0.0,
        triggerPayout=0.95 > PAYOUT_SEVERITY_THRESHOLD if curfewActive else False,
        reason="Curfew or city shutdown is active" if curfewActive else "No curfew active",
    )


# ── Composite analyser ────────────────────────────────────────────────────────

def analyze_conditions(
    rainfall: float = 0.0,
    temperature: float = 0.0,
    aqi: float = 0.0,
    trafficIndex: float = 0.0,
    curfewActive: bool = False,
) -> DisruptionResult:
    """
    Evaluate all disruption types and return the one with the highest severity.
    triggerPayout is True when the winning severityScore > 0.7.
    """
    results = [
        detect_rain_disruption(rainfall),
        detect_heatwave(temperature),
        detect_pollution(aqi),
        detect_traffic_disruption(trafficIndex),
        detect_curfew(curfewActive),
    ]

    active = [r for r in results if r.disruptionDetected]

    if not active:
        return DisruptionResult(
            disruptionDetected=False,
            disruptionType=None,
            severityScore=0.0,
            triggerPayout=False,
            reason="No environmental disruptions detected",
        )

    worst = max(active, key=lambda r: r.severityScore)
    return worst
