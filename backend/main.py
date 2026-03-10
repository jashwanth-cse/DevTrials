import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

import schemas
import risk_engine
import disruption_engine
import fraud_engine

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger(__name__)

app = FastAPI(title="GigCover Risk Engine", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/predict-risk", response_model=schemas.RiskResponse)
def predict_risk(payload: schemas.RiskRequest):
    logger.info(
        "Received risk assessment request | name=%s city=%s platform=%s "
        "dailyIncome=%s zoneType=%s",
        payload.name,
        payload.city,
        payload.platform,
        payload.dailyIncome,
        payload.zoneType,
    )

    try:
        # Step 3-5: individual risk components
        city_risk = risk_engine.calculate_city_risk(payload.city)
        platform_risk = risk_engine.calculate_platform_risk(payload.platform)
        zone_risk = risk_engine.calculate_zone_risk(payload.zoneType)

        logger.info(
            "Risk components | cityRisk=%.4f platformRisk=%.4f zoneRisk=%.4f",
            city_risk, platform_risk, zone_risk,
        )

        # Step 6-9: derived values
        risk_score = risk_engine.calculate_risk_score(payload.city, payload.platform, payload.zoneType)
        weekly_premium = risk_engine.calculate_weekly_premium(risk_score)
        coverage_amount = risk_engine.calculate_coverage(payload.dailyIncome)
        risk_category = risk_engine.determine_risk_category(risk_score)

        logger.info(
            "Result | riskScore=%.4f weeklyPremium=%d coverageAmount=%d riskCategory=%s",
            risk_score, weekly_premium, coverage_amount, risk_category,
        )

        # Step 10: return response
        return schemas.RiskResponse(
            riskScore=risk_score,
            weeklyPremium=weekly_premium,
            coverageAmount=coverage_amount,
            riskCategory=risk_category,
        )

    except Exception as exc:
        logger.error("Error processing risk assessment: %s", exc, exc_info=True)
        raise HTTPException(status_code=500, detail="Risk assessment failed. Please try again.")


@app.post("/detect-disruption", response_model=schemas.DisruptionResponse)
def detect_disruption(payload: schemas.DisruptionRequest):
    logger.info(
        "Disruption check | city=%s rainfall=%.1f temp=%.1f aqi=%.1f traffic=%.2f curfew=%s",
        payload.city,
        payload.rainfall,
        payload.temperature,
        payload.aqi,
        payload.trafficIndex,
        payload.curfewActive,
    )

    try:
        # Step 2: run all detectors and pick highest severity
        result = disruption_engine.analyze_conditions(
            rainfall=payload.rainfall,
            temperature=payload.temperature,
            aqi=payload.aqi,
            trafficIndex=payload.trafficIndex,
            curfewActive=payload.curfewActive,
        )

        logger.info(
            "Disruption result | detected=%s type=%s severity=%.4f payout=%s",
            result.disruptionDetected,
            result.disruptionType,
            result.severityScore,
            result.triggerPayout,
        )

        # Step 5: return response
        return schemas.DisruptionResponse(
            disruptionDetected=result.disruptionDetected,
            disruptionType=result.disruptionType,
            severityScore=result.severityScore,
            triggerPayout=result.triggerPayout,
            reason=result.reason,
        )

    except Exception as exc:
        logger.error("Error processing disruption detection: %s", exc, exc_info=True)
        raise HTTPException(status_code=500, detail="Disruption detection failed. Please try again.")


@app.post("/detect-fraud", response_model=schemas.FraudResponse)
def detect_fraud(payload: schemas.FraudRequest):
    logger.info(
        "Fraud check | claimEvent=%s city=%s gpsCity=%s rainfall=%.1f aqi=%.1f recentClaimCount=%d",
        payload.claimEvent,
        payload.city,
        payload.gpsCity,
        payload.weatherRainfall,
        payload.aqi,
        payload.recentClaimCount,
    )

    try:
        result = fraud_engine.analyze_claim(
            claim_event=payload.claimEvent,
            weather_rainfall=payload.weatherRainfall,
            aqi=payload.aqi,
            city=payload.city,
            gps_city=payload.gpsCity,
            recent_claim_count=payload.recentClaimCount,
        )

        logger.info(
            "Fraud result | probability=%.4f detected=%s reasons=%s",
            result.fraudProbability,
            result.fraudDetected,
            result.fraudReasons,
        )

        return schemas.FraudResponse(
            fraudProbability=result.fraudProbability,
            fraudDetected=result.fraudDetected,
            fraudReasons=result.fraudReasons,
        )

    except Exception as exc:
        logger.error("Error processing fraud detection: %s", exc, exc_info=True)
        raise HTTPException(status_code=500, detail="Fraud detection failed. Please try again.")


@app.post("/fraud-check", response_model=schemas.FraudCheckResponse)
def fraud_check(payload: schemas.FraudCheckRequest):
    """
    POST /fraud-check
    Step 1 — Receive FraudCheckRequest
    Step 2 — Run fraud detection logic
    Step 3 — Calculate fraudProbability
    Step 4 — Identify fraudReasons
    Step 5 — Return FraudCheckResponse
    """
    logger.info(
        "Fraud check | claimEvent=%s city=%s gpsCity=%s rainfall=%.1f aqi=%.1f recentClaimCount=%d",
        payload.claimEvent,
        payload.city,
        payload.gpsCity,
        payload.weatherRainfall,
        payload.aqi,
        payload.recentClaimCount,
    )

    try:
        # Step 2-4: run all fraud checks
        result = fraud_engine.analyze_claim(
            claim_event=payload.claimEvent,
            weather_rainfall=payload.weatherRainfall,
            aqi=payload.aqi,
            city=payload.city,
            gps_city=payload.gpsCity,
            recent_claim_count=payload.recentClaimCount,
        )

        logger.info(
            "Fraud result | probability=%.4f detected=%s reasons=%s",
            result.fraudProbability,
            result.fraudDetected,
            result.fraudReasons,
        )

        # Step 5: return response
        return schemas.FraudCheckResponse(
            fraudDetected=result.fraudDetected,
            fraudProbability=result.fraudProbability,
            fraudReasons=result.fraudReasons,
        )

    except Exception as exc:
        logger.error("Error processing fraud check: %s", exc, exc_info=True)
        raise HTTPException(status_code=500, detail="Fraud check failed. Please try again.")
