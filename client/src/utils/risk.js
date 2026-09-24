export const RISK_META = {
  LOW: { label: "Low", color: "#4CA37A", bg: "#EAF5EF" },
  MODERATE: { label: "Moderate", color: "#B4890A", bg: "#FBF3DD" },
  HIGH: { label: "High", color: "#C1650F", bg: "#FCEADA" },
  VERY_HIGH: { label: "Very High", color: "#C24827", bg: "#FBE3DA" },
  EXTREME: { label: "Extreme", color: "#9E2B29", bg: "#F8DEDD" },
};

export function riskMeta(level) {
  return RISK_META[level] || RISK_META.MODERATE;
}
