import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar.jsx";
import AlertCard from "../components/AlertCard.jsx";
import { getAlerts } from "../services/heatApi.js";

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAlerts().then((a) => { setAlerts(a); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  return (
    <div>
      <Navbar />
      <div className="mx-auto max-w-3xl px-5 py-10">
        <h1 className="font-display text-2xl font-semibold text-ink-900">Active heat alerts</h1>
        <p className="text-sm text-ink-500">Alerts are generated automatically as locations cross risk thresholds, deduplicated per day.</p>

        <div className="mt-8 flex flex-col gap-3">
          {loading && <p className="text-ink-400">Loading alerts…</p>}
          {!loading && alerts.length === 0 && (
            <div className="rounded-2xl border border-ink-100 bg-white p-8 text-center text-ink-500">
              No active alerts right now. Conditions are within a manageable range.
            </div>
          )}
          {alerts.map((a) => <AlertCard key={a._id} alert={a} />)}
        </div>
      </div>
    </div>
  );
}
