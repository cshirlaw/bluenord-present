"use client";
import { motion, type HTMLMotionProps } from "framer-motion";

export function Reveal(props: HTMLMotionProps<"section">) {
  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.985 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-5% 0px -5% 0px" }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      {...props}
    />
  );
}