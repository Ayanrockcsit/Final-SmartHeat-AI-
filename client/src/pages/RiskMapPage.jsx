import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar.jsx";
import RiskMap from "../components/RiskMap.jsx";
import { getHeatMap } from "../services/heatApi.js";
import { riskMeta } from "../utils/risk.js";

export default function RiskMapPage() {
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    getHeatMap().then(setLocations);
  }, []);

  return (
    <div>
      <Navbar />
      <div className="mx-auto max-w-6xl px-5 py-10">
        <h1 className="font-display text-2xl font-semibold text-ink-900">Heat risk map</h1>
        <p className="text-sm text-ink-500">Tap a location for its full thermal-stress breakdown.</p>

        <div className="mt-6 flex flex-wrap gap-3">
          {Object.entries({ LOW: "Low", MODERATE: "Moderate", HIGH: "High", VERY_HIGH: "Very high", EXTREME: "Extreme" }).map(([key]) => {
            const meta = riskMeta(key);
            return (
              <span key={key} className="risk-badge" style={{ background: meta.bg, color: meta.color }}>
                <span className="h-2 w-2 rounded-full" style={{ background: meta.color }} /> {meta.label}
              </span>
            );
          })}
        </div>

        <div className="mt-6">
          <RiskMap locations={locations} />
        </div>
      </div>
    </div>
  );
}
