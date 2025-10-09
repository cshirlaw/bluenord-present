// components/charts/GuidanceVsActuals.tsx
"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  Legend,
  ReferenceArea,
} from "recharts";
import { brand as _brand } from "./palette";

type SeriesPoint = {
  label: string;            // e.g. "Q1 2025"
  actual?: number | null;   // actual mboepd
  guidanceLow?: number | null;
  guidanceHigh?: number | null;
};

export default function GuidanceVsActuals({
  args,
}: {
  args?: {
    unit?: string;          // default "mboepd"
    series?: SeriesPoint[]; // optional: drive chart via slides.json
  };
}) {
  const brand = {
    oil: _brand?.oil ?? "#0ea5e9",
    grid: _brand?.grid ?? "#e5e7eb",
    accent: _brand?.gas ?? "#10b981",
  };

  // Fallback if args not provided
  const fallback: SeriesPoint[] = [
    { label: "Q1 2025", actual: 29.8 },
    { label: "Q2 2025", actual: 37.8 },
    { label: "Q3 2025", guidanceLow: 43, guidanceHigh: 49 },
    { label: "Q4 2025", guidanceLow: 47, guidanceHigh: 53 },
  ];

  const unit = args?.unit ?? "mboepd";
  const input = args?.series?.length ? args.series : fallback;

  // Prepare rows + convenience fields
  const rows = input.map((p) => {
    const low = p.guidanceLow ?? null;
    const high = p.guidanceHigh ?? null;
    const range =
      low != null && high != null && high >= low ? Number((high - low).toFixed(3)) : null;
    const mid =
      low != null && high != null ? Number(((low + high) / 2).toFixed(2)) : null;

    return {
      q: p.label,
      low,
      range,    // stacked on top of 'low' to create a band
      mid,      // dashed mid-line so the band is obvious
      actual: p.actual ?? null,
    };
  });

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-soft">
      <div className="mb-2 text-sm text-neutral-600">
        2025 Production — guidance band vs actuals ({unit})
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer>
          <LineChart data={rows} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
            <CartesianGrid stroke={brand.grid} strokeDasharray="3 3" />
            <XAxis dataKey="q" />
            <YAxis label={{ value: unit, angle: -90, position: "insideLeft" }} />

            <Tooltip
              wrapperStyle={{ borderRadius: 12, border: `1px solid ${brand.grid}` }}
              formatter={(v: number | null, n) =>
                v == null ? ["—", n] : [`${Number(v).toFixed(1)} ${unit}`, n]
              }
            />
            <Legend />

            {/* Guidance band: stack 'range' on top of 'low' (visible fill only on 'range') */}
            <Area
              type="monotone"
              dataKey="low"
              stackId="g"
              stroke="none"
              fill="transparent"
              activeDot={false}
              isAnimationActive={false}
              name="Guidance (low)"
              connectNulls
            />
            <Area
              type="monotone"
              dataKey="range"
              stackId="g"
              stroke="none"
              fill={brand.oil}
              fillOpacity={0.18}
              activeDot={false}
              isAnimationActive={false}
              name="Guidance range"
              connectNulls
            />

            {/* Optional mid-line inside the band for clarity */}
            <Line
              type="monotone"
              dataKey="mid"
              name="Guidance (mid)"
              stroke={brand.accent}
              strokeDasharray="4 4"
              dot={false}
              connectNulls
            />

            {/* Actuals */}
            <Line
              type="monotone"
              dataKey="actual"
              name="Actuals"
              stroke={brand.oil}
              strokeWidth={2.5}
              dot={{ r: 3 }}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}