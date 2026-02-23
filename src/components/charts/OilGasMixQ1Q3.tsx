"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LabelList
} from "recharts";
import { brand } from "./palette";

// From your Operational Review table (mboepd):
// Q1 2025: Oil 18.0, Gas 11.4  -> 29.4
// Q2 2025: Oil 23.5, Gas 15.0  -> 38.5
const data = [
  { q: "Q1 2025", oil: 18.0, gas: 11.4, total: 29.4 },
  { q: "Q2 2025", oil: 23.5, gas: 15.0, total: 38.5 },
  { q: "Q3 2025", oil: 23.5, gas: 15.0, total: 38.5 },
];

export default function OilGasMixQ1Q3() {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-soft">
      <div className="mb-2 text-sm text-neutral-600">Oil vs Gas mix — Q1–Q3 2025 (mboepd)</div>
      <div className="h-72 w-full">
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 8, right: 16, left: 4, bottom: 8 }}>
            <CartesianGrid stroke={brand.grid} strokeDasharray="3 3" />
            <XAxis dataKey="q" />
            <YAxis label={{ value: "mboepd", angle: -90, position: "insideLeft" }} />
            <Tooltip
              wrapperStyle={{ borderRadius: 12, border: `1px solid ${brand.grid}` }}
              formatter={(v: number, n) => [`${v.toFixed(1)} mboepd`, n.toUpperCase()]}
            />
            <Legend />
            <Bar dataKey="oil" name="Oil" stackId="mix" fill={brand.oil} radius={[6, 6, 0, 0]} />
            <Bar dataKey="gas" name="Gas" stackId="mix" fill={brand.gas} radius={[6, 6, 0, 0]}>
              {/* Put total label on the top bar */}
              <LabelList dataKey="total" position="top" formatter={(v: number) => v.toFixed(1)} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}