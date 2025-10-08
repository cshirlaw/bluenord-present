import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}", "./public/**/*.html"],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: "#16A34A", dark: "#0D5E2A", light: "#DCFCE7" },
      },
      boxShadow: {
        soft: "0 1px 2px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.06)",
      },
      transitionTimingFunction: { gentle: "cubic-bezier(.22,1,.36,1)" },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
export default config;