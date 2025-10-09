"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { motion } from "framer-motion";
import { brand } from "./palette";

type Point = { period: string; oil_hedged: number; gas_hedged: number };
type Props = { series: Point[]; unit?: string };

export default function HedgeCoverage({ series, unit = "%" }: Props) {
  return (
    <motion.div
      className="w-full h-[320px] md:h-[380px]"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={series}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="period" tickLine={false} axisLine={false} />
          <YAxis
            domain={[0, 100]}
            tickFormatter={(v) => `${v}%`}
            label={{
              value: `Coverage (${unit})`,
              angle: -90,
              position: "insideLeft",
              fill: "#64748B",
            }}
          />
          <Tooltip formatter={(v: number) => `${v.toFixed(0)}%`} />
          <Legend />
          <Line type="monotone" dataKey="oil_hedged" stroke={brand.oil} strokeWidth={3} dot={{ r: 4 }} name="Oil Hedged %" />
          <Line type="monotone" dataKey="gas_hedged" stroke={brand.gas} strokeWidth={3} dot={{ r: 4 }} name="Gas Hedged %" />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
}