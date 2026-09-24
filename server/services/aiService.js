import axios from "axios";

/**
 * AI Advisory generator.
 * - If ANTHROPIC_API_KEY is set, calls the Anthropic API for a natural-
 *   language explanation grounded strictly in the structured risk data
 *   passed to it (the prompt forbids inventing weather/medical facts).
 * - Otherwise, falls back to a deterministic rule-based generator so the
 *   feature works with zero configuration (important for DEMO_MODE).
 * Either path NEVER fabricates data or makes mortality predictions.
 */

const RISK_GUIDANCE = {
  LOW: "Conditions are within a generally manageable range for most people.",
  MODERATE: "Sensitive groups (elderly, children, those with health conditions) should take light precautions.",
  HIGH: "Limit strenuous outdoor activity, especially during midday hours, and increase fluid intake.",
  VERY_HIGH: "Avoid outdoor exertion during peak sun hours. Vulnerable groups should stay indoors where possible.",
  EXTREME: "Outdoor activity should be avoided where possible. This is a dangerous heat-stress level for most people.",
};

function ruleBasedAdvisory({ location, temperature, humidity, windSpeed, heatIndex, wbgt, thermalStressScore, riskLevel }) {
  const wbgtLine = wbgt === "Data unavailable" || wbgt == null
    ? "WBGT could not be calculated because full radiation data isn't available for this location right now."
    : `The estimated Wet-Bulb Globe Temperature (WBGT) is ${wbgt}°C, a combined measure of heat, humidity and radiant load.`;

  return {
    summary: `${location} is currently at ${riskLevel.replace("_", " ")} human thermal stress risk (score ${thermalStressScore}/100).`,
    explanation: `At ${temperature}°C with ${humidity}% humidity and ${windSpeed} km/h wind, the Heat Index (how the air actually feels on the body) is ${heatIndex}°C. ${wbgtLine} Combined, these push the Thermal Stress Score to ${thermalStressScore}/100, classified as ${riskLevel.replace("_", " ")}.`,
    recommendation: RISK_GUIDANCE[riskLevel] || RISK_GUIDANCE.MODERATE,
    disclaimer: "This is a general safety guideline generated from weather data, not medical advice. Follow official local heat-safety warnings.",
  };
}

export async function generateAdvisory(input) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { ...ruleBasedAdvisory(input), generatedBy: "RULE_BASED" };
  }

  try {
    const prompt = `You are a heat-safety advisory assistant for SmartHeat AI, an early-warning platform. You are given ONLY this structured data - do not invent any weather, medical, or mortality figures beyond it:
${JSON.stringify(input, null, 2)}

Write a short JSON object with keys "summary" (1 sentence), "explanation" (2-3 sentences explaining the thermal stress in plain language), and "recommendation" (2-3 sentences of practical, general precautions). Do not diagnose medical conditions or predict deaths. Respond with ONLY the JSON object, no markdown fences.`;

    const { data } = await axios.post(
      "https://api.anthropic.com/v1/messages",
      { model: "claude-sonnet-4-6", max_tokens: 500, messages: [{ role: "user", content: prompt }] },
      { headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01", "content-type": "application/json" }, timeout: 15000 }
    );
    const text = data?.content?.map((b) => b.text || "").join("").trim();
    const cleaned = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return {
      ...parsed,
      disclaimer: "This is a general safety guideline generated from weather data, not medical advice. Follow official local heat-safety warnings.",
      generatedBy: "AI",
    };
  } catch (err) {
    // Never let an AI-provider failure break the advisory feature.
    return { ...ruleBasedAdvisory(input), generatedBy: "RULE_BASED_FALLBACK" };
  }
}
