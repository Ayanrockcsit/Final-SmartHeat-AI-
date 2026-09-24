/**
 * Human Thermal Stress Score (0-100) and risk classification.
 *
 * This is SmartHeat AI's own composite score, built from three
 * documented heat-stress inputs (Heat Index, WBGT, and a wind-relief
 * factor), NOT a claim of a peer-reviewed medical index. This is
 * disclosed in README.md.
 *
 * Score composition (weights are configurable below):
 *   - Heat Index contributes up to 55 points (mapped 27C -> 0, 55C -> 55)
 *   - WBGT contributes up to 35 points (mapped 20C -> 0, 40C -> 35), when available
 *   - Wind relief subtracts up to 10 points for wind speeds above 15 km/h
 *
 * When WBGT is unavailable, its 35-point share is redistributed onto Heat
 * Index so the score still resolves to a defensible 0-100 range, and the
 * caller is expected to show "WBGT: Data unavailable" alongside it.
 */

export const RISK_THRESHOLDS = {
  LOW: 0,
  MODERATE: 30,
  HIGH: 55,
  VERY_HIGH: 75,
  EXTREME: 90,
};

export function classifyRisk(score) {
  if (score >= RISK_THRESHOLDS.EXTREME) return "EXTREME";
  if (score >= RISK_THRESHOLDS.VERY_HIGH) return "VERY_HIGH";
  if (score >= RISK_THRESHOLDS.HIGH) return "HIGH";
  if (score >= RISK_THRESHOLDS.MODERATE) return "MODERATE";
  return "LOW";
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

export function calculateThermalStressScore({ heatIndex, wbgt, windSpeedKmh }) {
  const hiWeight = wbgt == null ? 90 : 55;
  const wbgtWeight = wbgt == null ? 0 : 35;

  const hiScore = clamp(((heatIndex - 27) / (55 - 27)) * hiWeight, 0, hiWeight);
  const wbgtScore = wbgt == null ? 0 : clamp(((wbgt - 20) / (40 - 20)) * wbgtWeight, 0, wbgtWeight);

  let windRelief = 0;
  if (typeof windSpeedKmh === "number" && windSpeedKmh > 15) {
    windRelief = clamp((windSpeedKmh - 15) * 0.4, 0, 10);
  }

  const raw = hiScore + wbgtScore - windRelief;
  const score = Math.round(clamp(raw, 0, 100));

  return { score, riskLevel: classifyRisk(score) };
}
