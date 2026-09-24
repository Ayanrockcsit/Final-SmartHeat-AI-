import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar.jsx";
import { getHeatRisk } from "../services/heatApi.js";
import { useAuth } from "../context/AuthContext.jsx";
import { riskMeta } from "../utils/risk.js";

export default function Heatwave() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const location = user?.location || "Lucknow";

  useEffect(() => {
    getHeatRisk(location).then(setData);
  }, [location]);

  if (!data) return <div><Navbar /></div>;
  const meta = riskMeta(data.riskLevel);

  return (
    <div>
      <Navbar />
      <div className="mx-auto max-w-3xl px-5 py-10">
        <h1 className="font-display text-2xl font-semibold text-ink-900">Heatwave status — {location}</h1>

        <div className="mt-8 rounded-3xl border border-ink-100 bg-white p-8">
          <div className="flex items-center justify-between">
            <p className="font-display text-2xl font-semibold" style={{ color: meta.color }}>
              {data.heatwaveDetected ? "Heatwave conditions detected" : "No heatwave detected"}
            </p>
            <span className="risk-badge" style={{ background: meta.bg, color: meta.color }}>{data.severity?.replace("_", " ")}</span>
          </div>
          <p className="mt-2 text-sm text-ink-500">Confidence: {data.confidence}% · Source: {data.source}</p>

          <div className="mt-6 border-t border-ink-100 pt-5">
            <p className="text-sm font-medium text-ink-700">Signals considered</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink-600">
              {(data.signals || []).map((s, i) => <li key={i}>{s}</li>)}
              {(!data.signals || data.signals.length === 0) && <li>No elevated signals detected.</li>}
            </ul>
          </div>

          <p className="mt-6 text-xs text-ink-400">
            This is SmartHeat AI's own system-generated classification, not an official IMD heatwave declaration.
            Always follow official local warnings alongside this tool.
          </p>
        </div>
      </div>
    </div>
  );
}
