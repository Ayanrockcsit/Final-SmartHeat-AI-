import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar.jsx";
import RiskMap from "../components/RiskMap.jsx";
import NotificationStatus from "../components/NotificationStatus.jsx";
import { getAdminDashboard, getAdminNotifications } from "../services/adminApi.js";
import { sendTestNotification } from "../services/notificationApi.js";
import { riskMeta } from "../utils/risk.js";

const STAT_LABELS = [
  ["totalMonitoredLocations", "Monitored locations"],
  ["activeHeatAlerts", "Active heat alerts"],
  ["highRiskLocations", "High risk"],
  ["veryHighRiskLocations", "Very high risk"],
  ["extremeRiskLocations", "Extreme risk"],
  ["predictedHeatwaves", "Predicted heatwaves"],
];

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [testForm, setTestForm] = useState({ location: "Lucknow", severity: "HIGH", channel: "SMS" });
  const [sending, setSending] = useState(false);

  function refresh() {
    getAdminDashboard().then(setData);
    getAdminNotifications().then(setNotifications).catch(() => {});
  }

  useEffect(refresh, []);

  async function handleTestAlert(e) {
    e.preventDefault();
    setSending(true);
    try {
      await sendTestNotification(testForm);
      refresh();
    } finally {
      setSending(false);
    }
  }

  const mapLocations = (data?.locations || []).map((l) => ({
    ...l,
    lat: l.lat, lon: l.lon,
  }));

  return (
    <div>
      <Navbar />
      <div className="mx-auto max-w-6xl px-5 py-10">
        <h1 className="font-display text-2xl font-semibold text-ink-900">Authority dashboard</h1>
        <p className="text-sm text-ink-500">Heatwave monitoring across all tracked locations.</p>

        {data && (
          <>
            <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
              {STAT_LABELS.map(([key, label]) => (
                <div key={key} className="rounded-2xl border border-ink-100 bg-white p-5">
                  <p className="font-display text-3xl font-semibold text-ink-900">{data[key]}</p>
                  <p className="mt-1 text-xs text-ink-500">{label}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <h2 className="mb-3 font-display text-xl font-semibold text-ink-900">Locations by risk</h2>
                <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-ink-100 text-left text-ink-400">
                        <th className="px-5 py-3 font-normal">Location</th>
                        <th className="px-5 py-3 font-normal">Score</th>
                        <th className="px-5 py-3 font-normal">Risk</th>
                        <th className="px-5 py-3 font-normal">Heatwave</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.locations.map((l) => {
                        const meta = riskMeta(l.riskLevel);
                        return (
                          <tr key={l.location} className="border-b border-ink-100 last:border-0">
                            <td className="px-5 py-3 text-ink-800">{l.location}</td>
                            <td className="px-5 py-3 text-ink-600">{l.thermalStressScore}/100</td>
                            <td className="px-5 py-3">
                              <span className="risk-badge" style={{ background: meta.bg, color: meta.color }}>{meta.label}</span>
                            </td>
                            <td className="px-5 py-3 text-ink-600">{l.heatwaveDetected ? "Yes" : "No"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-2xl border border-ink-100 bg-white p-6">
                <h2 className="font-display text-lg font-semibold text-ink-900">Send test alert</h2>
                <form onSubmit={handleTestAlert} className="mt-4 flex flex-col gap-3">
                  <select
                    value={testForm.location}
                    onChange={(e) => setTestForm({ ...testForm, location: e.target.value })}
                    className="rounded-xl border border-ink-100 px-3 py-2 text-sm"
                  >
                    {data.locations.map((l) => <option key={l.location} value={l.location}>{l.location}</option>)}
                  </select>
                  <select
                    value={testForm.severity}
                    onChange={(e) => setTestForm({ ...testForm, severity: e.target.value })}
                    className="rounded-xl border border-ink-100 px-3 py-2 text-sm"
                  >
                    {["LOW", "MODERATE", "HIGH", "VERY_HIGH", "EXTREME"].map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
                  </select>
                  <select
                    value={testForm.channel}
                    onChange={(e) => setTestForm({ ...testForm, channel: e.target.value })}
                    className="rounded-xl border border-ink-100 px-3 py-2 text-sm"
                  >
                    <option value="SMS">SMS</option>
                    <option value="WHATSAPP">WhatsApp</option>
                  </select>
                  <button
                    type="submit" disabled={sending}
                    className="mt-1 rounded-full bg-ink-900 px-5 py-2.5 text-sm font-medium text-sun-50 transition hover:bg-sun-600 disabled:opacity-60"
                  >
                    {sending ? "Sending…" : "Send test alert"}
                  </button>
                </form>
              </div>
            </div>

            <div className="mt-8">
              <h2 className="mb-3 font-display text-xl font-semibold text-ink-900">Risk map</h2>
              <RiskMap locations={mapLocations} />
            </div>

            <div className="mt-8">
              <h2 className="mb-3 font-display text-xl font-semibold text-ink-900">Notification history</h2>
              <div className="flex flex-col gap-2">
                {notifications.length === 0 && <p className="text-sm text-ink-400">No notifications sent yet.</p>}
                {notifications.map((n) => <NotificationStatus key={n._id} notification={n} />)}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
