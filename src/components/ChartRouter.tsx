"use client";
import dynamic from "next/dynamic";

/* ========== Interactive charts (code-split) ========== */
const ProductionByHubQ1Q2     = dynamic(() => import("@/components/charts/ProductionByHubQ1Q2"),     { ssr: false });
const OilGasMixQ1Q2           = dynamic(() => import("@/components/charts/OilGasMixQ1Q2"),           { ssr: false });
const OpexPerBoeQ1Q2          = dynamic(() => import("@/components/charts/OpexPerBoeQ1Q2"),          { ssr: false });
const GuidanceVsActuals       = dynamic(() => import("@/components/charts/GuidanceVsActuals"),       { ssr: false });
const ProdByField             = dynamic(() => import("@/components/charts/ProdByField"),             { ssr: false });
const DucOwnership            = dynamic(() => import("@/components/charts/DucOwnership"),            { ssr: false });
const ProdGoal                = dynamic(() => import("@/components/charts/ProdGoal"),                { ssr: false });
const ProdArrow               = dynamic(() => import("@/components/charts/ProdGrowthArrow"),         { ssr: false });
const TyraPerformance         = dynamic(() => import("@/components/charts/TyraPerformance"),         { ssr: false });
const ProductionBars          = dynamic(() => import("@/components/charts/ProductionBars"),          { ssr: false });
const HedgeBridge             = dynamic(() => import("@/components/charts/HedgeBridge"),             { ssr: false });
const ProductionCapexSummary  = dynamic(() => import("@/components/charts/ProductionCapexSummary"),  { ssr: false });

/* 🔵 New hedging trio */
const HedgeCoverage           = dynamic(() => import("@/components/charts/HedgeCoverage"),           { ssr: false });
const HedgeVolumes            = dynamic(() => import("@/components/charts/HedgeVolumes"),            { ssr: false });
const HedgeExposure           = dynamic(() => import("@/components/charts/HedgeExposure"),           { ssr: false });

/* ========== “Blocks” routed like charts ========== */
const ReservesCard            = dynamic(() => import("@/components/blocks/ReservesCard"),            { ssr: false });
const HedgePortfolio          = dynamic(() => import("@/components/blocks/HedgePortfolio"),          { ssr: false });
const ProductionUpdate        = dynamic(() => import("@/components/blocks/ProductionUpdate"),        { ssr: false });

export default function ChartRouter({
  name,
  args,
}: {
  name: string;
  args?: Record<string, unknown>;
}) {
  switch (name) {
    /* ===== Data charts ===== */
    case "production-by-hub-q1q2":
      return <ProductionByHubQ1Q2 />;
    case "oil-gas-mix-q1q2":
      return <OilGasMixQ1Q2 />;
    case "opex-per-boe-q1q2":
      return <OpexPerBoeQ1Q2 />;
    case "guidance-vs-actuals":
  return <GuidanceVsActuals args={args} />;
    case "prod-by-field":
      return <ProdByField />;
    case "duc-ownership":
      return <DucOwnership />;
    case "prod-goal":
      return <ProdGoal />;
    case "prod-growth-arrow":
      return <ProdArrow />;
    case "tyra-performance":
      return <TyraPerformance />;
    case "production-bars":
      return <ProductionBars />;
    case "production-update":
      return <ProductionUpdate />;

    /* ===== Hedging charts ===== */
    case "hedge-bridge":
      return <HedgeBridge args={args} />;
    case "hedge-coverage":
      return <HedgeCoverage {...(args as any)} />;
    case "hedge-volumes":
      return <HedgeVolumes {...(args as any)} />;
    case "hedge-exposure":
      return <HedgeExposure args={args} />;

    /* ===== Production & Capex summary ===== */
    case "production-capex-summary":
      return <ProductionCapexSummary />;

    /* ===== Blocks ===== */
    case "reserves-card":
      return <ReservesCard />;
    case "hedge-portfolio":
      return <HedgePortfolio />;

    /* (Optional) legacy PNG fallback */
    case "prod-by-hub":
      return (
        <img
          src="/presentations/pareto-2025-09/production-by-hub.png"
          alt="Q2 2025 Production by Hub"
        />
      );

    /* ===== Unknown ===== */
    default:
      return (
        <div className="rounded-xl border border-neutral-200 bg-white p-4 text-sm text-neutral-600">
          Unknown chart: <code>{name}</code>
        </div>
      );
  }
}