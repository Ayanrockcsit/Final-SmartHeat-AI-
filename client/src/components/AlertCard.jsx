import React from "react";
import { AlertTriangle } from "lucide-react";
import { riskMeta } from "../utils/risk.js";

export default function AlertCard({ alert }) {
  const meta = riskMeta(alert.severity);
  return (
    <div
      className="flex items-start gap-3 rounded-2xl border p-5"
      style={{ borderColor: meta.color + "33", background: meta.bg }}
    >
      <AlertTriangle size={20} style={{ color: meta.color }} className="mt-0.5 shrink-0" />
      <div>
        <p className="font-medium text-ink-900">{alert.title}</p>
        <p className="mt-1 text-sm text-ink-600">{alert.message}</p>
        <p className="mt-2 text-xs text-ink-400">
          {alert.location} · {new Date(alert.startTime || alert.createdAt).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
