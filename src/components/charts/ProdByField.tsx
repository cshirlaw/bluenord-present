"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList,
  Legend,
  Cell,
} from "recharts";
import { hubs } from "./palette";

type Row = {
  field: "Tyra" | "Halfdan" | "Dan" | "Gorm" | (string & {});
  mboepd: number; // average daily net production for the period
};

type Props = {
  // Optional: pass your own data via ChartRouter args if needed
  data?: Row[];
  // Optional axis max override
  ymax?: number;
  // Optional subtitle under the chart
  caption?: string;
};

// Default to Q2'25 snapshot (net to BN)
const demoData: Row[] = [
  { field: "Tyra",    mboepd: 16.8 },
  { field: "Halfdan", mboepd: 10.6 },
  { field: "Dan",     mboepd: 6.1  },
  { field: "Gorm",    mboepd: 4.3  },
];

const tooltipStyle: React.CSSProperties = {
  borderRadius: 12,
  border: "1px solid #e5e7eb",
  boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
};

export default function ProdByField({ data, ymax, caption }: Props) {
  const rows = (data?.length ? data : demoData).map((r) => ({
    field: r.field,
    mboepd: Number.isFinite(r.mboepd) ? r.mboepd : 0,
  }));

  const computedMax = Math.max(10, ...rows.map((r) => r.mboepd));
  const yMax = ymax ?? Math.ceil((computedMax + 3) / 5) * 5; // round to nice step

  return (
    <div className="w-full">
      <div className="h-[300px] md:h-[360px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={rows}
            margin={{ top: 8, right: 16, bottom: 8, left: 8 }}
            barCategoryGap={18}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="field"
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
            <Tooltip
              wrapperStyle={tooltipStyle}
              contentStyle={{ border: "none", borderRadius: 12 }}
              labelStyle={{ color: "#0f172a", fontWeight: 600 }}
              formatter={(val: any, name: string) => [
                `${Number(val).toFixed(1)} mboepd`,
                "Production",
              ]}
            />
            <Legend
              verticalAlign="top"
              height={24}
              iconType="circle"
              formatter={() => "Production by field"}
            />

            <Bar dataKey="mboepd" name="Production" radius={[10, 10, 0, 0]}>
              {rows.map((r, i) => (
                <Cell key={i} fill={hubs[r.field as keyof typeof hubs] ?? "#64748B"} />
              ))}
              <LabelList
                dataKey="mboepd"
                position="top"
                formatter={(v: number) => v.toFixed(1)}
                className="text-sm"
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {caption ? (
        <div className="mt-2 text-xs text-neutral-500">{caption}</div>
      ) : (
        <div className="mt-2 text-xs text-neutral-500">
          Average daily production (net to BlueNord). Each hub uses a distinct brand colour.
        </div>
      )}
    </div>
  );
}