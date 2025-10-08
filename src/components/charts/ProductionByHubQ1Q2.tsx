"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { hubs as hubColors, order as hubOrder, brand } from "./palette";

// Safe color getter — always returns a string
function colorFor(hub: string): string {
  return (hubColors as Record<string, string>)[hub] ?? brand.base;
}

const data = [
  // Q1 and Q2 values in mboepd (adjust if your source updates)
  { period: "Q1 2025", Tyra: 12.9, Halfdan: 11.0, Dan: 6.4, Gorm: 7.5 },
  { period: "Q2 2025", Tyra: 16.8, Halfdan: 10.6, Dan: 6.1, Gorm: 4.3 },
].map((d) => ({
  ...d,
  total: (hubOrder as readonly string[]).reduce((sum, h) => sum + (d as any)[h], 0),
}));

const tooltipStyle: React.CSSProperties = {
  borderRadius: 12,
  border: "1px solid #e5e7eb",
  boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
};

export default function ProductionByHubQ1Q2() {
  return (
    <div className="w-full h-[320px] md:h-[380px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barCategoryGap={28}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="period"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#334155", fontSize: 12 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#334155", fontSize: 12 }}
            width={38}
            label={{ value: "mboepd", angle: -90, position: "insideLeft", fill: "#64748B" }}
          />
          <Tooltip
            cursor={{ fill: "rgba(0,0,0,0.04)" }}
            wrapperStyle={tooltipStyle}
            contentStyle={{ border: "none", borderRadius: 12 }}
            labelStyle={{ color: "#0f172a", fontWeight: 600 }}
          />
          <Legend iconType="circle" wrapperStyle={{ paddingTop: 8 }} />

          {/* Stacked bars in a fixed order; each fill is guaranteed a string */}
          {hubOrder.map((hub) => (
            <Bar
              key={hub}
              dataKey={hub}
              name={hub}
              stackId="mboepd"
              fill={colorFor(hub)}
              radius={[8, 8, 0, 0]}
            />
          ))}

          {/* Total labels on top of each stacked bar */}
          <Bar dataKey="total" fill="transparent" legendType="none">
            <LabelList
              dataKey="total"
              position="top"
              formatter={(v: number) => `${v.toFixed(1)}`}
              className="text-sm"
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}