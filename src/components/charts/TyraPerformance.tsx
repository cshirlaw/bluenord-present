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
  ReferenceArea,
  LabelList,
} from "recharts";
import { brand as pal } from "./palette";

type Point = {
  period: string; // "Apr", "May", "Jun"
  avg: number;    // average mboepd (net)
  peak: number;   // peak mboepd (net)
};

type Props = {
  series?: Point[];
  plateau?: { low: number; high: number };
  ymax?: number;
  note?: string; // ➜ optional callout under the chart
};

const demo: Point[] = [
  { period: "Apr", avg: 14.0, peak: 22.0 },
  { period: "May", avg: 18.0, peak: 26.0 },
  { period: "Jun", avg: 20.0, peak: 27.7 },
  { period: "Jul", avg: 22.0, peak: 28.0 },
  { period: "Aug", avg: 24.0, peak: 29.0 },
  { period: "Sep", avg: 25.0, peak: 30.0 },
];

// safe palette (prevents “Invalid value for prop `fill`” if palette import breaks)
const brand = {
  oil: pal?.oil ?? "#0EA5E9",
  opex: pal?.opex ?? "#8B5CF6",
};

const tooltipBox: React.CSSProperties = {
  borderRadius: 12,
  border: "1px solid #e5e7eb",
  boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
  background: "#fff",
  padding: 8,
};

function fmt(v?: number) {
  if (v == null || Number.isNaN(v)) return "–";
  return `${v.toFixed(1)} mboepd`;
}

// Custom tooltip so labels are always correct & tidy
function Tip({
  active,
  label,
  payload,
}: {
  active?: boolean;
  label?: string;
  payload?: any[];
}) {
  if (!active || !payload || payload.length === 0) return null;

  // Pull avg and peak explicitly by dataKey
  const row = payload[0]?.payload as Point | undefined;
  const avg = row?.avg;
  const peak = row?.peak;

  return (
    <div style={tooltipBox}>
      <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>{label}</div>
      <div style={{ display: "grid", gridTemplateColumns: "auto auto", gap: 6 }}>
        <span style={{ color: "#334155" }}>Avg (net)</span>
        <span style={{ textAlign: "right", color: "#0f172a" }}>{fmt(avg)}</span>
        <span style={{ color: "#334155" }}>Peak (net)</span>
        <span style={{ textAlign: "right", color: "#0f172a" }}>{fmt(peak)}</span>
      </div>
    </div>
  );
}

export default function TyraPerformance(props: Props) {
  const src = props.series?.length ? props.series : demo;

  const data = src.map((d) => ({
    ...d,
    avg: Number.isFinite(d.avg) ? d.avg : 0,
    peak: Number.isFinite(d.peak) ? d.peak : 0,
  }));

  const plateauLow = props.plateau?.low ?? 28;
  const plateauHigh = props.plateau?.high ?? 32;

  const maxDatum = Math.max(
    plateauHigh,
    ...data.map((d) => Math.max(d.avg || 0, d.peak || 0))
  );
  const yMax = (props.ymax ?? maxDatum) + 4;

  return (
    <div className="w-full">
      <div className="h-[320px] md:h-[380px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} barCategoryGap={24}>
            {/* grid */}
            <CartesianGrid strokeDasharray="3 3" vertical={false} />

            {/* axes */}
            <XAxis
              dataKey="period"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#334155", fontSize: 12 }}
            />
            <YAxis
              domain={[0, yMax]}
              tickCount={6}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#334155", fontSize: 12 }}
              width={48}
              label={{
                value: "mboepd (net)",
                angle: -90,
                position: "insideLeft",
                fill: "#64748B",
              }}
            />

            {/* plateau band */}
            <ReferenceArea
              y1={plateauLow}
              y2={plateauHigh}
              fill={brand.oil}
              fillOpacity={0.08}
              stroke="none"
            />

            {/* tooltip + legend */}
            <Tooltip content={<Tip />} />
            <Legend iconType="circle" wrapperStyle={{ paddingTop: 6 }} />

            {/* avg bars */}
            <Bar
              name="Avg (net)"
              dataKey="avg"
              fill={brand.oil}
              radius={[10, 10, 0, 0]}
            >
              <LabelList
                dataKey="avg"
                position="top"
                formatter={(v: number) => (Number.isFinite(v) ? v.toFixed(1) : "–")}
              />
            </Bar>

            {/* peak line */}
            <Line
              name="Peak (net)"
              type="monotone"
              dataKey="peak"
              stroke={brand.opex}
              strokeWidth={2.5}
              dot={{ r: 4, stroke: "#fff", strokeWidth: 2, fill: brand.opex }}
              activeDot={{ r: 5 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* caption */}
      <div className="mt-2 text-xs text-neutral-500">
        Periodic average daily production (bars) and daily peak (line), net to BlueNord. Shaded band indicates plateau target.
      </div>

      {/* optional operator note */}
      {props.note && (
        <p className="mt-3 text-sm text-neutral-600 border-t pt-3 italic">
          {props.note}
        </p>
      )}
    </div>
  );
}