/**
 * DEMO_MODE data generator — realistic simulated values so the whole app
 * (dashboard, forecast, map, alerts, notifications) works with zero external
 * API calls. Every response built from this file is labeled "DEMO" at the
 * point it reaches the client, per the project's data-honesty requirement.
 */

export const DEMO_LOCATIONS = [
  { name: "Lucknow", state: "Uttar Pradesh", lat: 26.8467, lon: 80.9462, population: 3600000, vulnerablePopulationPct: 14 },
  { name: "Delhi", state: "Delhi", lat: 28.6139, lon: 77.209, population: 32900000, vulnerablePopulationPct: 12 },
  { name: "Jaipur", state: "Rajasthan", lat: 26.9124, lon: 75.7873, population: 3900000, vulnerablePopulationPct: 15 },
  { name: "Nagpur", state: "Maharashtra", lat: 21.1458, lon: 79.0882, population: 2500000, vulnerablePopulationPct: 13 },
  { name: "Ahmedabad", state: "Gujarat", lat: 23.0225, lon: 72.5714, population: 8300000, vulnerablePopulationPct: 11 },
  { name: "Varanasi", state: "Uttar Pradesh", lat: 25.3176, lon: 82.9739, population: 1400000, vulnerablePopulationPct: 16 },
];

// Deterministic pseudo-random so a given location looks stable within a day
function seededRandom(seed) {
  let x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function seedFromString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = (hash << 5) - hash + str.charCodeAt(i);
  return Math.abs(hash) % 1000;
}

export function generateDemoCurrent(locationName) {
  const seed = seedFromString(locationName) + new Date().getHours();
  const r = seededRandom(seed);
  const baseTemp = 34 + r * 12; // 34-46C, heatwave-relevant range
  const humidity = 30 + seededRandom(seed + 1) * 45; // 30-75%
  const windSpeed = 4 + seededRandom(seed + 2) * 14; // 4-18 km/h
  const solarRadiation = 400 + seededRandom(seed + 3) * 500;
  const uvIndex = 6 + seededRandom(seed + 4) * 5;

  return {
    temperature: Math.round(baseTemp * 10) / 10,
    feelsLike: Math.round((baseTemp + 3 + seededRandom(seed + 5) * 5) * 10) / 10,
    humidity: Math.round(humidity),
    windSpeed: Math.round(windSpeed * 10) / 10,
    solarRadiation: Math.round(solarRadiation),
    uvIndex: Math.round(uvIndex * 10) / 10,
    rainProbability: Math.round(seededRandom(seed + 6) * 25),
  };
}

export function generateDemoForecastDays(locationName) {
  const days = [];
  const now = new Date();
  for (let i = 0; i < 5; i++) {
    const seed = seedFromString(locationName) + i * 17;
    const temp = 33 + seededRandom(seed) * 12 - i * 0.8;
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    days.push({
      date: d.toISOString().slice(0, 10),
      temperature: Math.round(temp * 10) / 10,
      feelsLike: Math.round((temp + 3 + seededRandom(seed + 1) * 4) * 10) / 10,
      humidity: Math.round(30 + seededRandom(seed + 2) * 45),
      windSpeed: Math.round((4 + seededRandom(seed + 3) * 14) * 10) / 10,
      rainProbability: Math.round(seededRandom(seed + 4) * 30),
      uvIndex: Math.round((6 + seededRandom(seed + 5) * 5) * 10) / 10,
    });
  }
  return days;
}
