import { readdirSync, readFileSync, writeFileSync, statSync } from "fs";
import { join } from "path";

const root = process.cwd();
const base = join(root, "public", "presentations");

function isoDateFromSlug(slug) {
  // match YYYY-MM or YYYY-MM-DD anywhere in the slug
  const m = slug.match(/(20\d{2})-(\d{2})(?:-(\d{2}))?/);
  if (!m) return null;
  const y = m[1];
  const mo = m[2];
  const d = m[3] ?? "01";
  return `${y}-${mo}-${d}`;
}

function isoDateFromMtime(path) {
  const ms = statSync(path).mtimeMs;
  return new Date(ms).toISOString().slice(0, 10);
}

const items = [];

for (const slug of readdirSync(base, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)) {
  const slidesPath = join(base, slug, "slides.json");
  try {
    const slides = JSON.parse(readFileSync(slidesPath, "utf8"));
    const title = slides?.[0]?.title
      ? `Presentation: ${slides[0].title}`
      : slug.replace(/-/g, " ").toUpperCase();

    const date = isoDateFromSlug(slug) ?? isoDateFromMtime(slidesPath);

    items.push({ slug, title, date });
  } catch {
    // ignore folders with no valid slides.json
  }
}

items.sort((a, b) => (a.date < b.date ? 1 : -1));

const outPath = join(base, "manifest.json");
writeFileSync(outPath, JSON.stringify(items, null, 2) + "\n", "utf8");
console.log(`Wrote ${outPath} with ${items.length} item(s).`);
