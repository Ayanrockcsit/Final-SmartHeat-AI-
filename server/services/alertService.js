import Alert from "../models/Alert.js";

const ALERT_COPY = {
  EXTREME_HEAT: (loc) => ({
    title: "Extreme Heat Alert",
    message: `Extreme heat is expected in ${loc}. Avoid outdoor activity between 11am-4pm, stay hydrated, and check on elderly neighbours and outdoor workers.`,
  }),
  HIGH_THERMAL_STRESS: (loc) => ({
    title: "High Thermal Stress Alert",
    message: `Human thermal stress conditions in ${loc} are elevated. Limit strenuous outdoor exertion and drink water regularly.`,
  }),
  HEATWAVE: (loc) => ({
    title: "Heatwave Conditions Detected",
    message: `SmartHeat AI has detected heatwave conditions in ${loc}. Follow local heat-safety guidance and avoid unnecessary sun exposure.`,
  }),
};

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Creates an alert only if an equivalent one (same location+type+severity)
 * hasn't already been created today - this is the duplicate-prevention
 * described in the spec ("Already Sent? YES -> Don't Send").
 */
export async function createAlertIfNeeded({ location, type, severity }) {
  const dedupeKey = `${location}|${type}|${severity}|${todayKey()}`;

  const existing = await Alert.findOne({ dedupeKey }).catch(() => null);
  if (existing) return { alert: existing, isNew: false };

  const copy = ALERT_COPY[type] ? ALERT_COPY[type](location) : { title: type, message: `${type} conditions detected in ${location}.` };

  const alertDoc = {
    location, type, severity, dedupeKey,
    title: copy.title, message: copy.message,
    startTime: new Date(),
    source: "SMARTHEAT_AI",
  };

  try {
    const alert = await Alert.create(alertDoc);
    return { alert, isNew: true };
  } catch {
    // No DB connection in this environment (e.g. demo without Mongo) -
    // return an in-memory alert object so the API still responds usefully.
    return { alert: { ...alertDoc, _id: `demo-${Date.now()}` }, isNew: true };
  }
}

export function buildAlertsFromRisk({ location, riskLevel, heatwaveDetected }) {
  const toCreate = [];
  if (riskLevel === "EXTREME" || riskLevel === "VERY_HIGH") {
    toCreate.push({ location, type: "EXTREME_HEAT", severity: riskLevel });
  } else if (riskLevel === "HIGH") {
    toCreate.push({ location, type: "HIGH_THERMAL_STRESS", severity: riskLevel });
  }
  if (heatwaveDetected) {
    toCreate.push({ location, type: "HEATWAVE", severity: riskLevel });
  }
  return toCreate;
}
