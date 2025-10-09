"use client";

import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Line,
} from "recharts";
import { brand } from "./palette";

type Oil = {
  hedged_bbl?: number;
  hedge_price_usd_bbl?: number;
  guidance_bbl?: number;
  unhedged_price_usd_bbl?: number;
};
type Gas = {
  hedged_mwh?: number;
  hedge_price_eur_mwh?: number;
  guidance_mwh?: number;
  unhedged_price_eur_mwh?: number;
  fx_eur_usd?: number;
};
type Period = {
  label: string;
  oil?: Oil;
  gas?: Gas;
};
type Args = {
  periods: Period[];
  usdPerEur?: number;
};
type Props = { args?: Args };

function moneyShort(n: number) {
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${(n / 1_000).toFixed(1)}k`;
  return `$${n.toFixed(0)}`;
}

export default function HedgeExposure({ args }: Props) {
  const periods = Array.isArray(args?.periods) ? args!.periods : [];
  const fxFallback = Number(args?.usdPerEur) || 1.08;

  const rows = periods.map((p) => {
    const o = p.oil || {};
    const g = p.gas || {};

    const hedgedOilBbl = Number(o.hedged_bbl) || 0;
    const hedgedOilPrice = Number(o.hedge_price_usd_bbl) || 0;
    const guidanceOilBbl = Number(o.guidance_bbl) || 0;
    const unhedgedOilPrice = Number(o.unhedged_price_usd_bbl) || 0;

    const hedgedGasMWh = Number(g.hedged_mwh) || 0;
    const hedgedGasPriceEur = Number(g.hedge_price_eur_mwh) || 0;
    const guidanceGasMWh = Number(g.guidance_mwh) || 0;
    const unhedgedGasPriceEur = Number(g.unhedged_price_eur_mwh) || 0;
    const fx = Number(g.fx_eur_usd) || fxFallback;

    const unhedgedOilBbl = Math.max(guidanceOilBbl - hedgedOilBbl, 0);
    const unhedgedGasMWh = Math.max(guidanceGasMWh - hedgedGasMWh, 0);

    const valueHedgedOil = hedgedOilBbl * hedgedOilPrice;
    const valueHedgedGas = hedgedGasMWh * hedgedGasPriceEur * fx;
    const valueHedged = valueHedgedOil + valueHedgedGas;

    const valueUnhedgedOil = unhedgedOilBbl * unhedgedOilPrice;
    const valueUnhedgedGas = unhedgedGasMWh * unhedgedGasPriceEur * fx;
    const valueUnhedged = valueUnhedgedOil + valueUnhedgedGas;

    const total = valueHedged + valueUnhedged;
    const pctHedged = total > 0 ? (valueHedged / total) * 100 : 0;

    return {
      label: p.label,
      valueHedged,
      valueUnhedged,
      pctHedged,
    };
  });

  const maxVal = Math.max(1, ...rows.map(r => r.valueHedged + r.valueUnhedged));
  const yMax = Math.ceil(maxVal / 10_000_000) * 10_000_000;

  return (
    <div className="w-full h-[360px] md:h-[420px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={rows} margin={{ top: 8, right: 24, bottom: 8, left: 16 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} />
          <YAxis
            yAxisId="usd"
            domain={[0, yMax]}
            tickFormatter={moneyShort}
            tick={{ fill: "#334155" }}
            label={{ value: "USD (value)", angle: -90, position: "insideLeft", fill: "#64748B" }}
          />
          <YAxis
            yAxisId="pct"
            orientation="right"
            domain={[0, 100]}
            tickFormatter={(v) => `${v}%`}
            tick={{ fill: "#334155" }}
            label={{ value: "% hedged (value)", angle: 90, position: "insideRight", fill: "#64748B" }}
          />
          <Tooltip
            formatter={(v: number, name: string) => {
              if (name === "% Hedged (value)") return [`${v.toFixed(0)}%`, name];
              return [moneyShort(v), name];
            }}
          />
          <Legend />

          <Bar name="Hedged value"    dataKey="valueHedged"   yAxisId="usd" stackId="v" fill={brand.oil} radius={[8,8,0,0]} />
          <Bar name="Unhedged value"  dataKey="valueUnhedged" yAxisId="usd" stackId="v" fill={brand.gas} />

          <Line name="% Hedged (value)" type="monotone" dataKey="pctHedged" yAxisId="pct" stroke={brand.opex} strokeWidth={2.5} dot={{ r: 4 }} />
        </ComposedChart>
      </ResponsiveContainer>

      <div className="mt-2 text-xs text-neutral-500">
        USD value by quarter using hedge prices for hedged volumes and assumed market prices for unhedged volumes (EUR/MWh converted at fx).
      </div>
    </div>
  );
}