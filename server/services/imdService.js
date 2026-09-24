import axios from "axios";

/**
 * Optional India Meteorological Department integration point.
 * Populate IMD_API_BASE_URL / IMD_API_KEY in .env to use an official feed
 * when your institution/organization has access to one. Until then this
 * module is inactive and weatherService.js (Open-Meteo) supplies live data.
 */
export function isIMDConfigured() {
  return Boolean(process.env.IMD_API_BASE_URL && process.env.IMD_API_KEY);
}

export async function fetchIMDData(location) {
  if (!isIMDConfigured()) {
    throw new Error("IMD integration not configured (set IMD_API_BASE_URL and IMD_API_KEY)");
  }
  const { data } = await axios.get(`${process.env.IMD_API_BASE_URL}`, {
    params: { location, key: process.env.IMD_API_KEY },
    timeout: 8000,
  });
  return data;
}
