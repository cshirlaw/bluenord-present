"use client";
import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from "recharts";

type Row = { hub: string; month: number; quarter: number };
type Shape = {
  month: string; quarter: string; unit: string;
  hubs: Row[]; totals?: { month: number; quarter: number };
};

export default function ProductionBars() {
  const [data, setData] = useState<Shape | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setErr(null);
        const res = await fetch("/data/production-sep2025.json", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as Shape;
        if (alive) setData(json);
      } catch (e: any) {
        if (alive) setErr(e?.message || String(e));
      }
    })();
    return () => { alive = false; };
  }, []);

  const rows = useMemo(() => data?.hubs ?? [], [data]);

  const toCSV = () => {
    if (!data) return;
    const header = ["Hub", `${data.month} (${data.unit})`, `${data.quarter} avg (${data.unit})`];
    const body = rows.map(r => [r.hub, r.month, r.quarter]);
    const total = data.totals ? ["Total", data.totals.month, data.totals.quarter] : null;

    const lines = [header, ...body, ...(total ? [total] : [])]
      .map(arr => arr.join(","))
      .join("\n");
    const uri = "data:text/csv;charset=utf-8," + encodeURIComponent(lines);
    const a = document.createElement("a");
    a.href = uri;
    a.download = "production-" + data.month.replace(/\s+/g, "").toLowerCase() + ".csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  if (err) {
    return <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">Failed to load production data: {err}</div>;
  }
  if (!data) {
    return <div className="rounded-xl border border-neutral-200 p-6 text-sm text-neutral-500">Loading production…</div>;
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-soft">
      <div className="mb-2 flex items-end justify-between gap-4">
        <div className="text-sm text-neutral-700">
          Production by hub — <span className="font-medium">{data.month}</span> vs <span className="font-medium">{data.quarter} avg</span> ({data.unit})
        </div>
        <button
          onClick={toCSV}
          className="text-sm px-3 py-1.5 rounded-lg border border-brand text-brand hover:bg-brand hover:text-white transition-colors"
        >
          ⬇ Download CSV
        </button>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer>
          <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 12, left: 8, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis type="category" dataKey="hub" />
            <Tooltip />
            <Legend />
            <Bar dataKey="month" name={data.month} />
            <Bar dataKey="quarter" name={`${data.quarter} avg`} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {data.totals && (
        <div className="mt-3 text-xs text-neutral-600">
          Totals — {data.month}: <span className="font-medium">{data.totals.month} {data.unit}</span>;
          {" "} {data.quarter} overall: <span className="font-medium">{data.totals.quarter} {data.unit}</span>.
        </div>
      )}
    </div>
  );
}