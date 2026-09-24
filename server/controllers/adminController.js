import HeatRisk from "../models/HeatRisk.js";
import Alert from "../models/Alert.js";
import Notification from "../models/Notification.js";
import { DEMO_LOCATIONS, generateDemoCurrent } from "../services/demoData.js";
import { analyzeThermalStress } from "../services/thermalStressService.js";
import { detectHeatwave } from "../services/heatwaveService.js";

async function currentSnapshot() {
  return Promise.all(
    DEMO_LOCATIONS.map(async (loc) => {
      const current = generateDemoCurrent(loc.name);
      const analysis = analyzeThermalStress({
        temperature: current.temperature, humidity: current.humidity,
        windSpeed: current.windSpeed, solarRadiation: current.solarRadiation,
      });
      const heatwave = detectHeatwave({ temperature: current.temperature, heatIndex: analysis.heatIndex, forecastDays: [] });
      return { location: loc.name, state: loc.state, ...analysis, heatwaveDetected: heatwave.heatwaveDetected };
    })
  );
}

export async function getAdminDashboard(req, res, next) {
  try {
    const snapshot = await currentSnapshot();

    const counts = { HIGH: 0, VERY_HIGH: 0, EXTREME: 0 };
    let heatwaveCount = 0;
    for (const s of snapshot) {
      if (counts[s.riskLevel] !== undefined) counts[s.riskLevel]++;
      if (s.heatwaveDetected) heatwaveCount++;
    }

    const activeAlerts = await Alert.countDocuments().catch(() => 0);

    res.json({
      success: true,
      data: {
        totalMonitoredLocations: DEMO_LOCATIONS.length,
        activeHeatAlerts: activeAlerts,
        highRiskLocations: counts.HIGH,
        veryHighRiskLocations: counts.VERY_HIGH,
        extremeRiskLocations: counts.EXTREME,
        predictedHeatwaves: heatwaveCount,
        locations: snapshot,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getAdminRisks(req, res, next) {
  try {
    const risks = await HeatRisk.find().sort({ createdAt: -1 }).limit(100).catch(() => []);
    res.json({ success: true, data: risks });
  } catch (err) {
    next(err);
  }
}

export async function getAdminAlerts(req, res, next) {
  try {
    const alerts = await Alert.find().sort({ createdAt: -1 }).limit(100).catch(() => []);
    res.json({ success: true, data: alerts });
  } catch (err) {
    next(err);
  }
}

export async function getAdminNotifications(req, res, next) {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 }).limit(100).catch(() => []);
    res.json({ success: true, data: notifications });
  } catch (err) {
    next(err);
  }
}
