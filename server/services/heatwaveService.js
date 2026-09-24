/**
 * Heatwave detection — combines current + forecast persistence signals into
 * a labeled, confidence-scored system prediction. This is explicitly
 * SmartHeat AI's own classification (source: "SMARTHEAT_AI"), not an
 * official IMD heatwave declaration.
 */
export function detectHeatwave({ temperature, heatIndex, forecastDays = [] }) {
  let score = 0;
  const signals = [];

  if (temperature >= 40) { score += 30; signals.push("current temperature >= 40C"); }
  else if (temperature >= 37) { score += 15; signals.push("current temperature >= 37C"); }

  if (heatIndex >= 45) { score += 25; signals.push("heat index >= 45C"); }
  else if (heatIndex >= 38) { score += 12; signals.push("heat index >= 38C"); }

  const hotForecastDays = forecastDays.filter((d) => d.temperature >= 38).length;
  if (hotForecastDays >= 3) { score += 30; signals.push(`${hotForecastDays} of next days forecast >= 38C (persistence)`); }
  else if (hotForecastDays >= 2) { score += 15; signals.push(`${hotForecastDays} of next days forecast >= 38C`); }

  if (forecastDays.length && forecastDays.every((d) => d.temperature >= 36)) {
    score += 15;
    signals.push("sustained elevated temperatures across full forecast window");
  }

  const confidence = Math.min(95, score);
  const heatwaveDetected = confidence >= 45;

  let severity = "LOW";
  if (confidence >= 80) severity = "EXTREME";
  else if (confidence >= 65) severity = "VERY_HIGH";
  else if (confidence >= 45) severity = "HIGH";
  else if (confidence >= 25) severity = "MODERATE";

  return {
    heatwaveDetected,
    severity,
    confidence,
    source: "SMARTHEAT_AI",
    signals,
  };
}
