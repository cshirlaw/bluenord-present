import { notFound, redirect } from "next/navigation";
import manifest from "../../../public/presentations/manifest.json";

type ManifestItem = { slug: string };

const BLOCKED = new Set(["nov-2025-clean"]);

function allowedSlugs(): Set<string> {
  const items = (manifest as ManifestItem[]) || [];
  return new Set(items.map((i) => i.slug).filter(Boolean));
}

export default async function VanitySlugPage({ params }: { params: unknown }) {
  const resolved = await Promise.resolve(params as any);
  const slug = resolved?.slug;

  if (typeof slug !== "string" || slug.length === 0) notFound();
  if (BLOCKED.has(slug)) notFound();

  const allowed = allowedSlugs();
  if (!allowed.has(slug)) notFound();

  redirect(`/presentations/${encodeURIComponent(slug)}`);
}
