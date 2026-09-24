import React from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { riskMeta } from "../utils/risk.js";

export default function RiskMap({ locations = [] }) {
  const center = locations.length ? [locations[0].lat, locations[0].lon] : [22.5, 79];

  return (
    <div className="overflow-hidden rounded-3xl border border-ink-100 shadow-soft">
      <MapContainer center={center} zoom={5} style={{ height: 460, width: "100%" }} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {locations.map((loc) => {
          const meta = riskMeta(loc.riskLevel);
          return (
            <CircleMarker
              key={loc.location}
              center={[loc.lat, loc.lon]}
              radius={12 + (loc.thermalStressScore || 0) / 8}
              pathOptions={{ color: meta.color, fillColor: meta.color, fillOpacity: 0.55, weight: 2 }}
            >
              <Popup>
                <div className="text-sm">
                  <p className="font-semibold">{loc.location}</p>
                  <p>Temperature: {loc.temperature}°C</p>
                  <p>Humidity: {loc.humidity}%</p>
                  <p>Heat index: {loc.heatIndex}°C</p>
                  <p>WBGT: {loc.wbgt}</p>
                  <p>Thermal stress: {loc.thermalStressScore}/100</p>
                  <p>Risk: {meta.label}</p>
                  <p>Heatwave: {loc.heatwaveDetected ? "Detected" : "Not detected"}</p>
                  {loc.source === "DEMO" && <p className="mt-1 font-medium text-ink-400">Simulated / demo data</p>}
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
