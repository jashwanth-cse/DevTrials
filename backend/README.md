# GigCover — Backend & Risk Engine

## Project Structure

```
backend/
├── main.py               # FastAPI app — /predict-risk & /detect-disruption endpoints
├── schemas.py            # Pydantic request/response models
├── risk_engine.py        # Insurance risk calculation logic
├── disruption_engine.py  # Environmental disruption detection logic
└── server.js             # Node/Express proxy server (port 5000)
```

---

## Running the Servers

### 1. Node/Express Proxy (port 5000)

```bash
npm run dev
```

### 2. Python AI Risk Engine (port 8000)

Install dependencies (first time only):

```bash
pip install fastapi uvicorn
```

Start the server:

```bash
uvicorn main:app --reload --port 8000
```

> The Node server will automatically call the Python service. If the Python service is not running, it falls back to a local calculation.

---

## API Reference

### `POST /predict-risk`

Calculates risk score, weekly premium, and coverage for a gig worker.

**URL:** `http://localhost:8000/predict-risk`

#### Request Body

```json
{
  "name": "Ravi Kumar",
  "city": "Chennai",
  "dailyIncome": 600,
  "platform": "Swiggy",
  "zoneType": "Urban"
}
```

| Field         | Type   | Description                             |
| ------------- | ------ | --------------------------------------- |
| `name`        | string | Worker's full name                      |
| `city`        | string | City of operation                       |
| `dailyIncome` | number | Average daily income in ₹ (must be > 0) |
| `platform`    | string | Gig platform (e.g. Swiggy, Zomato)      |
| `zoneType`    | string | `Urban`, `SemiUrban`, or `Rural`        |

#### Expected Response

```json
{
  "riskScore": 0.85,
  "weeklyPremium": 34,
  "coverageAmount": 420,
  "riskCategory": "High"
}
```

| Field            | Type    | Description                              |
| ---------------- | ------- | ---------------------------------------- |
| `riskScore`      | float   | Clamped composite risk score [0.30–0.90] |
| `weeklyPremium`  | integer | Weekly insurance premium in ₹            |
| `coverageAmount` | integer | Monthly coverage amount in ₹             |
| `riskCategory`   | string  | `Low`, `Medium`, or `High`               |

---

## Testing

### curl

```bash
curl -X POST http://localhost:8000/predict-risk \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ravi Kumar",
    "city": "Chennai",
    "dailyIncome": 600,
    "platform": "Swiggy",
    "zoneType": "Urban"
  }'
```

### Sample Request / Response

**Request:**

```json
{
  "city": "Chennai",
  "dailyIncome": 600,
  "platform": "Swiggy",
  "zoneType": "Urban"
}
```

**Response:**

```json
{
  "riskScore": 0.95,
  "weeklyPremium": 38,
  "coverageAmount": 420,
  "riskCategory": "High"
}
```

> **Note:** `riskScore` is clamped to a maximum of `0.90`.  
> Chennai (0.75) + Swiggy (0.10) + Urban (0.10) = 0.95 → clamped to **0.90**.

### Interactive Docs

FastAPI provides built-in API docs when the server is running:

- Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
- ReDoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

---

## Disruption Detection API

### `POST /detect-disruption`

Evaluates environmental conditions and determines whether a payout should be triggered.

**URL:** `http://localhost:8000/detect-disruption`

#### Request Body

```json
{
  "city": "Chennai",
  "rainfall": 120,
  "temperature": 33,
  "aqi": 150,
  "trafficIndex": 0.5,
  "curfewActive": false
}
```

| Field          | Type    | Description                                        |
| -------------- | ------- | -------------------------------------------------- |
| `city`         | string  | City where the worker operates                     |
| `rainfall`     | float   | Rainfall in mm (≥ 0)                               |
| `temperature`  | float   | Temperature in °C                                  |
| `aqi`          | float   | Air Quality Index (≥ 0)                            |
| `trafficIndex` | float   | Congestion index 0.0–1.0 (0 = clear, 1 = gridlock) |
| `curfewActive` | boolean | Whether a curfew or city shutdown is active        |

#### Disruption Thresholds

| Condition             | Trigger level         | Severity  |
| --------------------- | --------------------- | --------- |
| Heavy Rain            | > 80 mm               | 0.90      |
| Heavy Rain (moderate) | 50–80 mm              | 0.60      |
| Heat Wave             | > 42°C                | 0.85      |
| Air Pollution         | AQI > 350             | 0.80      |
| Traffic Disruption    | index > 0.85          | raw index |
| Curfew / Shutdown     | `curfewActive = true` | 0.95      |

> `triggerPayout` is `true` when the winning `severityScore > 0.70`.

---

### Test Scenarios

#### Test Case 1 — Heavy Rain

**Request:**

```json
{
  "city": "Chennai",
  "rainfall": 120,
  "temperature": 33,
  "aqi": 150,
  "trafficIndex": 0.5,
  "curfewActive": false
}
```

**Expected Response:**

```json
{
  "disruptionDetected": true,
  "disruptionType": "Heavy Rain",
  "severityScore": 0.9,
  "triggerPayout": true,
  "reason": "Rainfall exceeded 80 mm — severe disruption threshold"
}
```

**curl:**

```bash
curl -X POST http://localhost:8000/detect-disruption \
  -H "Content-Type: application/json" \
  -d '{"city":"Chennai","rainfall":120,"temperature":33,"aqi":150,"trafficIndex":0.5,"curfewActive":false}'
```

---

#### Test Case 2 — Pollution Spike

**Request:**

```json
{
  "city": "Delhi",
  "rainfall": 0,
  "temperature": 35,
  "aqi": 380,
  "trafficIndex": 0.4,
  "curfewActive": false
}
```

**Expected Response:**

```json
{
  "disruptionDetected": true,
  "disruptionType": "Air Pollution",
  "severityScore": 0.8,
  "triggerPayout": true,
  "reason": "AQI exceeded 350 — hazardous air quality"
}
```

**curl:**

```bash
curl -X POST http://localhost:8000/detect-disruption \
  -H "Content-Type: application/json" \
  -d '{"city":"Delhi","rainfall":0,"temperature":35,"aqi":380,"trafficIndex":0.4,"curfewActive":false}'
```

---

#### Test Case 3 — Normal Conditions

**Request:**

```json
{
  "city": "Pune",
  "rainfall": 10,
  "temperature": 32,
  "aqi": 90,
  "trafficIndex": 0.4,
  "curfewActive": false
}
```

**Expected Response:**

```json
{
  "disruptionDetected": false,
  "disruptionType": null,
  "severityScore": 0.0,
  "triggerPayout": false,
  "reason": "No environmental disruptions detected"
}
```

**curl:**

```bash
curl -X POST http://localhost:8000/detect-disruption \
  -H "Content-Type: application/json" \
  -d '{"city":"Pune","rainfall":10,"temperature":32,"aqi":90,"trafficIndex":0.4,"curfewActive":false}'
```

---

## Fraud Detection API

### `POST /fraud-check`

Evaluates whether a claim submitted by a gig worker is legitimate.

**URL:** `http://localhost:8000/fraud-check`

#### Request Body

```json
{
  "claimEvent": "Heavy Rain",
  "weatherRainfall": 120,
  "aqi": 80,
  "city": "Mumbai",
  "gpsCity": "Mumbai",
  "recentClaimCount": 1
}
```

| Field              | Type    | Description                                          |
| ------------------ | ------- | ---------------------------------------------------- |
| `claimEvent`       | string  | Disruption type claimed by worker                    |
| `weatherRainfall`  | float   | Actual recorded rainfall in mm (≥ 0)                 |
| `aqi`              | float   | Actual recorded Air Quality Index (≥ 0)              |
| `city`             | string  | City registered on the policy                        |
| `gpsCity`          | string  | City detected from worker's GPS at claim time        |
| `recentClaimCount` | integer | Number of claims filed by this worker in last 7 days |

#### Fraud Scoring Rules

| Check                     | Condition                                          | Weight |
| ------------------------- | -------------------------------------------------- | ------ |
| Weather verification      | `claimEvent = "Heavy Rain"` AND `rainfall < 40 mm` | +0.4   |
| Pollution verification    | `claimEvent = "Pollution"` AND `aqi < 250`         | +0.3   |
| Location mismatch         | `gpsCity != city`                                  | +0.4   |
| Excessive claim frequency | `recentClaimCount > 3` within 7 days               | +0.3   |

> `fraudProbability` = sum of triggered weights, clamped to `[0.0, 1.0]`.  
> `fraudDetected = true` when `fraudProbability > 0.6`.

---

### Fraud Detection Test Cases

#### Test Case 1 — Legitimate Rain Claim

**Request:**

```json
{
  "claimEvent": "Heavy Rain",
  "weatherRainfall": 120,
  "aqi": 80,
  "city": "Mumbai",
  "gpsCity": "Mumbai",
  "recentClaimCount": 1
}
```

**Expected Response:**

```json
{
  "fraudDetected": false,
  "fraudProbability": 0.0,
  "fraudReasons": []
}
```

**curl:**

```bash
curl -X POST http://localhost:8000/fraud-check \
  -H "Content-Type: application/json" \
  -d '{"claimEvent":"Heavy Rain","weatherRainfall":120,"aqi":80,"city":"Mumbai","gpsCity":"Mumbai","recentClaimCount":1}'
```

---

#### Test Case 2 — Fake Rain Claim

**Request:**

```json
{
  "claimEvent": "Heavy Rain",
  "weatherRainfall": 10,
  "aqi": 80,
  "city": "Mumbai",
  "gpsCity": "Mumbai",
  "recentClaimCount": 1
}
```

**Expected Response:**

```json
{
  "fraudDetected": false,
  "fraudProbability": 0.4,
  "fraudReasons": [
    "Claimed 'Heavy Rain' but recorded rainfall is only 10.0 mm (minimum required: 40.0 mm)"
  ]
}
```

**curl:**

```bash
curl -X POST http://localhost:8000/fraud-check \
  -H "Content-Type: application/json" \
  -d '{"claimEvent":"Heavy Rain","weatherRainfall":10,"aqi":80,"city":"Mumbai","gpsCity":"Mumbai","recentClaimCount":1}'
```

---

#### Test Case 3 — Location Spoofing

**Request:**

```json
{
  "claimEvent": "Heavy Rain",
  "weatherRainfall": 120,
  "aqi": 80,
  "city": "Chennai",
  "gpsCity": "Bangalore",
  "recentClaimCount": 1
}
```

**Expected Response:**

```json
{
  "fraudDetected": true,
  "fraudProbability": 0.4,
  "fraudReasons": [
    "GPS location 'Bangalore' does not match policy city 'Chennai'"
  ]
}
```

**curl:**

```bash
curl -X POST http://localhost:8000/fraud-check \
  -H "Content-Type: application/json" \
  -d '{"claimEvent":"Heavy Rain","weatherRainfall":120,"aqi":80,"city":"Chennai","gpsCity":"Bangalore","recentClaimCount":1}'
```

---

#### Test Case 4 — Claim Spam

**Request:**

```json
{
  "claimEvent": "Heavy Rain",
  "weatherRainfall": 120,
  "aqi": 80,
  "city": "Mumbai",
  "gpsCity": "Mumbai",
  "recentClaimCount": 5
}
```

**Expected Response:**

```json
{
  "fraudDetected": false,
  "fraudProbability": 0.3,
  "fraudReasons": ["5 claims filed in the last 7 days (maximum allowed: 3)"]
}
```

**curl:**

```bash
curl -X POST http://localhost:8000/fraud-check \
  -H "Content-Type: application/json" \
  -d '{"claimEvent":"Heavy Rain","weatherRainfall":120,"aqi":80,"city":"Mumbai","gpsCity":"Mumbai","recentClaimCount":5}'
```

---

## Risk Calculation Logic

| Component         | Values                                                                             |
| ----------------- | ---------------------------------------------------------------------------------- |
| **City risk**     | High (Chennai/Mumbai/Kolkata) → 0.75 · Medium → 0.55 · Low → 0.35 · Default → 0.50 |
| **Platform risk** | Food delivery → 0.10 · Quick commerce → 0.08 · E-commerce → 0.05 · Default → 0.06  |
| **Zone risk**     | Urban → 0.10 · SemiUrban → 0.05 · Rural → 0.02                                     |
| **Risk score**    | Sum of above, clamped to `[0.30, 0.90]`                                            |
| **Premium**       | `riskScore × 40` (rounded)                                                         |
| **Coverage**      | `dailyIncome × 0.7` (rounded)                                                      |
| **Category**      | `< 0.45` Low · `≤ 0.70` Medium · `> 0.70` High                                     |
