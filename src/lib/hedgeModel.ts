// src/lib/hedgeModel.ts
export type HedgeInputs = {
  // Period label (e.g., "Q3 2025")
  label: string;

  // Expected total production for the period (boe)
  totalBoe: number;

  // Split assumption (share of boe that is oil). If omitted, defaults ~0.61 (Q2 mix).
  oilShare?: number; // 0..1

  // Hedges that apply to THIS period only (already prorated to the period)
  // If you prefer to pass full-year hedges, just pre-pro-rate before calling.
  hedgedOilBoe?: number;      // boe (assume 1 bbl ≈ 1 boe)
  hedgedOilPriceUsd?: number; // $/bbl

  hedgedGasMWh?: number;      // MWh
  hedgedGasPriceEur?: number; // €/MWh

  // Market case (what you expect to realize on unhedged volumes)
  marketOilPriceUsd: number;  // $/bbl
  marketGasPriceEur: number;  // €/MWh
  usdPerEur?: number;         // default 1.10

  // Unit cost assumption
  opexPerBoeUsd?: number;     // default 30
};

// Energy conversion helpers
// 1 boe ≈ 5.8 MMBtu ≈ ~1,700 kWh → 1 MWh ≈ 0.588 boe
export const MWH_TO_BOE = 0.5882352941;

export function clamp01(x: number | undefined, fallback = 0.61) {
  if (typeof x !== "number" || Number.isNaN(x)) return fallback;
  return Math.min(1, Math.max(0, x));
}

export function computeHedgeBridgeRow(i: HedgeInputs) {
  const usdPerEur = i.usdPerEur ?? 1.10;
  const opexPerBoe = i.opexPerBoeUsd ?? 30;
  const oilShare = clamp01(i.oilShare, 0.61);

  const totalOilBoe = i.totalBoe * oilShare;
  const totalGasBoe = i.totalBoe - totalOilBoe;

  // Hedged portions (oil already in boe; gas provided in MWh → boe)
  const hedgedOilBoe = Math.min(i.hedgedOilBoe ?? 0, totalOilBoe);
  const hedgedGasBoe = Math.min((i.hedgedGasMWh ?? 0) * MWH_TO_BOE, totalGasBoe);

  // Unhedged = total - hedged
  const unhedgedOilBoe = Math.max(0, totalOilBoe - hedgedOilBoe);
  const unhedgedGasBoe = Math.max(0, totalGasBoe - hedgedGasBoe);

  // Revenues
  const revHedgedOil = hedgedOilBoe * (i.hedgedOilPriceUsd ?? i.marketOilPriceUsd);
  const revHedgedGas = hedgedGasBoe * ((i.hedgedGasPriceEur ?? i.marketGasPriceEur) * usdPerEur);

  const revUnhedgedOil = unhedgedOilBoe * i.marketOilPriceUsd;
  const revUnhedgedGas = unhedgedGasBoe * (i.marketGasPriceEur * usdPerEur);

  const revenueTotal =
    revHedgedOil + revHedgedGas + revUnhedgedOil + revUnhedgedGas;

  const opex = i.totalBoe * opexPerBoe;
  const ebitda = revenueTotal - opex;

  return {
    label: i.label,

    // volumes
    totalBoe: i.totalBoe,
    oilShare,
    totalOilBoe,
    totalGasBoe,
    hedgedOilBoe,
    hedgedGasBoe,
    unhedgedOilBoe,
    unhedgedGasBoe,

    // revenue parts
    revHedgedOil,
    revHedgedGas,
    revUnhedgedOil,
    revUnhedgedGas,
    revenueTotal,

    // costs & EBITDA
    opex,
    ebitda,
  };
}

export function computeHedgeBridge(periods: HedgeInputs[]) {
  return periods.map(computeHedgeBridgeRow);
}