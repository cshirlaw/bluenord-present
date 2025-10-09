// src/components/charts/ProductionByHubQ1Q2.tsx
"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

type HubPoint = { name: string; value: number };
type Period = { label: string; hubs: HubPoint[] };

export default function ProductionByHubQ1Q2({
  args,
}: {
  args?: {
    periods?: [Period, Period];
    unit?: string;
    colorA?: string; // e.g. "#0ea5e9"
    colorB?: string; // e.g. "#10b981"
  };
}) {
  const unit = args?.unit ?? "kboepd";

  // Fallback keeps old Q1/Q2 demo working
  const fallback: [Period, Period] = [
    {
      label: "Q1 2025",
      hubs: [
        { name: "Dan", value: 7.2 },
        { name: "Gorm", value: 4.1 },
        { name: "Halfdan", value: 9.9 },
        { name: "Tyra", value: 12.0 },
      ],
    },
    {
      label: "Q2 2025",
      hubs: [
        { name: "Dan", value: 7.6 },
        { name: "Gorm", value: 4.0 },
        { name: "Halfdan", value: 9.4 },
        { name: "Tyra", value: 16.8 },
      ],
    },
  ];

  const [p1, p2] = (args?.periods?.length === 2 ? args.periods : fallback) as [Period, Period];

  // Build row per hub
  const hubNames = Array.from(new Set([...p1.hubs.map(h => h.name), ...p2.hubs.map(h => h.name)]));
  const rows = hubNames.map((name) => ({
    hub: name,
    a: p1.hubs.find(h => h.name === name)?.value ?? 0,
    b: p2.hubs.find(h => h.name === name)?.value ?? 0,
  }));

  // Nice Y max
  const yMax = Math.ceil(Math.max(1, ...rows.map(r => Math.max(r.a, r.b))) / 2) * 2;

  // Distinct, accessible defaults (override via args.colorA/B if you want)
  const colorA = args?.colorA ?? "#0ea5e9"; // sky-500
  const colorB = args?.colorB ?? "#10b981"; // emerald-500

  return (
    <div className="w-full h-[360px] md:h-[420px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={rows}
          margin={{ top: 8, right: 16, bottom: 8, left: 16 }}
          barCategoryGap={16}
          barGap={6}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="hub" tickLine={false} axisLine={false} />
          <YAxis
            domain={[0, yMax]}
            tickLine={false}
            axisLine={false}
            width={56}
            label={{ value: unit, angle: -90, position: "insideLeft", style: { fill: "#64748B" } }}
          />
          <Tooltip
            formatter={(v: number, key: string) => [`${v} ${unit}`, key]}
            wrapperStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}
          />
          <Legend iconType="circle" />

          {/* Grouped bars (no stackId) */}
          <Bar dataKey="a" name={p1.label} fill={colorA} radius={[6, 6, 0, 0]} />
          <Bar dataKey="b" name={p2.label} fill={colorB} radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}