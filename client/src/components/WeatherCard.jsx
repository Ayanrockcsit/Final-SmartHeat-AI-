import React from "react";
import { Wind, Droplets, Sun } from "lucide-react";

export default function WeatherCard({ data }) {
  if (!data) return null;
  return (
    <div className="rounded-3xl border border-ink-100 bg-white p-7 shadow-soft">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold text-ink-900">Current weather</h2>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${data.source === "LIVE" ? "bg-sky-100 text-sky-500" : "bg-ink-100 text-ink-600"}`}>
          {data.source === "LIVE" ? "Live data" : "Demo data"}
        </span>
      </div>

      <div className="mt-4 flex items-end gap-3">
        <span className="font-display text-5xl font-semibold text-ink-900">{data.temperature}°</span>
        <span className="mb-1 text-sm text-ink-400">Feels like {data.feelsLike}°C</span>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3 border-t border-ink-100 pt-5 text-sm">
        <div className="flex items-center gap-2 text-ink-600">
          <Droplets size={16} className="text-sky-400" /> {data.humidity}%
        </div>
        <div className="flex items-center gap-2 text-ink-600">
          <Wind size={16} className="text-sky-400" /> {data.windSpeed} km/h
        </div>
        <div className="flex items-center gap-2 text-ink-600">
          <Sun size={16} className="text-sun-500" /> UV {data.uvIndex ?? "—"}
        </div>
      </div>
    </div>
  );
}
