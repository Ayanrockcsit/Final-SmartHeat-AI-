import React from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function ForecastChart({ days = [] }) {
  const data = days.map((d) => ({
    date: new Date(d.date).toLocaleDateString(undefined, { weekday: "short" }),
    Temperature: d.temperature,
    "Thermal stress": d.thermalStressScore,
  }));

  return (
    <div className="rounded-3xl border border-ink-100 bg-white p-7 shadow-soft">
      <h2 className="font-display text-xl font-semibold text-ink-900">Thermal stress trend</h2>
      <div className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="stressFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#E86F13" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#E86F13" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#EEF0F2" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#7C8894" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: "#7C8894" }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: "1px solid #EEF0F2", fontSize: 13 }}
            />
            <Area type="monotone" dataKey="Thermal stress" stroke="#E86F13" strokeWidth={2.5} fill="url(#stressFill)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
