import axios from "axios";

const BASE_URL = "https://api.waqi.info/feed";

/**
 * Fetch current AQI for a city via World Air Quality Index API.
 * Returns { aqi } or throws on failure.
 */
export async function fetchAQI(city) {
  const key = process.env.WAQI_API_KEY;
  if (!key || key === "your_waqi_api_key_here") {
    throw new Error("WAQI_API_KEY not configured");
  }

  const { data } = await axios.get(`${BASE_URL}/${encodeURIComponent(city)}/`, {
    params: { token: key },
    timeout: 6000,
  });

  if (data.status !== "ok") {
    throw new Error(`WAQI API error: ${data.data ?? "unknown"}`);
  }

  const aqi = parseInt(data.data.aqi, 10);
  if (isNaN(aqi)) throw new Error("WAQI returned non-numeric AQI");

  return { aqi };
}
