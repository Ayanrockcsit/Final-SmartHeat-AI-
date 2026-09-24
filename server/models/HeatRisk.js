import mongoose from "mongoose";

const heatRiskSchema = new mongoose.Schema(
  {
    location: { type: String, required: true, index: true },
    lat: Number,
    lon: Number,
    temperature: Number,
    feelsLike: Number,
    humidity: Number,
    windSpeed: Number,
    solarRadiation: Number,
    heatIndex: Number,
    wbgt: { type: mongoose.Schema.Types.Mixed, default: null },
    thermalStressScore: Number,
    riskLevel: {
      type: String,
      enum: ["LOW", "MODERATE", "HIGH", "VERY_HIGH", "EXTREME"],
    },
    heatwaveDetected: { type: Boolean, default: false },
    severity: String,
    confidence: Number,
    source: { type: String, enum: ["LIVE", "DEMO"], default: "DEMO" },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("HeatRisk", heatRiskSchema);
