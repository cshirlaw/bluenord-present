"use client";
import { useEffect, useState } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

type Slice = { name: string; value: number; color?: string };

export default function DucOwnership() {
  const [data, setData] = useState<Slice[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setErr(null);
        const res = await fetch("/data/duc-ownership.json", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as Slice[];
        setData(json);
      } catch (e: any) {
        setErr(e?.message || String(e));
      }
    })();
  }, []);

  if (err) {
    return <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">Failed to load ownership: {err}</div>;
  }
  if (!data) return <div className="rounded-xl border border-neutral-200 p-6 text-sm text-neutral-500">Loading ownership…</div>;

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      <div className="mb-2 text-sm text-neutral-600">DUC ownership</div>
      <div className="h-[260px]">
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="85%">
              {data.map((d, i) => <Cell key={i} fill={d.color || undefined} />)}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-1 text-xs text-neutral-500">DUC = Danish Underground Consortium</p>
    </div>
  );
}