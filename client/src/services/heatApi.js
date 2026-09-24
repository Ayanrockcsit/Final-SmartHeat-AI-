import api from "./api.js";

// coords is optional { lat, lon } — pass it when the caller already has exact
// coordinates (e.g. from a live search result) to skip a redundant geocode.
function withCoords(location, coords) {
  const params = { location };
  if (coords) { params.lat = coords.lat; params.lon = coords.lon; }
  return params;
}

export const getCurrentHeat = (location, coords) => api.get("/heat/current", { params: withCoords(location, coords) }).then((r) => r.data.data);
export const getHeatRisk = (location, coords) => api.get("/heat/risk", { params: withCoords(location, coords) }).then((r) => r.data.data);
export const getHeatForecast = (location, coords) => api.get("/heat/forecast", { params: withCoords(location, coords) }).then((r) => r.data.data);
export const getHeatMap = () => api.get("/heat/map").then((r) => r.data.data);
export const getAlerts = () => api.get("/alerts").then((r) => r.data.data);
export const getLocationAlerts = (location) => api.get(`/alerts/location/${location}`).then((r) => r.data.data);

// Live location search (Open-Meteo geocoding), powers the dashboard's search box.
export const searchLocations = (q) => api.get("/weather/search", { params: { q } }).then((r) => r.data.data);
