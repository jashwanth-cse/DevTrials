import axios from "axios";

const FLOW_URL =
  "https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json";

// Approximate city centre coordinates for supported Indian cities
const CITY_COORDS = {
  Mumbai: { lat: 19.076, lon: 72.8777 },
  Chennai: { lat: 13.0827, lon: 80.2707 },
  Kolkata: { lat: 22.5726, lon: 88.3639 },
  Delhi: { lat: 28.6139, lon: 77.209 },
  Bangalore: { lat: 12.9716, lon: 77.5946 },
  Hyderabad: { lat: 17.385, lon: 78.4867 },
  Pune: { lat: 18.5204, lon: 73.8567 },
  Jaipur: { lat: 26.9124, lon: 75.7873 },
  Ahmedabad: { lat: 23.0225, lon: 72.5714 },
  Chandigarh: { lat: 30.7333, lon: 76.7794 },
};

/**
 * Fetch traffic congestion index for a city via TomTom Traffic Flow API.
 * Returns { trafficIndex } — a 0.0–1.0 normalised congestion score where
 * 1.0 = fully congested (current speed = 0) and 0.0 = free flow.
 * Throws on failure.
 */
export async function fetchTraffic(city) {
  const key = process.env.TOMTOM_API_KEY;
  if (!key || key === "your_tomtom_api_key_here") {
    throw new Error("TOMTOM_API_KEY not configured");
  }

  const coords = CITY_COORDS[city];
  if (!coords) throw new Error(`No coordinates found for city: ${city}`);

  const { data } = await axios.get(FLOW_URL, {
    params: {
      point: `${coords.lat},${coords.lon}`,
      key,
    },
    timeout: 6000,
  });

  const { currentSpeed, freeFlowSpeed } = data.flowSegmentData;
  if (!freeFlowSpeed || freeFlowSpeed <= 0) {
    throw new Error("TomTom returned invalid freeFlowSpeed");
  }

  // Congestion index: 0 = free flow, 1 = fully jammed
  const trafficIndex = parseFloat(
    Math.min(1, Math.max(0, 1 - currentSpeed / freeFlowSpeed)).toFixed(2),
  );

  return { trafficIndex };
}
