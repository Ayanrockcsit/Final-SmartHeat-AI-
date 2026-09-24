import React from "react";
import { Sparkles } from "lucide-react";

export default function RecommendationCard({ advisory }) {
  if (!advisory) return null;
  return (
    <div className="rounded-3xl border border-sky-200 bg-sky-50 p-7">
      <div className="flex items-center gap-2">
        <Sparkles size={18} className="text-sky-500" />
        <h2 className="font-display text-xl font-semibold text-ink-900">AI heat advisory</h2>
      </div>
      <p className="mt-3 text-sm font-medium text-ink-800">{advisory.summary}</p>
      <p className="mt-2 text-sm text-ink-600">{advisory.explanation}</p>
      <p className="mt-3 text-sm text-ink-700">{advisory.recommendation}</p>
      <p className="mt-4 text-xs text-ink-400">{advisory.disclaimer}</p>
    </div>
  );
}
