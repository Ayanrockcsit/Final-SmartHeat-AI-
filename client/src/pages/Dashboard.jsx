import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import WeatherCard from "../components/WeatherCard.jsx";
import ThermalRiskCard from "../components/ThermalRiskCard.jsx";
import ForecastChart from "../components/ForecastChart.jsx";
import AlertCard from "../components/AlertCard.jsx";
import RecommendationCard from "../components/RecommendationCard.jsx";
import RiskMap from "../components/RiskMap.jsx";
import LocationSearch from "../components/LocationSearch.jsx";
import { getCurrentHeat, getHeatForecast, getLocationAlerts, getHeatMap } from "../services/heatApi.js";
import { getRecommendation } from "../services/aiApi.js";
import { useAuth } from "../context/AuthContext.jsx";

const QUICK_LOCATIONS = ["Lucknow", "Delhi", "Jaipur", "Nagpur", "Ahmedabad", "Varanasi"];

export default function Dashboard() {
  const { user } = useAuth();
  const [place, setPlace] = useState({ name: user?.location || "Lucknow", label: user?.location || "Lucknow", lat: null, lon: null });
  const [current, setCurrent] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [mapData, setMapData] = useState([]);
  const [advisory, setAdvisory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    const coords = place.lat != null ? { lat: place.lat, lon: place.lon } : undefined;
    Promise.all([
      getCurrentHeat(place.name, coords),
      getHeatForecast(place.name, coords),
      getLocationAlerts(place.name).catch(() => []),
      getHeatMap().catch(() => []),
    ]).then(([cur, fc, al, map]) => {
      if (!active) return;
      setCurrent(cur);
      setForecast(fc.days || []);
      setAlerts(al || []);
      setMapData(map || []);
      setLoading(false);
      getRecommendation(cur).then(setAdvisory).catch(() => {});
    }).catch(() => setLoading(false));
    return () => { active = false; };
  }, [place]);

  return (
    <div>
      <Navbar />
      <div className="mx-auto max-w-6xl px-5 py-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink-900">Heat dashboard</h1>
            <p className="text-sm text-ink-500">Live thermal-stress conditions and forecast for your area.</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <LocationSearch
              value={place.label}
              onSelect={(p) => setPlace(p)}
            />
            <div className="flex flex-wrap justify-end gap-1.5">
              {QUICK_LOCATIONS.map((l) => (
                <button
                  key={l}
                  onClick={() => setPlace({ name: l, label: l, lat: null, lon: null })}
                  className={`rounded-full px-3 py-1 text-xs transition ${
                    place.name === l ? "bg-sun-500 text-white" : "bg-white text-ink-500 hover:text-ink-800"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="mt-20 flex justify-center text-ink-400">
            <Loader2 className="animate-spin" size={28} />
          </div>
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <WeatherCard data={current} />
            <ThermalRiskCard data={current} />

            {alerts.length > 0 && (
              <div className="lg:col-span-2">
                <h2 className="mb-3 font-display text-xl font-semibold text-ink-900">Active heat alerts</h2>
                <div className="flex flex-col gap-3">
                  {alerts.map((a) => <AlertCard key={a._id} alert={a} />)}
                </div>
              </div>
            )}

            <div className="lg:col-span-2">
              <ForecastChart days={forecast} />
            </div>

            <div className="lg:col-span-2">
              <h2 className="mb-3 font-display text-xl font-semibold text-ink-900">Heat risk map</h2>
              <RiskMap locations={mapData} />
            </div>

            <div className="lg:col-span-2">
              <RecommendationCard advisory={advisory} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
