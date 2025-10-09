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
} from "recharts";
import { motion } from "framer-motion";
import { brand } from "./palette";

type Point = {
  period: string;
  oil_hedged: number;
  oil_forecast: number;
  gas_hedged: number;
  gas_forecast: number;
};
type Props = { series: Point[]; unit?: string };

export default function HedgeVolumes({ series, unit = "million" }: Props) {
  return (
    <motion.div
      className="w-full h-[360px] md:h-[400px]"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={series} barCategoryGap={20}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="period" tickLine={false} axisLine={false} />
          <YAxis
            label={{
              value: `Volumes (${unit})`,
              angle: -90,
              position: "insideLeft",
              fill: "#64748B",
            }}
            tick={{ fill: "#334155" }}
          />
          <Tooltip />
          <Legend />
          <Bar dataKey="oil_forecast" fill={brand.oil} fillOpacity={0.25} name="Oil Forecast" radius={[8,8,0,0]} />
          <Bar dataKey="oil_hedged"   fill={brand.oil}                 name="Oil Hedged"   radius={[8,8,0,0]} />
          <Bar dataKey="gas_forecast" fill={brand.gas} fillOpacity={0.25} name="Gas Forecast" radius={[8,8,0,0]} />
          <Bar dataKey="gas_hedged"   fill={brand.gas}                 name="Gas Hedged"   radius={[8,8,0,0]} />
        </ComposedChart>
      </ResponsiveContainer>
    </motion.div>
  );
}