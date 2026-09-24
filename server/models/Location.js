import mongoose from "mongoose";

const locationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    state: String,
    lat: { type: Number, required: true },
    lon: { type: Number, required: true },
    population: Number,
    vulnerablePopulationPct: Number,
  },
  { timestamps: true }
);

export default mongoose.model("Location", locationSchema);
