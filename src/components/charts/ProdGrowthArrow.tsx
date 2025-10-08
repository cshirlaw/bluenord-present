"use client";
import { useEffect, useState } from "react";

type Point = { label: string; value: number };

export default function ProdGrowthArrow() {
  const [data, setData] = useState<Point[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setErr(null);
        const res = await fetch("/data/prod-growth.json", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as Point[];
        if (!Array.isArray(json) || json.length < 2) {
          throw new Error("Expected an array with at least two points");
        }
        if (alive) setData(json);
      } catch (e: any) {
        if (alive) setErr(e?.message || String(e));
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  if (err) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        Failed to load production growth: {err}
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

  // Use only first and last points for the arrow (no hooks below this point)
  const from = data[0];
  const to = data[data.length - 1];

  const w = 760, h = 140, padX = 24, yMid = 70;
  const x1 = padX, x2 = w - padX;

  const fmt = (n: number) => `${n} mboe/d`;
  const pctChange =
    from && from.value
      ? `${((to.value - from.value) / from.value >= 0 ? "+" : "")}${(
          ((to.value - from.value) / from.value) * 100
        ).toFixed(0)}%`
      : null;

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      <div className="mb-2 text-sm text-neutral-600">Near-term production growth</div>

      <div className="w-full overflow-hidden">
        <svg viewBox={`0 0 ${w} ${h}`} className="block w-full">
          {/* baseline */}
          <line x1={x1} y1={yMid} x2={x2} y2={yMid} stroke="#e5e7eb" strokeWidth="2" />

          {/* From marker + labels */}
          <circle cx={x1} cy={yMid} r="6" fill="#9ca3af" />
          <text x={x1} y={yMid - 18} fontSize="12" fill="#4b5563" textAnchor="start">
            {from.label}
          </text>
          <text x={x1} y={yMid + 24} fontSize="12" fill="#111827" textAnchor="start">
            {fmt(from.value)}
          </text>

          {/* Arrow shaft */}
          <line x1={x1 + 10} y1={yMid} x2={x2 - 20} y2={yMid} stroke="#16a34a" strokeWidth="8" />
          {/* Arrow head */}
          <polygon
            points={`${x2 - 20},${yMid - 10} ${x2 - 20},${yMid + 10} ${x2},${yMid}`}
            fill="#16a34a"
          />

          {/* To labels */}
          <text x={x2} y={yMid - 18} fontSize="12" fill="#4b5563" textAnchor="end">
            {to.label}
          </text>
          <text x={x2} y={yMid + 24} fontSize="12" fill="#111827" textAnchor="end">
            ~{fmt(to.value)}
          </text>

          {/* Percent badge */}
          {pctChange && (
            <>
              <rect
                x={w / 2 - 32}
                y={yMid - 44}
                rx="10"
                ry="10"
                width="64"
                height="22"
                fill="#ecfdf5"
                stroke="#16a34a"
              />
              <text
                x={w / 2}
                y={yMid - 29}
                fontSize="12"
                fill="#065f46"
                textAnchor="middle"
                fontWeight="600"
              >
                {pctChange}
              </text>
            </>
          )}
        </svg>
      </div>

      <div className="mt-2 text-xs text-neutral-500">
        mboe/d = thousand barrels of oil equivalent per day. Arrow illustrates headline ramp (post-Tyra).
      </div>
    </div>
  );
}