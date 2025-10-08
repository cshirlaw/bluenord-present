"use client";
import { useEffect, useState } from "react";

type Breakdown = {
  label: string;        // e.g. "2P (proved + probable)" or "2C (near-term)"
  value: number;        // mmboe
  notes?: string[];     // e.g. ["Adda", "Halfdan North", "Svend reinstatement"]
};

type ReservesData = {
  totalMmboe: number;   // headline, e.g. 221
  asOf: string;         // e.g. "31 Dec 2023"
  breakdown: Breakdown[];
};

export default function ReservesCard() {
  const [data, setData] = useState<ReservesData | null>(null);
  const [open, setOpen] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setErr(null);
        const res = await fetch("/data/reserves.json", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as ReservesData;
        if (!alive) return;
        if (!json || typeof json.totalMmboe !== "number" || !Array.isArray(json.breakdown)) {
          throw new Error("Unexpected reserves.json shape");
        }
        setData(json);
      } catch (e: any) {
        if (alive) setErr(e?.message || String(e));
      }
    })();
    return () => { alive = false; };
  }, []);

  if (err) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        Failed to load reserves: {err}
        <div className="mt-1 text-red-600/80">
          Tip: open <code>/data/reserves.json</code> in your browser to verify JSON.
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-5 text-sm text-neutral-500">
        Loading reserves…
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-soft">
      <div className="text-sm text-neutral-600">Substantial reserves base</div>
      <div className="mt-1 text-3xl font-semibold tracking-tight">{data.totalMmboe} mmboe</div>
      <div className="mt-1 text-xs text-neutral-500">as of {data.asOf}</div>

      <button
        onClick={() => setOpen((v) => !v)}
        className="mt-3 text-sm text-brand underline underline-offset-4"
        aria-expanded={open}
      >
        {open ? "Hide breakdown" : "View breakdown"}
      </button>

      {open && (
        <div className="mt-3 rounded-xl border border-neutral-200 p-3">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-neutral-600">
                <th className="py-1 text-left font-medium">Category</th>
                <th className="py-1 text-right font-medium">mmboe</th>
                <th className="py-1 text-left font-medium">Notes</th>
              </tr>
            </thead>
            <tbody>
              {data.breakdown.map((b, i) => (
                <tr key={i} className="border-t border-neutral-100">
                  <td className="py-1">
                    {b.label}
                    {/^2P/i.test(b.label) && (
                      <span title="2P = proved + probable" className="ml-1 text-xs text-neutral-500">
                        (?)
                      </span>
                    )}
                    {/^2C/i.test(b.label) && (
                      <span title="2C = contingent resources" className="ml-1 text-xs text-neutral-500">
                        (?)
                      </span>
                    )}
                  </td>
                  <td className="py-1 text-right">{b.value.toFixed(0)}</td>
                  <td className="py-1">{b.notes?.join(", ") || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-xs text-neutral-500">
            mmboe = million barrels of oil equivalent.
          </p>
        </div>
      )}
    </div>
  );
}