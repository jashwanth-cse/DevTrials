from typing import Optional
from pydantic import BaseModel, Field


class RiskRequest(BaseModel):
    name: str
    city: str
    platform: str
    dailyIncome: float = Field(..., gt=0)
    zoneType: str


class RiskResponse(BaseModel):
    riskScore: float
    weeklyPremium: int
    coverageAmount: int
    riskCategory: str


class DisruptionRequest(BaseModel):
    city: str
    rainfall: float = Field(default=0.0, ge=0)
    temperature: float = Field(default=0.0)
    aqi: float = Field(default=0.0, ge=0)
    trafficIndex: float = Field(default=0.0, ge=0, le=100)
    curfewActive: bool = False


class DisruptionResponse(BaseModel):
    disruptionDetected: bool
    disruptionType: Optional[str]
    severityScore: float
    triggerPayout: bool
    reason: str


class FraudRequest(BaseModel):
    claimEvent: str
    weatherRainfall: float = Field(default=0.0, ge=0)
    aqi: float = Field(default=0.0, ge=0)
    city: str
    gpsCity: str
    recentClaimCount: int = Field(default=0, ge=0)


class FraudResponse(BaseModel):
    fraudProbability: float
    fraudDetected: bool
    fraudReasons: list[str]


class FraudCheckRequest(BaseModel):
    claimEvent: str
    weatherRainfall: float = Field(default=0.0, ge=0)
    aqi: float = Field(default=0.0, ge=0)
    city: str
    gpsCity: str
    recentClaimCount: int = Field(default=0, ge=0)


class FraudCheckResponse(BaseModel):
    fraudDetected: bool
    fraudProbability: float
    fraudReasons: list[str]
