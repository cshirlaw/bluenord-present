// components/charts/palette.ts
export const brand = {
  oil: "#0EA5E9",     // sky-500
  gas: "#22C55E",     // green-500
  opex: "#8B5CF6",    // violet-500
  capex: "#F59E0B",   // amber-500
  base: "#64748B",    // slate-500 (fallback)
};

export const hubs = {
  Tyra: "#0EA5E9",    // sky-500
  Halfdan: "#F59E0B", // amber-500
  Dan: "#22C55E",     // green-500
  Gorm: "#EF4444",    // red-500
};

export const order = ["Tyra", "Halfdan", "Dan", "Gorm"] as const;