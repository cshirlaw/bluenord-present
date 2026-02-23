import fs from "node:fs";
import path from "node:path";
import { notFound, redirect } from "next/navigation";

type ManifestItem = { slug?: unknown };

function readManifestSlugs(): Set<string> {
  const manifestPath = path.join(process.cwd(), "public", "presentations", "manifest.json");

  let raw = "[]";
  try {
    raw = fs.readFileSync(manifestPath, "utf8");
  } catch {
    return new Set();
  }

  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return new Set();
  }

  if (Array.isArray(data)) {
    const slugs = data
      .map((x) => (x as ManifestItem)?.slug)
      .filter((s): s is string => typeof s === "string" && s.length > 0);
    return new Set(slugs);
  }

  return new Set();
}

export default function SlugPage({ params }: { params: { slug: string } }) {
  const slug = params.slug;

  const allowed = readManifestSlugs();
  if (!allowed.has(slug)) {
    notFound();
  }

  redirect(`/presentations/${slug}`);
}
