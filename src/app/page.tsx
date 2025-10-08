import Link from "next/link";
import { Container, Card } from "@/components/ui";
// Future: import manifest built by scripts/build-presentations-manifest.mjs

const samples = [
  { slug: "pareto-2025-09", title: "Pareto Conference — Sept 2025", desc: "Deck, inline charts, video, downloadable PDF." },
];

export default function Home() {
  return (
    <Container>
      <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Presentations</h1>
      <p className="mt-3 text-neutral-600">Interactive microsites for BlueNord management presentations.</p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {samples.map((p) => (
          <Link key={p.slug} href={`/${p.slug}`} className="no-underline">
            <Card className="h-full">
              <div className="text-sm text-brand font-medium">Microsite</div>
              <div className="mt-2 text-lg font-semibold">{p.title}</div>
              <p className="mt-2 text-neutral-600">{p.desc}</p>
              <div className="mt-4 text-sm text-neutral-500">Open →</div>
            </Card>
          </Link>
        ))}
      </div>
    </Container>
  );
}