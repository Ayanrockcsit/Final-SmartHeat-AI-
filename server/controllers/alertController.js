import Alert from "../models/Alert.js";
import { generateDemoCurrent, DEMO_LOCATIONS } from "../services/demoData.js";
import { analyzeThermalStress } from "../services/thermalStressService.js";
import { detectHeatwave } from "../services/heatwaveService.js";
import { createAlertIfNeeded, buildAlertsFromRisk } from "../services/alertService.js";

export async function listAlerts(req, res, next) {
  try {
    const alerts = await Alert.find().sort({ createdAt: -1 }).limit(50).catch(() => []);
    res.json({ success: true, data: alerts });
  } catch (err) {
    next(err);
  }
}

export async function listAlertsForLocation(req, res, next) {
  try {
    const { location } = req.params;
    const alerts = await Alert.find({ location }).sort({ createdAt: -1 }).limit(20).catch(() => []);
    res.json({ success: true, data: alerts });
  } catch (err) {
    next(err);
  }
}

/**
 * Sweeps configured demo locations, evaluates risk, and creates alerts
 * where thresholds are crossed (deduped per day). Triggered by the cron
 * job in server.js every 10 minutes, and can be called on demand too.
 */
export async function sweepAndCreateAlerts() {
  const created = [];
  for (const loc of DEMO_LOCATIONS) {
    const current = generateDemoCurrent(loc.name);
    const analysis = analyzeThermalStress({
      temperature: current.temperature, humidity: current.humidity,
      windSpeed: current.windSpeed, solarRadiation: current.solarRadiation,
    });
    const heatwave = detectHeatwave({ temperature: current.temperature, heatIndex: analysis.heatIndex, forecastDays: [] });

    const toCreate = buildAlertsFromRisk({
      location: loc.name, riskLevel: analysis.riskLevel, heatwaveDetected: heatwave.heatwaveDetected,
    });
    for (const a of toCreate) {
      const { alert, isNew } = await createAlertIfNeeded(a);
      if (isNew) created.push(alert);
    }
  }
  return created;
}
