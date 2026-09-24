import Notification from "../models/Notification.js";

let twilioClient = null;
function getTwilioClient() {
  if (twilioClient) return twilioClient;
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } = process.env;
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) return null;
  // Lazy import so the app runs fine without the twilio package configured
  return import("twilio").then((mod) => {
    twilioClient = mod.default(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    return twilioClient;
  });
}

function isLiveNotifyConfigured() {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.DEMO_MODE !== "true"
  );
}

async function saveNotification(doc) {
  try {
    return await Notification.create(doc);
  } catch {
    return { ...doc, _id: `demo-${Date.now()}` };
  }
}

export async function sendSMS({ to, message, alertId, userId, location }) {
  if (!isLiveNotifyConfigured()) {
    return saveNotification({
      userId, alertId, location, channel: "SMS", status: "SIMULATED_SENT",
      message, sentAt: new Date(), providerMessageId: `SIM-SMS-${Date.now()}`,
    });
  }
  try {
    const client = await getTwilioClient();
    const res = await client.messages.create({ body: message, from: process.env.TWILIO_PHONE_NUMBER, to });
    return saveNotification({
      userId, alertId, location, channel: "SMS", status: "SENT",
      message, sentAt: new Date(), providerMessageId: res.sid,
    });
  } catch (err) {
    return saveNotification({
      userId, alertId, location, channel: "SMS", status: "FAILED", message, error: err.message,
    });
  }
}

export async function sendWhatsApp({ to, message, alertId, userId, location }) {
  if (!isLiveNotifyConfigured()) {
    return saveNotification({
      userId, alertId, location, channel: "WHATSAPP", status: "SIMULATED_SENT",
      message, sentAt: new Date(), providerMessageId: `SIM-WA-${Date.now()}`,
    });
  }
  try {
    const client = await getTwilioClient();
    const res = await client.messages.create({
      body: message,
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${to}`,
    });
    return saveNotification({
      userId, alertId, location, channel: "WHATSAPP", status: "SENT",
      message, sentAt: new Date(), providerMessageId: res.sid,
    });
  } catch (err) {
    return saveNotification({
      userId, alertId, location, channel: "WHATSAPP", status: "FAILED", message, error: err.message,
    });
  }
}

export async function sendHeatAlert({ to, alert, channel, userId }) {
  const message = `SmartHeat AI - ${alert.title}\n${alert.message}\nLocation: ${alert.location}`;
  if (channel === "WHATSAPP") return sendWhatsApp({ to, message, alertId: alert._id, userId, location: alert.location });
  return sendSMS({ to, message, alertId: alert._id, userId, location: alert.location });
}

export { isLiveNotifyConfigured };
