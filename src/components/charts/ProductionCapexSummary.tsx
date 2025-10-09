"use client";

import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList,
} from "recharts";
import { useMemo } from "react";
import { brand } from "./palette";

/**
 * Minimal, self-contained chart for Q2 2025 summary.
 * If you later want to pass real data, you can add `args` to ChartRouter and thread it in here.
 */

const data = [
  // tweak numbers as needed
  { label: "Q1 2025", boepd: 32000, capex: 22.5 },
  { label: "Q2 2025", boepd: 37800, capex: 14.4 }, // focus quarter
];

function moneyShort(n: number) {
  if (!Number.isFinite(n)) return "$0";
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${(n / 1_000).toFixed(1)}k`;
  return `$${n.toFixed(0)}`;
}

export default function ProductionCapexSummary() {
  // axis domains
  const yLeftMax = useMemo(
    () => Math.ceil(Math.max(...data.map(d => d.boepd)) / 5000) * 5000 + 5000,
    []
  );
  const yRightMax = useMemo(
    () => Math.ceil(Math.max(...data.map(d => d.capex)) / 5) * 5 + 5,
    []
  );

  return (
    <div className="w-full h-[360px] md:h-[420px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 8, right: 16, bottom: 8, left: 16 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />

          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#334155", fontSize: 12 }}
          />

          {/* Left axis: Production (boepd) */}
          <YAxis
            yAxisId="left"
            domain={[0, yLeftMax]}
            tick={{ fill: "#334155", fontSize: 12 }}
            width={62}
            label={{
              value: "Production (boepd)",
              angle: -90,
              position: "insideLeft",
              offset: 10,
              style: { fill: "#64748B" },
            }}
          />

          {/* Right axis: Capex (USD m) */}
          <YAxis
            yAxisId="right"
            orientation="right"
            domain={[0, yRightMax]}
            tick={{ fill: "#334155", fontSize: 12 }}
            width={56}
            tickFormatter={(v) => `${v.toFixed(0)}m`}
            label={{
              value: "Capex (USD m)",
              angle: 90,
              position: "insideRight",
              offset: 10,
              style: { fill: "#64748B" },
            }}
          />

          <Tooltip
            wrapperStyle={{
              borderRadius: 12,
              border: "1px solid #e5e7eb",
              boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
            }}
            formatter={(value: any, name: any, entry: any) => {
              if (entry.dataKey === "boepd") return [`${Number(value).toLocaleString()} boepd`, "Production"];
              if (entry.dataKey === "capex") return [moneyShort(Number(value) * 1_000_000), "Capex"];
              return [String(value), String(name)];
            }}
          />
          <Legend iconType="circle" />

          {/* Bars: Capex (right axis) */}
          <Bar
            name="Capex"
            yAxisId="right"
            dataKey="capex"
            fill={brand.capex}
            radius={[10, 10, 0, 0]}
            maxBarSize={48}
          >
            <LabelList
              dataKey="capex"
              position="top"
              formatter={(v: number) => `${v.toFixed(1)}m`}
              style={{ fontSize: 12, fill: "#0f172a" }}
            />
          </Bar>

          {/* Line: Production (left axis) */}
          <Line
            name="Production"
            yAxisId="left"
            type="monotone"
            dataKey="boepd"
            stroke={brand.oil}
            strokeWidth={2.5}
            dot={{ r: 4, stroke: "#fff", strokeWidth: 2, fill: brand.oil }}
            activeDot={{ r: 5 }}
          />
        </ComposedChart>
      </ResponsiveContainer>

      <div className="mt-2 text-xs text-neutral-500">
        Q2 capex reflects focus on HCA Gas Lift and Tyra reinstatement. Production shown as average boepd.
      </div>
    </div>
  );
}