import React from "react";
import RiskGauge from "./RiskGauge.jsx";
import { riskMeta } from "../utils/risk.js";

export default function ThermalRiskCard({ data }) {
  if (!data) return null;
  const meta = riskMeta(data.riskLevel);

  return (
    <div className="rounded-3xl border border-ink-100 bg-white p-7 shadow-soft">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold text-ink-900">Human thermal risk</h2>
        <span className="risk-badge" style={{ background: meta.bg, color: meta.color }}>
          <span className="h-2 w-2 rounded-full" style={{ background: meta.color }} />
          {meta.label}
        </span>
      </div>

      <div className="mt-5 flex flex-col items-center gap-2">
        <RiskGauge score={data.thermalStressScore} riskLevel={data.riskLevel} />
        <p className="text-sm text-ink-600">Thermal stress score</p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 border-t border-ink-100 pt-5">
        <div>
          <p className="text-xs text-ink-400">Heat index</p>
          <p className="font-display text-lg font-medium text-ink-900">{data.heatIndex}°C</p>
        </div>
        <div>
          <p className="text-xs text-ink-400">WBGT</p>
          <p className="font-display text-lg font-medium text-ink-900">
            {data.wbgt === "Data unavailable" ? (
              <span className="text-sm font-normal text-ink-400">Data unavailable</span>
            ) : (
              `${data.wbgt}°C`
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
