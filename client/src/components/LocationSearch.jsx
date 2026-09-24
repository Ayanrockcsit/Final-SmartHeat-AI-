import React, { useEffect, useRef, useState } from "react";
import { MapPin, Search, Loader2 } from "lucide-react";
import { searchLocations } from "../services/heatApi.js";

/**
 * Live location search box. Debounces keystrokes and queries the backend's
 * /api/weather/search endpoint, which is backed by real geocoding (Open-Meteo)
 * so a person can look up any real place, not just a fixed preset list.
 */
export default function LocationSearch({ value, onSelect }) {
  const [query, setQuery] = useState(value || "");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  useEffect(() => {
    if (!query || query.length < 2) { setResults([]); return; }
    setLoading(true);
    const t = setTimeout(() => {
      searchLocations(query)
        .then((r) => setResults(r))
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 350);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function pick(place) {
    const label = place.state ? `${place.name}, ${place.state}` : place.name;
    setQuery(label);
    setOpen(false);
    onSelect({ name: place.name, label, lat: place.lat, lon: place.lon });
  }

  return (
    <div ref={boxRef} className="relative w-full max-w-xs">
      <div className="flex items-center gap-2 rounded-full border border-ink-100 bg-white px-4 py-2">
        <MapPin size={16} className="shrink-0 text-sun-500" />
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Search any city…"
          className="w-full bg-transparent text-sm font-medium text-ink-800 outline-none placeholder:text-ink-400 placeholder:font-normal"
        />
        {loading ? <Loader2 size={14} className="animate-spin text-ink-400" /> : <Search size={14} className="text-ink-300" />}
      </div>

      {open && results.length > 0 && (
        <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-soft">
          {results.map((r, i) => (
            <button
              key={`${r.name}-${r.lat}-${i}`}
              onClick={() => pick(r)}
              className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm text-ink-700 transition hover:bg-sun-50"
            >
              <span>{r.name}</span>
              <span className="text-xs text-ink-400">{[r.state, r.country].filter(Boolean).join(", ")}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
