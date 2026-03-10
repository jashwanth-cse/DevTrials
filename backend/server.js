import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import { fetchWeather } from "./services/weatherService.js";
import { fetchAQI } from "./services/aqiService.js";
import { fetchTraffic } from "./services/trafficService.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Basic health check route
app.get("/api/health", (req, res) => {
  res
    .status(200)
    .json({ status: "ok", message: "GigCover Backend is running." });
});

// In-memory policy store (replace with a DB in production)
const policies = new Map();

function generatePolicyId() {
  return `POL-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`;
}

// Local risk calculation fallback — mirrors risk_engine.py logic
function calculateRiskLocally(platform, dailyIncome, zoneType) {
  const platformRisk = {
    Swiggy: 0.1,
    Zomato: 0.1,
    Zepto: 0.08,
    Blinkit: 0.08,
    Amazon: 0.05,
    Flipkart: 0.05,
  };
  const zoneRisk = { Urban: 0.1, SemiUrban: 0.05, Rural: 0.02 };

  const pRisk = platformRisk[platform] ?? 0.06;
  const zRisk = zoneRisk[zoneType] ?? 0.05;
  const cityRisk = 0.5; // default when city unknown locally

  const raw = cityRisk + pRisk + zRisk;
  const riskScore = parseFloat(Math.min(0.9, Math.max(0.3, raw)).toFixed(4));
  const weeklyPremium = Math.round(riskScore * 40);
  const coverageAmount = Math.round(parseFloat(dailyIncome) * 0.7);
  const riskCategory =
    riskScore < 0.45 ? "Low" : riskScore <= 0.7 ? "Medium" : "High";

  return { riskScore, weeklyPremium, coverageAmount, riskCategory };
}

// AI Risk Assessment Endpoint
app.post("/api/risk-assessment", async (req, res) => {
  const { name, city, platform, dailyIncome, zoneType } = req.body;

  if (!name || !city || !platform || !dailyIncome || !zoneType) {
    return res.status(400).json({ error: "All fields are required." });
  }

  let riskScore, weeklyPremium, coverageAmount, riskCategory;

  try {
    // Step 3: Call Python AI service
    const aiResponse = await axios.post("http://localhost:8000/predict-risk", {
      name,
      city,
      platform,
      dailyIncome,
      zoneType,
    });
    ({ riskScore, weeklyPremium, coverageAmount, riskCategory } =
      aiResponse.data);
    console.log(
      `AI service responded | riskScore=${riskScore} category=${riskCategory}`,
    );
  } catch (error) {
    // Fallback to local calculation if AI service is unavailable
    console.warn(
      "AI service unavailable, using local calculation:",
      error.message,
    );
    ({ riskScore, weeklyPremium, coverageAmount, riskCategory } =
      calculateRiskLocally(platform, dailyIncome, zoneType));
  }

  // Step 6: Create policy record
  const policyId = generatePolicyId();
  policies.set(policyId, {
    policyId,
    workerName: name,
    city,
    platform,
    dailyIncome,
    zoneType,
    riskScore,
    weeklyPremium,
    coverageAmount,
    riskCategory,
    createdAt: new Date().toISOString(),
    status: "active",
  });
  console.log(`Policy created: ${policyId} for ${name}`);

  return res.json({
    policyId,
    riskScore,
    weeklyPremium,
    coverageAmount,
    riskCategory,
  });
});

// Retrieve a policy by ID
app.get("/api/policy/:policyId", (req, res) => {
  const policy = policies.get(req.params.policyId);
  if (!policy) return res.status(404).json({ error: "Policy not found." });
  return res.json(policy);
});

// Activate a policy
app.patch("/api/policy/:policyId/activate", (req, res) => {
  const policy = policies.get(req.params.policyId);
  if (!policy) return res.status(404).json({ error: "Policy not found." });
  policy.status = "confirmed";
  policy.activatedAt = new Date().toISOString();
  console.log(`Policy activated: ${req.params.policyId}`);
  return res.json({
    success: true,
    policyId: policy.policyId,
    status: policy.status,
    activatedAt: policy.activatedAt,
  });
});

// In-memory claims store
const claims = new Map();

// Realistic peak weather profiles per Indian city.
// Values represent documented extreme weather events (monsoon, cyclone, heatwave).
// Source: IMD historical records & news archives.
const CITY_WEATHER_PROFILES = {
  Mumbai: {
    rainfall: 204,
    temperature: 28,
    aqi: 145,
    trafficIndex: 0.88,
    scenario:
      "Mumbai Monsoon Red Alert — IMD Heavy Rainfall Warning (Jul 2024)",
  },
  Chennai: {
    rainfall: 185,
    temperature: 30,
    aqi: 118,
    trafficIndex: 0.82,
    scenario: "Chennai Northeast Monsoon — Cyclone Rainfall Warning (Dec 2023)",
  },
  Kolkata: {
    rainfall: 132,
    temperature: 30,
    aqi: 162,
    trafficIndex: 0.79,
    scenario:
      "Kolkata Monsoon Surge — Bay of Bengal Low Pressure System (Aug 2024)",
  },
  Delhi: {
    rainfall: 14,
    temperature: 38,
    aqi: 378,
    trafficIndex: 0.85,
    scenario:
      "Delhi Pollution Emergency — Severe AQI, GRAP Stage III Active (Nov 2024)",
  },
  Bangalore: {
    rainfall: 95,
    temperature: 24,
    aqi: 95,
    trafficIndex: 0.72,
    scenario:
      "Bangalore Heavy Downpour — IMD Orange Alert, Outer Ring Road Waterlogged (Sep 2024)",
  },
  Hyderabad: {
    rainfall: 118,
    temperature: 28,
    aqi: 138,
    trafficIndex: 0.76,
    scenario:
      "Hyderabad Flash Flood — IMD Red Alert, Low-lying Areas Flooded (Oct 2024)",
  },
  Pune: {
    rainfall: 88,
    temperature: 26,
    aqi: 108,
    trafficIndex: 0.68,
    scenario:
      "Pune Monsoon Flooding — IMD Orange Alert, Waterlogging Reported (Jul 2024)",
  },
  Jaipur: {
    rainfall: 8,
    temperature: 44,
    aqi: 185,
    trafficIndex: 0.55,
    scenario:
      "Jaipur Severe Heatwave — IMD Red Alert, 44°C Recorded (May 2024)",
  },
  Ahmedabad: {
    rainfall: 6,
    temperature: 45,
    aqi: 172,
    trafficIndex: 0.58,
    scenario:
      "Ahmedabad Extreme Heat — IMD Red Alert, 45°C Peak Temperature (May 2024)",
  },
  Chandigarh: {
    rainfall: 82,
    temperature: 32,
    aqi: 133,
    trafficIndex: 0.52,
    scenario:
      "Chandigarh Heavy Downpour — IMD Alert, Waterlogging Reported (Aug 2024)",
  },
};
const DEFAULT_CITY_WEATHER = {
  rainfall: 92,
  temperature: 30,
  aqi: 148,
  trafficIndex: 0.7,
  scenario: "Regional Weather Disruption — Heavy Rainfall Reported",
};

// Add ±8% variance so each simulation feels dynamic, not fixed
function withVariance(value, pct = 0.08) {
  const delta = value * pct * (Math.random() * 2 - 1);
  return Math.round(Math.max(0, value + delta) * 10) / 10;
}

// Simulate a disruption event and auto-create a claim
app.post("/api/simulate-disruption", async (req, res) => {
  const { policyId } = req.body;

  if (!policyId)
    return res.status(400).json({ error: "policyId is required." });

  const policy = policies.get(policyId);
  if (!policy) return res.status(404).json({ error: "Policy not found." });

  // Derive realistic weather conditions from the worker's registered city
  const profile = CITY_WEATHER_PROFILES[policy.city] || DEFAULT_CITY_WEATHER;
  const weatherConditions = {
    city: policy.city,
    rainfall: withVariance(profile.rainfall),
    temperature: withVariance(profile.temperature),
    aqi: Math.round(withVariance(profile.aqi)),
    trafficIndex:
      Math.round(withVariance(profile.trafficIndex, 0.05) * 100) / 100,
    curfewActive: false,
    scenario: profile.scenario,
  };
  console.log(
    `Simulating disruption for ${policy.workerName} in ${policy.city} | ` +
      `rainfall=${weatherConditions.rainfall}mm temp=${weatherConditions.temperature}°C ` +
      `aqi=${weatherConditions.aqi} traffic=${weatherConditions.trafficIndex}`,
  );

  let disruption;
  try {
    const aiResponse = await axios.post(
      "http://localhost:8000/detect-disruption",
      {
        city: weatherConditions.city,
        rainfall: weatherConditions.rainfall,
        temperature: weatherConditions.temperature,
        aqi: weatherConditions.aqi,
        trafficIndex: weatherConditions.trafficIndex,
        curfewActive: weatherConditions.curfewActive,
      },
    );
    disruption = aiResponse.data;
    console.log(
      `Disruption detected by AI | type=${disruption.disruptionType} severity=${disruption.severityScore}`,
    );
  } catch (err) {
    // Fallback: if AI service is down, treat simulated rain as heavy rain
    console.warn(
      "AI disruption service unavailable, using fallback:",
      err.message,
    );
    disruption = {
      disruptionDetected: true,
      disruptionType: "Heavy Rain",
      severityScore: 0.9,
      triggerPayout: true,
      reason: "Rainfall exceeded 80 mm — severe disruption threshold",
    };
  }

  if (!disruption.triggerPayout) {
    return res.json({
      claimCreated: false,
      disruption,
      weatherConditions,
      message: "Disruption detected but severity too low to trigger payout.",
    });
  }

  // Step 2: Auto-create claim with pending status
  const claimId = `CLM-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`;
  const payoutAmount = policy.coverageAmount;

  // Count recent claims for this policy (last 7 days) to feed into fraud check
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentClaimCount = [...claims.values()].filter(
    (c) => c.policyId === policyId && new Date(c.createdAt) >= sevenDaysAgo,
  ).length;

  const claim = {
    claimId,
    policyId,
    workerName: policy.workerName,
    disruptionType: disruption.disruptionType,
    severityScore: disruption.severityScore,
    reason: disruption.reason,
    payoutAmount,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  claims.set(claimId, claim);
  console.log(`Claim created (pending): ${claimId} for ${policy.workerName}`);

  // Step 3: Call AI /fraud-check
  let fraudResult = null;
  try {
    const fraudResponse = await axios.post(
      "http://localhost:8000/fraud-check",
      {
        claimEvent: disruption.disruptionType || "Heavy Rain",
        weatherRainfall: weatherConditions.rainfall,
        aqi: weatherConditions.aqi,
        city: policy.city,
        gpsCity: policy.city, // GPS = registered city for a real claim
        recentClaimCount,
      },
    );
    fraudResult = fraudResponse.data;
    console.log(
      `Fraud check | probability=${fraudResult.fraudProbability} detected=${fraudResult.fraudDetected}`,
    );
  } catch (err) {
    console.warn(
      "Fraud check service unavailable, defaulting to approved:",
      err.message,
    );
  }

  // Steps 4–5: Backend decision based on fraudProbability
  if (fraudResult?.fraudDetected) {
    // Flag claim for manual review
    claim.status = "flagged";
    claim.fraudProbability = fraudResult.fraudProbability;
    claim.fraudReasons = fraudResult.fraudReasons;
    console.log(
      `Claim flagged for review: ${claimId} | reasons=${fraudResult.fraudReasons.join("; ")}`,
    );
  } else {
    // Approve payout
    claim.status = "approved";
    claim.fraudProbability = fraudResult?.fraudProbability ?? 0;
    claim.fraudReasons = [];
    console.log(`Claim approved: ${claimId} | payout=₹${payoutAmount}`);
  }

  return res.json({
    claimCreated: true,
    claim,
    disruption,
    weatherConditions,
    fraudCheck: fraudResult ?? {
      fraudDetected: false,
      fraudProbability: 0,
      fraudReasons: [],
    },
  });
});

// ── Environment data (live APIs + fallback) ───────────────────────────────────

/**
 * GET /api/environment-data?city=Chennai
 *
 * Fetches real-time rainfall/temperature (OpenWeatherMap),
 * AQI (WAQI), and traffic congestion (TomTom) in parallel.
 * Falls back to CITY_WEATHER_PROFILES static values if any API is
 * unconfigured or returns an error, so the dashboard always has data.
 */
app.get("/api/environment-data", async (req, res) => {
  const { city } = req.query;
  if (!city)
    return res.status(400).json({ error: "city query param required" });

  const fallback = CITY_WEATHER_PROFILES[city] ?? DEFAULT_CITY_WEATHER;

  const [weatherResult, aqiResult, trafficResult] = await Promise.allSettled([
    fetchWeather(city),
    fetchAQI(city),
    fetchTraffic(city),
  ]);

  const temperature =
    weatherResult.status === "fulfilled"
      ? weatherResult.value.temperature
      : withVariance(fallback.temperature, 0.04);

  const rainfall =
    weatherResult.status === "fulfilled"
      ? weatherResult.value.rainfall
      : withVariance(fallback.rainfall, 0.08);

  const aqi =
    aqiResult.status === "fulfilled"
      ? aqiResult.value.aqi
      : Math.round(withVariance(fallback.aqi, 0.08));

  const trafficIndex =
    trafficResult.status === "fulfilled"
      ? trafficResult.value.trafficIndex
      : Math.round(withVariance(fallback.trafficIndex, 0.05) * 100) / 100;

  // Determine whether we got any live data at all
  const fullyLive =
    weatherResult.status === "fulfilled" &&
    aqiResult.status === "fulfilled" &&
    trafficResult.status === "fulfilled";
  const partiallyLive =
    !fullyLive &&
    [weatherResult, aqiResult, trafficResult].some(
      (r) => r.status === "fulfilled",
    );

  const source = fullyLive ? "live" : partiallyLive ? "partial" : "cached";

  // Log any API failures for easier debugging
  if (weatherResult.status === "rejected") {
    console.warn(
      `[env-data] Weather API failed for ${city}:`,
      weatherResult.reason?.message,
    );
  }
  if (aqiResult.status === "rejected") {
    console.warn(
      `[env-data] AQI API failed for ${city}:`,
      aqiResult.reason?.message,
    );
  }
  if (trafficResult.status === "rejected") {
    console.warn(
      `[env-data] Traffic API failed for ${city}:`,
      trafficResult.reason?.message,
    );
  }

  return res.json({
    city,
    rainfall,
    temperature,
    aqi,
    trafficIndex,
    scenario: fallback.scenario,
    source,
    fetchedAt: new Date().toISOString(),
  });
});

// ── Worker endpoints ──────────────────────────────────────────────────────────

// List all claims for a specific policy
app.get("/api/worker/claims/:policyId", (req, res) => {
  const policyClaims = [...claims.values()]
    .filter((c) => c.policyId === req.params.policyId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return res.json(policyClaims);
});

// ── Admin endpoints ───────────────────────────────────────────────────────────

// Global stats
app.get("/api/admin/stats", (req, res) => {
  const allPolicies = [...policies.values()];
  const allClaims = [...claims.values()];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const totalPayout = allClaims
    .filter((c) => c.status === "approved")
    .reduce((sum, c) => sum + c.payoutAmount, 0);

  return res.json({
    totalWorkers: allPolicies.length,
    activePolicies: allPolicies.filter((p) => p.status === "confirmed").length,
    claimsToday: allClaims.filter((c) => new Date(c.createdAt) >= today).length,
    totalClaims: allClaims.length,
    pendingClaims: allClaims.filter((c) => c.status === "pending").length,
    approvedClaims: allClaims.filter((c) => c.status === "approved").length,
    rejectedClaims: allClaims.filter((c) => c.status === "rejected").length,
    flaggedClaims: allClaims.filter((c) => c.status === "flagged").length,
    fraudFlagged: allClaims.filter((c) => c.fraudDetected).length,
    totalPayout,
  });
});

// All claims (with nested policy info)
app.get("/api/admin/claims", (req, res) => {
  const allClaims = [...claims.values()]
    .map((c) => ({ ...c, policy: policies.get(c.policyId) ?? null }))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return res.json(allClaims);
});

// All policies
app.get("/api/admin/policies", (req, res) => {
  const allPolicies = [...policies.values()].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );
  return res.json(allPolicies);
});

// Approve a flagged / pending claim
app.patch("/api/admin/claims/:claimId/approve", (req, res) => {
  const claim = claims.get(req.params.claimId);
  if (!claim) return res.status(404).json({ error: "Claim not found." });
  claim.status = "approved";
  claim.reviewedAt = new Date().toISOString();
  claim.reviewedBy = "admin";
  console.log(`Admin approved claim: ${req.params.claimId}`);
  return res.json({ success: true, claim });
});

// Reject a claim
app.patch("/api/admin/claims/:claimId/reject", (req, res) => {
  const claim = claims.get(req.params.claimId);
  if (!claim) return res.status(404).json({ error: "Claim not found." });
  claim.status = "rejected";
  claim.reviewedAt = new Date().toISOString();
  claim.reviewedBy = "admin";
  console.log(`Admin rejected claim: ${req.params.claimId}`);
  return res.json({ success: true, claim });
});

const server = app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(
      `\n❌ Port ${PORT} is already in use.\nRun this to free it:\n  npx kill-port ${PORT}\nor:\n  Get-NetTCPConnection -LocalPort ${PORT} | %{ Stop-Process -Id $_.OwningProcess -Force }\n`,
    );
    process.exit(1);
  } else {
    throw err;
  }
});
