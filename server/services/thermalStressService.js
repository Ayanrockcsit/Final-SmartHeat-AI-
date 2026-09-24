import { calculateHeatIndex } from "../utils/heatIndex.js";
import { calculateWBGT } from "../utils/wbgt.js";
import { calculateThermalStressScore } from "../utils/riskScore.js";

/**
 * Central engine: raw weather fields in -> full thermal-stress analysis out.
 * Every downstream feature (dashboard, forecast, map, alerts) calls this
 * so the scoring logic exists in exactly one place.
 */
export function analyzeThermalStress({ temperature, humidity, windSpeed, solarRadiation }) {
  const heatIndex = calculateHeatIndex(temperature, humidity);

  const wbgtResult = calculateWBGT({
    tempC: temperature,
    rh: humidity,
    windSpeedKmh: windSpeed,
    solarRadiation,
  });
  const wbgt = wbgtResult.status === "UNAVAILABLE" ? null : wbgtResult.value;

  const { score, riskLevel } = calculateThermalStressScore({
    heatIndex,
    wbgt,
    windSpeedKmh: windSpeed,
  });

  return {
    heatIndex,
    wbgt: wbgtResult.status === "UNAVAILABLE" ? "Data unavailable" : wbgtResult.value,
    wbgtStatus: wbgtResult.status,
    thermalStressScore: score,
    riskLevel,
  };
}
