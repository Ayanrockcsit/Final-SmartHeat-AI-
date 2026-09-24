import Notification from "../models/Notification.js";
import { sendHeatAlert } from "../services/notificationService.js";

export async function listNotifications(req, res, next) {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 }).limit(50).catch(() => []);
    res.json({ success: true, data: notifications });
  } catch (err) {
    next(err);
  }
}

export async function sendTestNotification(req, res, next) {
  try {
    const { location, severity = "HIGH", channel = "SMS", to } = req.body;
    if (!location) return res.status(400).json({ success: false, message: "location is required" });

    const fakeAlert = {
      _id: `test-${Date.now()}`,
      location, severity,
      title: `Test ${severity} Heat Alert`,
      message: `This is a test alert for ${location}. In DEMO_MODE, no real message is sent.`,
    };

    const result = await sendHeatAlert({
      to: to || "+910000000000",
      alert: fakeAlert,
      channel,
      userId: req.user?._id,
    });

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
