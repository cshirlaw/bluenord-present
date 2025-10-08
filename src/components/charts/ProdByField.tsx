"use client";
import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";

type Row = Record<string, string | number>; // e.g. { month: "Jan", Halfdan: 9.2, ... }

export default function ProdByField() {
  const [data, setData] = useState<Row[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setErr(null);
        const res = await fetch("/data/prod-by-field.json", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as Row[];
        if (!Array.isArray(json)) throw new Error("Expected an array");
        if (isMounted) setData(json);
      } catch (e: any) {
        if (isMounted) setErr(e?.message || String(e));
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  if (err) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        Failed to load chart data: {err}
        <div className="mt-1 text-red-600/80">
          Tip: open <code>/data/prod-by-field.json</code> in your browser and verify it’s valid JSON.
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-xl border border-neutral-200 p-6 text-sm text-neutral-500">
        Loading chart…
      </div>
    );
  }

  // Infer series keys (all keys except the first categorical key, e.g. "month")
  const keys = Object.keys(data[0] ?? {});
  const categoryKey = "month"; // change if your category is named differently
  const series = keys.filter((k) => k !== categoryKey);

  return (
    <div className="rounded-xl border border-neutral-200 p-4 bg-white">
      <div className="mb-3 text-sm text-neutral-600">Net production by field (kboe/d)</div>
      <div className="h-[320px] w-full">
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={categoryKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            {series.map((k) => (
              <Bar key={k} dataKey={k} stackId="a" />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}