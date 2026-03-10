import axios from "axios";

const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

/**
 * Fetch current weather for a city via OpenWeatherMap.
 * Returns { temperature, rainfall } or throws on failure.
 */
export async function fetchWeather(city) {
  const key = process.env.OPENWEATHER_API_KEY;
  if (!key || key === "your_openweather_api_key_here") {
    throw new Error("OPENWEATHER_API_KEY not configured");
  }

  const { data } = await axios.get(BASE_URL, {
    params: { q: city, appid: key, units: "metric" },
    timeout: 6000,
  });

  const temperature = parseFloat(data.main.temp.toFixed(1));
  // rain["1h"] is optional — only present when it's actually raining
  const rainfall = parseFloat(((data.rain?.["1h"] ?? 0) * 10).toFixed(1)); // mm/10min → mm/h approx

  return { temperature, rainfall };
}
