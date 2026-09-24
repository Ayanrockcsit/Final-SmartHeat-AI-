import { geocodeLocation, fetchCurrentAndForecast, searchLocations } from "../services/weatherService.js";
import { isIMDConfigured, fetchIMDData } from "../services/imdService.js";
import { generateDemoCurrent, generateDemoForecastDays, DEMO_LOCATIONS } from "../services/demoData.js";
import { analyzeThermalStress } from "../services/thermalStressService.js";
import { detectHeatwave } from "../services/heatwaveService.js";
import HeatRisk from "../models/HeatRisk.js";
import Forecast from "../models/Forecast.js";

const isDemo = () => process.env.DEMO_MODE === "true";

async function getLocationCoords(locationName, coordsHint) {
  // If the caller already knows exact coordinates (e.g. picked from the live
  // search box), use them directly and skip a redundant geocoding call.
  if (coordsHint && typeof coordsHint.lat === "number" && typeof coordsHint.lon === "number") {
    return { name: locationName, lat: coordsHint.lat, lon: coordsHint.lon };
  }
  const known = DEMO_LOCATIONS.find((l) => l.name.toLowerCase() === locationName.toLowerCase());
  if (known) return known;
  if (!isDemo()) {
    const geo = await geocodeLocation(locationName);
    if (geo) return geo;
  }
  // Fallback default (Lucknow) if geocoding fails / offline
  return DEMO_LOCATIONS[0];
}

async function getCurrentWeatherFor(locationName, coordsHint) {
  const loc = await getLocationCoords(locationName, coordsHint);

  if (isDemo()) {
    return { loc, current: generateDemoCurrent(locationName), source: "DEMO" };
  }

  if (isIMDConfigured()) {
    try {
      const imd = await fetchIMDData(locationName);
      return { loc, current: imd, source: "LIVE" };
    } catch {
      // fall through to Open-Meteo
    }
  }

  try {
    const { current } = await fetchCurrentAndForecast({ lat: loc.lat, lon: loc.lon });
    return { loc, current, source: "LIVE" };
  } catch (err) {
    // Live source unreachable - degrade gracefully to demo data rather than crash
    return { loc, current: generateDemoCurrent(locationName), source: "DEMO" };
  }
}

async function getForecastFor(locationName, coordsHint) {
  const loc = await getLocationCoords(locationName, coordsHint);

  if (isDemo()) {
    return { loc, days: generateDemoForecastDays(locationName), source: "DEMO" };
  }

  try {
    const { days } = await fetchCurrentAndForecast({ lat: loc.lat, lon: loc.lon });
    return { loc, days, source: "LIVE" };
  } catch {
    return { loc, days: generateDemoForecastDays(locationName), source: "DEMO" };
  }
}

export async function searchHeatLocations(req, res, next) {
  try {
    const q = req.query.q || "";
    if (isDemo()) {
      const matches = DEMO_LOCATIONS.filter((l) => l.name.toLowerCase().includes(q.toLowerCase()));
      return res.json({ success: true, data: matches, source: "DEMO" });
    }
    const results = await searchLocations(q);
    res.json({ success: true, data: results, source: "LIVE" });
  } catch (err) {
    next(err);
  }
}

function coordsHintFromQuery(req) {
  const lat = parseFloat(req.query.lat);
  const lon = parseFloat(req.query.lon);
  return Number.isFinite(lat) && Number.isFinite(lon) ? { lat, lon } : null;
}

export async function getCurrentHeat(req, res, next) {
  try {
    const location = req.query.location || "Lucknow";
    const { loc, current, source } = await getCurrentWeatherFor(location, coordsHintFromQuery(req));

    const analysis = analyzeThermalStress({
      temperature: current.temperature,
      humidity: current.humidity,
      windSpeed: current.windSpeed,
      solarRadiation: current.solarRadiation,
    });

    const result = {
      location: loc.name, lat: loc.lat, lon: loc.lon,
      temperature: current.temperature, feelsLike: current.feelsLike,
      humidity: current.humidity, windSpeed: current.windSpeed,
      solarRadiation: current.solarRadiation ?? null,
      uvIndex: current.uvIndex ?? null, rainProbability: current.rainProbability ?? null,
      ...analysis, source,
    };

    HeatRisk.create({ ...result, timestamp: new Date() }).catch(() => {});

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function getHeatForecast(req, res, next) {
  try {
    const location = req.query.location || "Lucknow";
    const { loc, days, source } = await getForecastFor(location, coordsHintFromQuery(req));

    const analyzedDays = days.map((d) => {
      const analysis = analyzeThermalStress({
        temperature: d.temperature, humidity: d.humidity,
        windSpeed: d.windSpeed, solarRadiation: null,
      });
      return { ...d, ...analysis };
    });

    Forecast.create({ location: loc.name, days: analyzedDays, source, generatedAt: new Date() }).catch(() => {});

    res.json({ success: true, data: { location: loc.name, source, days: analyzedDays } });
  } catch (err) {
    next(err);
  }
}

export async function getHeatRisk(req, res, next) {
  try {
    const location = req.query.location || "Lucknow";
    const hint = coordsHintFromQuery(req);
    const { current, source } = await getCurrentWeatherFor(location, hint);
    const { days } = await getForecastFor(location, hint);

    const analysis = analyzeThermalStress({
      temperature: current.temperature, humidity: current.humidity,
      windSpeed: current.windSpeed, solarRadiation: current.solarRadiation,
    });

    const heatwave = detectHeatwave({
      temperature: current.temperature, heatIndex: analysis.heatIndex, forecastDays: days,
    });

    res.json({ success: true, data: { location, source, ...analysis, ...heatwave } });
  } catch (err) {
    next(err);
  }
}

export async function getHeatMap(req, res, next) {
  try {
    const results = await Promise.all(
      DEMO_LOCATIONS.map(async (loc) => {
        const { current, source } = await getCurrentWeatherFor(loc.name);
        const analysis = analyzeThermalStress({
          temperature: current.temperature, humidity: current.humidity,
          windSpeed: current.windSpeed, solarRadiation: current.solarRadiation,
        });
        const heatwave = detectHeatwave({ temperature: current.temperature, heatIndex: analysis.heatIndex, forecastDays: [] });
        return {
          location: loc.name, state: loc.state, lat: loc.lat, lon: loc.lon,
          vulnerablePopulationPct: loc.vulnerablePopulationPct,
          temperature: current.temperature, humidity: current.humidity,
          ...analysis, heatwaveDetected: heatwave.heatwaveDetected, source,
        };
      })
    );
    res.json({ success: true, data: results });
  } catch (err) {
    next(err);
  }
}
