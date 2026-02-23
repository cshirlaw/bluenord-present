import { notFound, redirect } from "next/navigation";
import fs from "node:fs";
import path from "node:path";

function slidesJsonExists(slug: string): boolean {
  const p = path.join(process.cwd(), "public", "presentations", slug, "slides.json");
  return fs.existsSync(p);
}

export default async function SlugPage({ params }: { params: unknown }) {
  const resolved = await Promise.resolve(params as any);
  const slug = resolved?.slug;

  if (typeof slug !== "string" || slug.length === 0) {
    notFound();
  }

  if (!slidesJsonExists(slug)) {
    notFound();
  }

  redirect(`/presentations/${slug}`);
}
