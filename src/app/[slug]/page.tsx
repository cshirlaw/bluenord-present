import { notFound, redirect } from "next/navigation";
import path from "node:path";
import fs from "node:fs";

export default function SlugPage({ params }: { params: { slug: string } }) {
  const slug = params.slug;

  const slidesPath = path.join(
    process.cwd(),
    "public",
    "presentations",
    slug,
    "slides.json"
  );

  if (!fs.existsSync(slidesPath)) {
    notFound();
  }

  redirect(`/presentations/${slug}`);
}
