import { generateAdvisory } from "../services/aiService.js";

export async function getRecommendation(req, res, next) {
  try {
    const { location, temperature, humidity, windSpeed, heatIndex, wbgt, thermalStressScore, riskLevel } = req.body;
    if (!location || riskLevel === undefined) {
      return res.status(400).json({ success: false, message: "location and riskLevel are required" });
    }
    const advisory = await generateAdvisory({
      location, temperature, humidity, windSpeed, heatIndex, wbgt, thermalStressScore, riskLevel,
    });
    res.json({ success: true, data: advisory });
  } catch (err) {
    next(err);
  }
}
