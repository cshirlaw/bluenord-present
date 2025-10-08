"use client";
import { useMemo } from "react";

export default function ProdGoal() {
  // simple numbers; replace when you have latest guidance
  const from = 25, to = 50;

  const pct = useMemo(() => Math.min(100, Math.max(0, (to / Math.max(1, to)) * 100)), [to]);

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      <div className="mb-2 text-sm text-neutral-600">Near-term production growth</div>
      <div className="flex items-baseline justify-between text-sm text-neutral-600">
        <span>{from} mboe/d</span>
        <span>~{to} mboe/d (post-Tyra)</span>
      </div>
      <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-neutral-100">
        <div className="h-full bg-brand" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-2 text-xs text-neutral-500">mboe/d = thousand barrels of oil equivalent per day.</p>
    </div>
  );
}