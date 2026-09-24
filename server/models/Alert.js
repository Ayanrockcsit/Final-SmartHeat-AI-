import mongoose from "mongoose";

const alertSchema = new mongoose.Schema(
  {
    location: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: [
        "EXTREME_HEAT", "HIGH_THERMAL_STRESS", "HEATWAVE",
        "HEAVY_RAIN", "STORM", "FOG", "LOW_VISIBILITY", "HIGH_UV",
      ],
      required: true,
    },
    severity: { type: String, enum: ["LOW", "MODERATE", "HIGH", "VERY_HIGH", "EXTREME"], required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    startTime: { type: Date, default: Date.now },
    endTime: Date,
    source: { type: String, default: "SMARTHEAT_AI" },
    dedupeKey: { type: String, index: true },
  },
  { timestamps: true }
);

export default mongoose.model("Alert", alertSchema);
