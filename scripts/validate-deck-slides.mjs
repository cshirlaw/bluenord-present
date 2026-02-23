import fs from "fs";
import path from "path";

const root = process.cwd();
const dir = path.join(root, "public", "presentations");

if (!fs.existsSync(dir)) {
  console.log("No public/presentations directory; nothing to validate.");
  process.exit(0);
}

const decks = fs.readdirSync(dir, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name);

let ok = true;

for (const slug of decks) {
  const p = path.join(dir, slug, "slides.json");
  if (!fs.existsSync(p)) continue;

  let slides;
  try {
    slides = JSON.parse(fs.readFileSync(p, "utf8"));
  } catch (e) {
    console.error(`ERROR: ${slug}: slides.json is not valid JSON`);
    ok = false;
    continue;
  }

  if (!Array.isArray(slides)) {
    console.error(`ERROR: ${slug}: slides.json is not an array`);
    ok = false;
    continue;
  }

  const idSeen = new Set();
  const idDupes = new Set();

  for (const s of slides) {
    const id = String(s?.id || "").trim();
    if (!id) continue;
    if (idSeen.has(id)) idDupes.add(id);
    idSeen.add(id);
  }

  if (idDupes.size) {
    console.error(`ERROR: ${slug}: duplicate slide id(s): ${Array.from(idDupes).join(", ")}`);
    ok = false;
  }

  const groups = new Map(); // section|navTitle -> ids
  for (const s of slides) {
    const section = String(s?.section || "").trim();
    const navTitle = String(s?.navTitle || "").trim();
    const id = String(s?.id || "").trim();
    if (!section || !navTitle || !id) continue;
    const k = `${section}||${navTitle}`;
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(id);
  }

  const navDupes = [];
  for (const [k, ids] of groups.entries()) {
    if (ids.length > 1) {
      const [section, navTitle] = k.split("||");
      navDupes.push(`${section} / ${navTitle} -> ${ids.join(", ")}`);
    }
  }

  if (navDupes.length) {
    console.error(`ERROR: ${slug}: duplicate navTitle within section:`);
    for (const line of navDupes) console.error(`  - ${line}`);
    ok = false;
  }
}

if (!ok) {
  process.exit(1);
}

console.log("OK: deck validation passed (no duplicate ids; no duplicate navTitle per section).");
