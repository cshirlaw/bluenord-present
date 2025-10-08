"use client";
import { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function ReservesSplit() {
  // Placeholder split — swap when you have exact 2P / near-term 2C
  const data = useMemo(
    () => [
      { bucket: "2P reserves", value: 181 },    // example
      { bucket: "2C (near-term)", value: 40 },  // example
    ],
    []
  );

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      <div className="mb-1 text-sm text-neutral-600">As of 31 Dec 2023 (mmboe)</div>
      <div className="h-[280px] w-full">
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="bucket" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 text-xs text-neutral-500">
        “2P” = proved + probable. “2C” = contingent resources (near-term).
      </div>
    </div>
  );
}