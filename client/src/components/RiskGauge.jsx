import React from "react";
import { motion } from "framer-motion";
import { riskMeta } from "../utils/risk.js";

/**
 * The dashboard's signature moment: an arc gauge that sweeps in once on
 * load to the current thermal-stress score. This is the one orchestrated
 * animation on the page — everything else stays quiet.
 */
export default function RiskGauge({ score = 0, riskLevel = "MODERATE", size = 220 }) {
  const meta = riskMeta(riskLevel);
  const radius = size / 2 - 18;
  const circumference = Math.PI * radius; // half circle
  const clamped = Math.max(0, Math.min(100, score));

  return (
    <div className="relative flex flex-col items-center" style={{ width: size }}>
      <svg width={size} height={size / 2 + 24} viewBox={`0 0 ${size} ${size / 2 + 24}`}>
        <path
          d={`M 18 ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 18} ${size / 2}`}
          fill="none"
          stroke="#EEF0F2"
          strokeWidth="14"
          strokeLinecap="round"
        />
        <motion.path
          d={`M 18 ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 18} ${size / 2}`}
          fill="none"
          stroke={meta.color}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - (clamped / 100) * circumference }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute top-[52%] flex -translate-y-1/2 flex-col items-center">
        <motion.span
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="font-display text-4xl font-semibold text-ink-900"
        >
          {clamped}
        </motion.span>
        <span className="text-xs text-ink-400">out of 100</span>
      </div>
    </div>
  );
}
