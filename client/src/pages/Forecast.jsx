import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar.jsx";
import ForecastChart from "../components/ForecastChart.jsx";
import { getHeatForecast } from "../services/heatApi.js";
import { riskMeta } from "../utils/risk.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Forecast() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const location = user?.location || "Lucknow";

  useEffect(() => {
    getHeatForecast(location).then(setData);
  }, [location]);

  return (
    <div>
      <Navbar />
      <div className="mx-auto max-w-6xl px-5 py-10">
        <h1 className="font-display text-2xl font-semibold text-ink-900">5-day heat risk forecast</h1>
        <p className="text-sm text-ink-500">{location} · {data?.source === "LIVE" ? "Live data" : "Demo data"}</p>

        {data && (
          <>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {data.days.map((d, i) => {
                const meta = riskMeta(d.riskLevel);
                return (
                  <motion.div
                    key={d.date}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.4 }}
                    className="rounded-2xl border border-ink-100 bg-white p-5"
                  >
                    <p className="text-xs text-ink-400">{i === 0 ? "Today" : new Date(d.date).toLocaleDateString(undefined, { weekday: "short" })}</p>
                    <p className="mt-1 font-display text-2xl font-semibold text-ink-900">{d.temperature}°</p>
                    <p className="text-xs text-ink-500">Humidity {d.humidity}%</p>
                    <span className="mt-3 inline-block rounded-full px-2.5 py-1 text-xs font-medium" style={{ background: meta.bg, color: meta.color }}>
                      {meta.label}
                    </span>
                  </motion.div>
                );
              })}
            </div>

            <div className="mt-8">
              <ForecastChart days={data.days} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
