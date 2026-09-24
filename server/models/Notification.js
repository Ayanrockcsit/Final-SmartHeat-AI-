import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    alertId: { type: mongoose.Schema.Types.ObjectId, ref: "Alert" },
    location: String,
    channel: { type: String, enum: ["SMS", "WHATSAPP"], required: true },
    status: {
      type: String,
      enum: ["PENDING", "SENT", "SIMULATED_SENT", "FAILED"],
      default: "PENDING",
    },
    message: String,
    sentAt: Date,
    providerMessageId: String,
    error: String,
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
