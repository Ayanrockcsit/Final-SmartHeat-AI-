import axios from "axios";

/**
 * Live weather source: Open-Meteo (https://open-meteo.com) — free, no API
 * key required, so the app has genuine live data out of the box. If
 * IMD_API_BASE_URL / IMD_API_KEY are configured, imdService.js is preferred
 * automatically for India-specific official data (see server.js wiring).
 */
const BASE_URL = "https://api.open-meteo.com/v1/forecast";
const GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search";

export async function geocodeLocation(name) {
  const { data } = await axios.get(GEOCODE_URL, {
    params: { name, count: 1, language: "en", format: "json" },
    timeout: 8000,
  });
  if (!data.results || data.results.length === 0) return null;
  const r = data.results[0];
  return { name: r.name, state: r.admin1, country: r.country, lat: r.latitude, lon: r.longitude };
}

/**
 * Live location search (multiple matches) - powers the frontend's search box
 * so a person can look up any real place, not just the preset demo cities.
 * Backed by Open-Meteo's free geocoding API, no key required.
 */
export async function searchLocations(query) {
  if (!query || query.trim().length < 2) return [];
  const { data } = await axios.get(GEOCODE_URL, {
    params: { name: query.trim(), count: 8, language: "en", format: "json" },
    timeout: 8000,
  });
  if (!data.results) return [];
  return data.results.map((r) => ({
    name: r.name,
    state: r.admin1 || null,
    country: r.country || null,
    lat: r.latitude,
    lon: r.longitude,
  }));
}

export async function fetchCurrentAndForecast({ lat, lon }) {
  const { data } = await axios.get(BASE_URL, {
    params: {
      latitude: lat,
      longitude: lon,
      current: [
        "temperature_2m", "relative_humidity_2m", "apparent_temperature",
        "wind_speed_10m", "shortwave_radiation", "uv_index", "precipitation_probability",
      ].join(","),
      daily: [
        "temperature_2m_max", "temperature_2m_min", "apparent_temperature_max",
        "relative_humidity_2m_max", "wind_speed_10m_max", "precipitation_probability_max",
        "uv_index_max",
      ].join(","),
      timezone: "auto",
      forecast_days: 5,
    },
    timeout: 8000,
  });

  const current = {
    temperature: data.current?.temperature_2m ?? null,
    feelsLike: data.current?.apparent_temperature ?? null,
    humidity: data.current?.relative_humidity_2m ?? null,
    windSpeed: data.current?.wind_speed_10m ?? null,
    solarRadiation: data.current?.shortwave_radiation ?? null,
    uvIndex: data.current?.uv_index ?? null,
    rainProbability: data.current?.precipitation_probability ?? null,
  };

  const days = (data.daily?.time || []).map((date, i) => ({
    date,
    temperature: data.daily.temperature_2m_max?.[i] ?? null,
    feelsLike: data.daily.apparent_temperature_max?.[i] ?? null,
    humidity: data.daily.relative_humidity_2m_max?.[i] ?? null,
    windSpeed: data.daily.wind_speed_10m_max?.[i] ?? null,
    rainProbability: data.daily.precipitation_probability_max?.[i] ?? null,
    uvIndex: data.daily.uv_index_max?.[i] ?? null,
  }));

  return { current, days };
}
