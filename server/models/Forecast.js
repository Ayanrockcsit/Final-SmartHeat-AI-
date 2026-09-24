import mongoose from "mongoose";

const dayForecastSchema = new mongoose.Schema(
  {
    date: String,
    temperature: Number,
    feelsLike: Number,
    humidity: Number,
    windSpeed: Number,
    heatIndex: Number,
    wbgt: mongoose.Schema.Types.Mixed,
    thermalStressScore: Number,
    riskLevel: String,
    rainProbability: Number,
    uvIndex: Number,
  },
  { _id: false }
);

const forecastSchema = new mongoose.Schema(
  {
    location: { type: String, required: true, index: true },
    days: [dayForecastSchema],
    source: { type: String, enum: ["LIVE", "DEMO"], default: "DEMO" },
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("Forecast", forecastSchema);
