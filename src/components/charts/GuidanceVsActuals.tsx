"use client";

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, Legend
} from "recharts";
import { brand } from "./palette";

// Actuals (avg mboepd): Q1 29.8, Q2 37.8
// Guidance (mboepd): Q3 43–49, Q4 47–53
// Use a "range" = high - low stacked on "low" to render the band.
const rows = [
  { q: "Q1", actual: 29.8, low: null as any, range: null as any },
  { q: "Q2", actual: 37.8, low: null as any, range: null as any },
  { q: "Q3", actual: null as any, low: 43, range: 49 - 43 },
  { q: "Q4", actual: null as any, low: 47, range: 53 - 47 },
];

export default function GuidanceVsActuals() {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-soft">
      <div className="mb-2 text-sm text-neutral-600">2025 Production — guidance band vs actuals (mboepd)</div>

      <div className="h-72 w-full">
        <ResponsiveContainer>
          <LineChart data={rows} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
            <CartesianGrid stroke={brand.grid} strokeDasharray="3 3" />

            <XAxis dataKey="q" />
            <YAxis label={{ value: "mboepd", angle: -90, position: "insideLeft" }} />

            <Tooltip
              wrapperStyle={{ borderRadius: 12, border: `1px solid ${brand.grid}` }}
              formatter={(v: number, n) => [`${v.toFixed(1)} mboepd`, n]}
            />
            <Legend />

            {/* Guidance band */}
            <Area
              type="monotone"
              dataKey="low"
              stackId="g"
              stroke="none"
              fill="transparent"
              activeDot={false}
              isAnimationActive={false}
              name="Guidance (low)"
            />
            <Area
              type="monotone"
              dataKey="range"
              stackId="g"
              stroke="none"
              fill={brand.oil}
              fillOpacity={0.15}
              activeDot={false}
              isAnimationActive={false}
              name="Guidance range"
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