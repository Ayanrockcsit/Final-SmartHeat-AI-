/**
 * Heat Index (NWS Rothfusz regression)
 * Reference: US National Weather Service, based on Rothfusz (1990),
 * itself a refinement of Steadman (1979) apparent-temperature work.
 * https://www.wpc.ncep.noaa.gov/html/heatindex_equation.shtml
 *
 * Valid for tempF >= 80F and RH >= 40%. Below that range the simple
 * Steadman approximation is used, which is what the NWS itself falls
 * back to for milder conditions.
 */

function toFahrenheit(celsius) {
  return (celsius * 9) / 5 + 32;
}
function toCelsius(fahrenheit) {
  return ((fahrenheit - 32) * 5) / 9;
}

export function calculateHeatIndex(tempC, rh) {
  if (typeof tempC !== "number" || typeof rh !== "number") return null;

  const T = toFahrenheit(tempC);
  const R = rh;

  // Simple Steadman approximation (used for mild conditions)
  let hiF =
    0.5 * (T + 61.0 + (T - 68.0) * 1.2 + R * 0.094);

  // Average with actual temp per NWS convention, then check if the
  // full Rothfusz regression should be applied instead.
  hiF = (hiF + T) / 2;

  if (hiF >= 80) {
    hiF =
      -42.379 +
      2.04901523 * T +
      10.14333127 * R -
      0.22475541 * T * R -
      0.00683783 * T * T -
      0.05481717 * R * R +
      0.00122874 * T * T * R +
      0.00085282 * T * R * R -
      0.00000199 * T * T * R * R;

    // Adjustment terms
    if (R < 13 && T >= 80 && T <= 112) {
      hiF -= ((13 - R) / 4) * Math.sqrt((17 - Math.abs(T - 95.0)) / 17);
    } else if (R > 85 && T >= 80 && T <= 87) {
      hiF += ((R - 85) / 10) * ((87 - T) / 5);
    }
  }

  const hiC = toCelsius(hiF);
  return Math.round(hiC * 10) / 10;
}
