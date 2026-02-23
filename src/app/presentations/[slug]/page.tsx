import { notFound } from "next/navigation";
import fs from "node:fs";
import path from "node:path";
import PresentationClient from "@/components/PresentationClient";

function slidesJsonExists(slug: string): boolean {
  const p = path.join(process.cwd(), "public", "presentations", slug, "slides.json");
  return fs.existsSync(p);
}

export default function PresentationPage({ params }: { params: { slug: string } }) {
  const slug = params?.slug;

  if (typeof slug !== "string" || slug.length === 0) notFound();
  if (!slidesJsonExists(slug)) notFound();

  return <PresentationClient slug={slug} />;
}
