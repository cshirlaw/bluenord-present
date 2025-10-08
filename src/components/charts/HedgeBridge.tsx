"use client";

import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList,
} from "recharts";
import { brand } from "./palette";

type PeriodFlat = {
  label: string;
  totalBoe?: number;
  oilShare?: number;              // 0..1
  hedgedOilBoe?: number;
  hedgedOilPriceUsd?: number;
  hedgedGasMWh?: number;
  hedgedGasPriceEur?: number;
};

type PeriodNested = {
  label: string;
  oil?: {
    hedged_bbl?: number;
    hedge_price_usd_bbl?: number;
    guidance_bbl?: number;
    unhedged_price_usd_bbl?: number;
  };
  gas?: {
    hedged_mwh?: number;
    hedge_price_eur_mwh?: number;
    guidance_mwh?: number;
    unhedged_price_eur_mwh?: number;
    fx_eur_usd?: number;
  };
  costs?: {
    opex_per_boe_usd?: number;
    other_costs_usd?: number;
  };
};

type Props = {
  args?: {
    oilPriceMarket?: number;   // USD/bbl fallback
    gasPriceMarket?: number;   // EUR/MWh fallback
    usdPerEur?: number;        // e.g. 1.08
    opexPerBoe?: number;       // fallback if not per period
    mwh_to_boe?: number;       // override conversion (default 0.588 boe/MWh)
    periods: Array<PeriodFlat | PeriodNested>;
  };
};

// Physics: 1 MWh ≈ 3.412 MMBtu ; 1 boe ≈ 5.8 MMBtu → 3.412/5.8 ≈ 0.588 boe/MWh
const DEFAULT_MWH_TO_BOE = 0.588;

function moneyShort(n: number) {
  if (!Number.isFinite(n)) return "$0";
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(0)}m`;
  if (abs >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return `$${n.toFixed(0)}`;
}

export default function HedgeBridge({ args }: Props) {
  const oilMkt   = Number(args?.oilPriceMarket) || 70;
  const gasMkt   = Number(args?.gasPriceMarket) || 33;
  const usdPerEur = Number(args?.usdPerEur) || 1.08;
  const defaultOpex = Number(args?.opexPerBoe) || 30;
  const MWH_TO_BOE = Number(args?.mwh_to_boe) || DEFAULT_MWH_TO_BOE;

  const periods = Array.isArray(args?.periods) ? args!.periods : [];

  const rows = periods.map((pRaw) => {
    const label = (pRaw as any).label ?? "Period";

    let hedgedOilBoe = 0, hedgedOilPrice = oilMkt;
    let hedgedGasMWh = 0, hedgedGasPriceEur = gasMkt;

    let guidanceOilBbl = 0, unhedgedOilPrice = oilMkt;
    let guidanceGasMWh = 0, unhedgedGasPriceEur = gasMkt;
    let fx = usdPerEur;

    let opexPerBoe = defaultOpex;
    let otherCosts = 0;

    let totalBoe = 0;

    const p: any = pRaw;

    if (p.oil || p.gas || p.costs) {
      // Nested shape
      const o = p.oil || {};
      const g = p.gas || {};
      const c = p.costs || {};

      hedgedOilBoe     = Number(o.hedged_bbl) || 0;
      hedgedOilPrice   = Number(o.hedge_price_usd_bbl) || oilMkt;

      guidanceOilBbl   = Number(o.guidance_bbl) || hedgedOilBoe; // fallback
      unhedgedOilPrice = Number(o.unhedged_price_usd_bbl) || oilMkt;

      hedgedGasMWh       = Number(g.hedged_mwh) || 0;
      hedgedGasPriceEur  = Number(g.hedge_price_eur_mwh) || gasMkt;

      guidanceGasMWh     = Number(g.guidance_mwh) || hedgedGasMWh;
      unhedgedGasPriceEur= Number(g.unhedged_price_eur_mwh) || gasMkt;

      fx = Number(g.fx_eur_usd) || usdPerEur;

      opexPerBoe = Number(c.opex_per_boe_usd) || defaultOpex;
      otherCosts = Number(c.other_costs_usd) || 0;

      totalBoe = guidanceOilBbl + guidanceGasMWh * MWH_TO_BOE;
    } else {
      // Flat shape
      const f = p as PeriodFlat;
      totalBoe = Number(f.totalBoe) || 0;

      const oilShare = Number(f.oilShare);
      const oilBoe = Number.isFinite(oilShare) ? totalBoe * oilShare : totalBoe * 0.5;
      const gasBoe = totalBoe - oilBoe;

      hedgedOilBoe     = Number(f.hedgedOilBoe) || 0;
      hedgedOilPrice   = Number(f.hedgedOilPriceUsd) || oilMkt;

      hedgedGasMWh     = Number(f.hedgedGasMWh) || 0;
      hedgedGasPriceEur= Number(f.hedgedGasPriceEur) || gasMkt;

      guidanceOilBbl   = oilBoe;                      // treat boe ~ bbl for oil
      guidanceGasMWh   = gasBoe / MWH_TO_BOE;

      unhedgedOilPrice = oilMkt;
      unhedgedGasPriceEur = gasMkt;

      opexPerBoe = defaultOpex;
    }

    // Clamp to non-negative
    const unhedgedOilBbl = Math.max(guidanceOilBbl - hedgedOilBoe, 0);
    const unhedgedGasMWh = Math.max(guidanceGasMWh - hedgedGasMWh, 0);

    // Revenue (USD)
    const revHedgedOil = hedgedOilBoe * hedgedOilPrice;
    const revHedgedGas = hedgedGasMWh * hedgedGasPriceEur * fx;
    const revHedged = revHedgedOil + revHedgedGas;

    const revUnhedgedOil = unhedgedOilBbl * unhedgedOilPrice;
    const revUnhedgedGas = unhedgedGasMWh * unhedgedGasPriceEur * fx;
    const revUnhedged = revUnhedgedOil + revUnhedgedGas;

    const revenue = revHedged + revUnhedged;

    // Opex & EBITDA
    const opex = (Number.isFinite(totalBoe) ? totalBoe : 0) * opexPerBoe + otherCosts;
    const ebitda = revenue - opex;

    return {
      label,
      revenue,
      revHedged,
      revUnhedged,
      ebitda,
      // detail (not currently shown, but handy for debugging/tooltips)
      revHedgedOil,
      revHedgedGas,
      revUnhedgedOil,
      revUnhedgedGas,
      opex,
    };
  });

  // If nothing to show, render a friendly empty state
  const hasAny = rows.some(r => (r.revenue || 0) > 0 || (r.ebitda || 0) > 0);
  if (!hasAny) {
    return (
      <div className="w-full rounded-xl border border-neutral-200 bg-white p-6 text-sm text-neutral-600">
        No hedge/production data provided. Add periods to <code>args.periods</code> in
        <code> slides.json</code> (Q3, Q4, etc.).
      </div>
    );
  }

  // Axis domain & tick sizing
  const maxVal = Math.max(
    1,
    ...rows.map(r => Math.max(r.revenue || 0, r.ebitda || 0, (r.revHedged || 0) + (r.revUnhedged || 0)))
  );
  const yMax = Math.ceil(maxVal / 10_000_000) * 10_000_000; // nearest $10m

  return (
    <div className="w-full h-[380px] md:h-[440px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={rows} margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#334155", fontSize: 12 }}
          />
          <YAxis
            domain={[0, yMax]}
            tick={{ fill: "#334155", fontSize: 12 }}
            tickFormatter={(v) => moneyShort(v)}
            allowDecimals={false}
            width={92}
            label={{
              value: "Revenue / EBITDA (USD, millions)",
              angle: -90,
              position: "insideLeft",
              fill: "#64748B",
            }}
          />
          <Tooltip
            wrapperStyle={{
              borderRadius: 12,
              border: "1px solid #e5e7eb",
              boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
            }}
            formatter={(value: any, name: any) => [moneyShort(Number(value) || 0), String(name)]}
          />
          <Legend iconType="circle" />

          {/* Hedged revenue */}
          <Bar
            name="Revenue (hedged)"
            dataKey="revHedged"
            stackId="rev"
            fill={brand.oil}
            radius={[8, 8, 0, 0]}
          />

          {/* Unhedged revenue */}
          <Bar
            name="Revenue (unhedged)"
            dataKey="revUnhedged"
            stackId="rev"
            fill={brand.gas}
          />

          {/* Invisible bar to place TOTAL revenue labels on top */}
          <Bar dataKey="revenue" fill="transparent">
            <LabelList
              dataKey="revenue"
              position="top"
              formatter={(v: number) => moneyShort(v)}
              className="text-xs"
            />
          </Bar>

          {/* EBITDA overlay */}
          <Bar
            name="EBITDA"
            dataKey="ebitda"
            fill={brand.opex}
            opacity={0.65}
            barSize={14}
          >
            <LabelList
              dataKey="ebitda"
              position="top"
              formatter={(v: number) => moneyShort(v)}
              className="text-[11px]"
            />
          </Bar>
        </ComposedChart>
      </ResponsiveContainer>
      <div className="mt-2 text-xs text-neutral-500">
        Simple model: revenue = hedged + unhedged at market; EBITDA ≈ revenue − opex.
        Gas converted at ~{DEFAULT_MWH_TO_BOE} boe/MWh (override with <code>mwh_to_boe</code>).
      </div>
    </div>
  );
}