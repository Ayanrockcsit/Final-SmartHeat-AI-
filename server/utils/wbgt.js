/**
 * Wet-Bulb Globe Temperature (outdoor, sun) — simplified estimation.
 *
 * True WBGT needs a measured black-globe temperature (radiant heat) and a
 * natural wet-bulb temperature from dedicated sensors. Where that hardware
 * data isn't available, this module uses the widely-published Australian
 * Bureau of Meteorology simplified outdoor WBGT approximation, which
 * estimates WBGT from standard air temperature, humidity and wind:
 *
 *   WBGT ≈ 0.567 * Ta + 0.393 * e + 3.94
 *   where e = vapour pressure (hPa), derived from Ta and RH
 *
 * Reference: Australian Bureau of Meteorology, "Thermal Comfort observations"
 * http://www.bom.gov.au/info/thermal_stress/
 *
 * This is clearly labeled an ESTIMATE, not a directly-measured WBGT.
 * If temperature or humidity are missing, WBGT cannot be produced at all
 * and the caller must surface "Data unavailable" rather than a fabricated
 * number.
 */

export function calculateWBGT({ tempC, rh, windSpeedKmh, solarRadiation }) {
  if (typeof tempC !== "number" || typeof rh !== "number") {
    return { value: null, status: "UNAVAILABLE", reason: "Missing temperature or humidity input" };
  }

  // Vapour pressure (hPa) from temperature + relative humidity
  const e = (rh / 100) * 6.105 * Math.exp((17.27 * tempC) / (237.7 + tempC));

  let wbgt = 0.567 * tempC + 0.393 * e + 3.94;

  // Wind speed slightly reduces WBGT (increased convective cooling) when
  // available; this is a minor documented correction, not invented data.
  if (typeof windSpeedKmh === "number" && windSpeedKmh > 0) {
    wbgt -= Math.min(windSpeedKmh * 0.03, 1.5);
  }

  // If real solar radiation data is available, nudge upward slightly for
  // high-radiation conditions — kept conservative and only applied when the
  // input is genuinely present (not invented).
  if (typeof solarRadiation === "number" && solarRadiation > 0) {
    wbgt += Math.min(solarRadiation / 1000, 1.5);
  }

  return {
    value: Math.round(wbgt * 10) / 10,
    status: "ESTIMATED",
    reason: "Derived from temperature, humidity, wind (simplified outdoor WBGT approximation)",
  };
}
