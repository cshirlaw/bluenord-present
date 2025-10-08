import { readdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const root = process.cwd();
const base = join(root, "public", "presentations");

const items = [];
for (const slug of readdirSync(base, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name)) {
  try {
    const slidesPath = join(base, slug, "slides.json");
    const slides = JSON.parse(readFileSync(slidesPath, "utf8"));
    const title = slides?.[0]?.title ? `Presentation: ${slides[0].title}` : slug.replace(/-/g, " ").toUpperCase();
    items.push({ slug, title, date: new Date().toISOString().slice(0,10) });
  } catch { /* ignore bad folders */ }
}

items.sort((a,b) => (a.date < b.date ? 1 : -1));
const outPath = join(base, "manifest.json");
writeFileSync(outPath, JSON.stringify(items, null, 2), "utf8");
console.log(`Wrote ${outPath} with ${items.length} item(s).`);