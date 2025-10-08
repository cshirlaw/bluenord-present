"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList
} from "recharts";
import { brand } from "./palette";

// From your note 3 (production expenses per boe):
// Q1 2025: $33.2/boe, Q2 2025: $30.3/boe
const data = [
  { q: "Q1 2025", opex: 33.2, fill: brand.grey },
  { q: "Q2 2025", opex: 30.3, fill: brand.opex },
];

export default function OpexPerBoeQ1Q2() {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-soft">
      <div className="mb-2 text-sm text-neutral-600">Production cost per boe — Q1/Q2 2025 (USD)</div>
      <div className="h-64 w-full">
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 8, right: 16, left: 4, bottom: 8 }}>
            <CartesianGrid stroke={brand.grid} strokeDasharray="3 3" />
            <XAxis dataKey="q" />
            <YAxis label={{ value: "USD/boe", angle: -90, position: "insideLeft" }} />
            <Tooltip
              wrapperStyle={{ borderRadius: 12, border: `1px solid ${brand.grid}` }}
              formatter={(v: number) => [`$${v.toFixed(1)}/boe`, "Opex"]}
            />
            <Bar dataKey="opex" radius={[8, 8, 0, 0]} fillOpacity={1} >
              <LabelList
                position="top"
                formatter={(v: number) => `$${v.toFixed(1)}`}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}