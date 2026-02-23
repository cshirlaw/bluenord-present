import { notFound, redirect } from "next/navigation";
import path from "node:path";
import fs from "node:fs";

type ManifestItem = { slug: string };

function readManifestSlugs(): Set<string> {
  const manifestPath = path.join(process.cwd(), "public", "presentations", "manifest.json");
  const raw = fs.readFileSync(manifestPath, "utf8");
  const items = JSON.parse(raw) as ManifestItem[];
  return new Set(items.map((i) => i.slug));
}

export default function SlugPage({ params }: { params: { slug: string } }) {
  const slug = params.slug;

  if (slug === "nov-2025-clean") {
    notFound();
  }

  const allowed = readManifestSlugs();
  if (!allowed.has(slug)) {
    notFound();
  }

  redirect(`/presentations/${slug}`);
}
