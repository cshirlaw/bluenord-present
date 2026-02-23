export type IndexSlide = {
  __domId: string;
  title: string;
};

export function dedupeIndexSlides(items: IndexSlide[]): IndexSlide[] {
  const seen = new Set<string>();
  const out: IndexSlide[] = [];

  for (const it of items) {
    const k = (it.title || "").trim().toLowerCase();
    if (!k) continue;
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(it);
  }

  return out;
}
