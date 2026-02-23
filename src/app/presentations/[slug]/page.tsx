import { notFound } from "next/navigation";
import PresentationClient from "@/components/PresentationClient";
import manifest from "../../../../public/presentations/manifest.json";

type ManifestItem = { slug: string };

function allowedSlugs(): Set<string> {
  const items = (manifest as ManifestItem[]) || [];
  return new Set(items.map((i) => i.slug).filter(Boolean));
}

export default async function PresentationPage({ params }: { params: unknown }) {
  const resolved = await Promise.resolve(params as any);
  const slug = resolved?.slug;

  if (typeof slug !== "string" || slug.length === 0) notFound();

  const allowed = allowedSlugs();
  if (!allowed.has(slug)) notFound();

  return <PresentationClient slug={slug} />;
}
