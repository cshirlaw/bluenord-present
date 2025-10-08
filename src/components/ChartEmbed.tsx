"use client";
import { Card } from "./ui";
import { ResponsiveContainer } from "recharts";
import dynamic from "next/dynamic";

const LineChart = dynamic(() => import("recharts").then(m => m.LineChart), { ssr: false });
// ... import other primitives as needed

export default function ChartEmbed({ children, title }: { children: React.ReactNode; title?: string }) {
  return (
    <Card className="overflow-hidden">
      {title && <div className="mb-3 text-sm font-medium text-neutral-600">{title}</div>}
      <div className="h-[280px] sm:h-[340px]">
        <ResponsiveContainer width="100%" height="100%">
          {/* The caller supplies the actual chart elements */}
          {children}
        </ResponsiveContainer>
      </div>
    </Card>
  );
}