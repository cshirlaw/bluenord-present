"use client";
import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine,
} from "recharts";

type QRow = { bucket: string; volume: number; price: number };   // e.g. "Q3-25"
type YearVol = { year: string; volume: number };                 // e.g. "2026"
type YearPx  = { year: string; price: number };                  // e.g. "2026"

type HedgeData = {
  asOf: string;
  summary: {
    oilPct: { y2025: number; y2026: number; y2027: number };
    gasPct: { y2025: number; y2026: number; y2027: number };
    footnotes?: string[];
  };
  oil: {
    unitVolume: "mmbbl";
    unitPrice: "$/bbl";
    spot?: number; // e.g. current Brent reference
    quarterly: QRow[];
    yearlyVolumes: YearVol[]; // aggregates used for the small bars
    yearlyAvgPrices: YearPx[];
  };
  gas: {
    unitVolume: "GWh";
    unitPrice: "€/MWh";
    spot?: number; // e.g. TTF ref
    quarterly: QRow[];
    yearlyVolumes: YearVol[];
    yearlyAvgPrices: YearPx[];
  };
};

function Table({
  title, unitVol, unitPx, rows,
}: { title: string; unitVol: string; unitPx: string; rows: QRow[] }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white">
      <div className="px-4 py-3 text-sm font-medium">{title}</div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-neutral-600">
            <tr>
              <th className="px-4 py-2 text-left">Quarter</th>
              <th className="px-4 py-2 text-right">Volume ({unitVol})</th>
              <th className="px-4 py-2 text-right">Hedge Price ({unitPx})</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.bucket} className="border-t border-neutral-100">
                <td className="px-4 py-2">{r.bucket}</td>
                <td className="px-4 py-2 text-right">{r.volume.toLocaleString()}</td>
                <td className="px-4 py-2 text-right">{r.price.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function YearBar({
  title, data, dataKey, yLabel, spot,
}: {
  title: string; data: any[]; dataKey: string; yLabel: string; spot?: number;
}) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      <div className="mb-2 text-sm text-neutral-600">{title}</div>
      <div className="h-[230px] w-full">
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey={dataKey} name={yLabel} />
            {typeof spot === "number" && (
              <ReferenceLine
                y={spot}
                strokeDasharray="6 4"
                stroke="#f59e0b"
                label={{ value: `Spot ${spot}`, position: "top", fill: "#b45309", fontSize: 12 }}
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function HedgePortfolio() {
  const [data, setData] = useState<HedgeData | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setErr(null);
        const res = await fetch("/data/hedge-portfolio.json", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as HedgeData;
        if (!alive) return;
        setData(json);
      } catch (e: any) {
        if (alive) setErr(e?.message || String(e));
      }
    })();
    return () => { alive = false; };
  }, []);

  if (err) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        Failed to load hedging data: {err}
      </div>
    );
  }
  if (!data) {
    return <div className="rounded-xl border border-neutral-200 p-6 text-sm text-neutral-500">Loading hedge portfolio…</div>;
  }

  const { summary, oil, gas } = data;

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-soft">
      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-neutral-200 p-4">
          <div className="text-sm font-semibold text-brand">Oil hedging coverage</div>
          <div className="mt-2 grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-2xl font-semibold">{summary.oilPct.y2025}%</div>
              <div className="text-xs text-neutral-600">2025</div>
            </div>
            <div>
              <div className="text-2xl font-semibold">{summary.oilPct.y2026}%</div>
              <div className="text-xs text-neutral-600">2026</div>
            </div>
            <div>
              <div className="text-2xl font-semibold">{summary.oilPct.y2027}%</div>
              <div className="text-xs text-neutral-600">2027</div>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-neutral-200 p-4">
          <div className="text-sm font-semibold text-brand">Gas hedging coverage</div>
          <div className="mt-2 grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-2xl font-semibold">{summary.gasPct.y2025}%</div>
              <div className="text-xs text-neutral-600">2025</div>
            </div>
            <div>
              <div className="text-2xl font-semibold">{summary.gasPct.y2026}%</div>
              <div className="text-xs text-neutral-600">2026</div>
            </div>
            <div>
              <div className="text-2xl font-semibold">{summary.gasPct.y2027}%</div>
              <div className="text-xs text-neutral-600">2027</div>
            </div>
          </div>
        </div>
      </div>

      {/* Oil section */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Table title="Oil Price Hedging — Quarterly" unitVol={oil.unitVolume} unitPx={oil.unitPrice} rows={oil.quarterly} />
        <div className="grid gap-4">
          <YearBar title="Total Hedged Oil Volumes" data={oil.yearlyVolumes} dataKey="volume" yLabel={`Volumes (${oil.unitVolume})`} />
          <YearBar title="Average Hedged Oil Price" data={oil.yearlyAvgPrices} dataKey="price" yLabel={`Price (${oil.unitPrice})`} spot={oil.spot} />
        </div>
      </div>

      {/* Gas section */}
      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <Table title="Gas Price Hedging — Quarterly" unitVol={gas.unitVolume} unitPx={gas.unitPrice} rows={gas.quarterly} />
        <div className="grid gap-4">
          <YearBar title="Total Hedged Gas Volumes" data={gas.yearlyVolumes} dataKey="volume" yLabel={`Volumes (${gas.unitVolume})`} />
          <YearBar title="Average Hedged Gas Price" data={gas.yearlyAvgPrices} dataKey="price" yLabel={`Price (${gas.unitPrice})`} spot={gas.spot} />
        </div>
      </div>

      {/* Footnotes */}
      {data.summary.footnotes?.length ? (
        <div className="mt-4 text-xs text-neutral-500 space-y-1">
          {data.summary.footnotes.map((n, i) => <div key={i}>{i + 1}) {n}</div>)}
        </div>
      ) : null}
    </div>
  );
}