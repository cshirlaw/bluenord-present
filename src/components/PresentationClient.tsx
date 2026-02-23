/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Container, Prose } from "@/components/ui";
import DownloadButton from "@/components/DownloadButton";
import ProfilesGrid from "@/components/ProfilesGrid";
import ChartRouter from "@/components/ChartRouter";
import SectionNav2 from "@/components/SectionNav2";
import { motion } from "framer-motion";

const SECTION_ORDER = [
  "Company",
  "People",
  "Strategy",
  "Production",
  "Hedging",
  "Financials",
  "Q2 Overview",
  "General",
];

type SlideBase = {
  id: string;
  title: string;
  section?: string;
  navTitle?: string;
};

type SlideText = SlideBase & { type: "text"; md: string };
type SlideChart = SlideBase & { type: "chart"; chart: string; args?: Record<string, unknown> };
type SlideVideo = SlideBase & { type: "video"; src: string };
type SlideDownload = SlideBase & { type: "download"; href: string };
type SlideImage = SlideBase & { type: "image"; src: string; caption?: string };
type SlideProfiles = SlideBase & {
  type: "profiles";
  people: {
    name: string;
    title: string;
    photo: string;
    bio?: string;
    bioLong?: string;
    link?: string;
  }[];
};
type SlideStats = SlideBase & {
  type: "stats";
  items: { label: string; value: string; footnote?: string }[];
};

type SlideItem =
  | SlideText
  | SlideChart
  | SlideVideo
  | SlideDownload
  | SlideImage
  | SlideProfiles
  | SlideStats;

type SlideWithDom = SlideItem & { __domId: string };
type SectionItem = { id: string; title: string; __domId: string };
type Group = { section: string; slides: SectionItem[] };

const isText = (s: SlideItem): s is SlideText => s.type === "text";
const isStats = (s: SlideItem): s is SlideStats => s.type === "stats";
const isChart = (s: SlideItem): s is SlideChart => s.type === "chart";
const isVideo = (s: SlideItem): s is SlideVideo => s.type === "video";
const isImage = (s: SlideItem): s is SlideImage => s.type === "image";
const isProfiles = (s: SlideItem): s is SlideProfiles => s.type === "profiles";
const isDownload = (s: SlideItem): s is SlideDownload => s.type === "download";

function makeUniqueIds<T extends { id: string }>(arr: T[]): (T & { __domId: string })[] {
  const seen = new Map<string, number>();
  return arr.map((s, idx) => {
    const base = (s.id || `section-${idx}`).trim();
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    const domId = count === 0 ? base : `${base}-${count + 1}`;
    return { ...s, __domId: domId };
  });
}

function readHash(): string {
  if (typeof window === "undefined") return "";
  const raw = (window.location.hash || "").replace(/^#/, "");
  if (!raw) return "";
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

function setHash(id: string) {
  if (typeof window === "undefined") return;
  window.location.hash = encodeURIComponent(id);
}

function clearHash() {
  if (typeof window === "undefined") return;
  window.history.replaceState(null, "", window.location.pathname);
}

function scrollToDomId(id: string) {
  const el = typeof document !== "undefined" ? document.getElementById(id) : null;
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function PresentationClient({ slug }: { slug: string }) {
  const router = useRouter();
  const cleanSlug = slug.toString().trim().replace(/\/+$/g, "").replace(/\.+$/g, "");

  useEffect(() => {
    if (slug && slug !== cleanSlug) router.replace(`/${encodeURIComponent(cleanSlug)}`);
  }, [slug, cleanSlug, router]);

  const [slides, setSlides] = useState<SlideItem[]>([]);
  const [ready, setReady] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    setErr(null);
    setReady(false);
    setSlides([]);

    if (!cleanSlug) {
      setErr("Missing slug in URL.");
      return;
    }
    if (!/^[a-z0-9._-]+$/i.test(cleanSlug)) {
      setErr(`Slug contains unexpected characters: "${cleanSlug}"`);
      return;
    }

    const url = `/presentations/${encodeURIComponent(cleanSlug)}/slides.json`;
    (async () => {
      try {
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
        const data = (await res.json()) as SlideItem[];
        if (!Array.isArray(data)) throw new Error("slides.json did not return an array");
        setSlides(data);
        setReady(true);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        console.error("[slides] load error:", msg);
        setErr(msg);
      }
    })();
  }, [cleanSlug, slug]);

  const slidesWithIds = useMemo<SlideWithDom[]>(() => makeUniqueIds(slides), [slides]);

  const groups = useMemo<Group[]>(() => {
    const by = new Map<string, SectionItem[]>();
    const seenOrder: string[] = [];

    slidesWithIds.forEach((s) => {
      const section = s.section?.trim() || "General";
      if (!by.has(section)) {
        by.set(section, []);
        seenOrder.push(section);
      }
      by.get(section)!.push({
        id: s.id,
        title: s.navTitle ?? s.title,
        __domId: s.__domId,
      });
    });

    const orderIndex = (name: string) => {
      const i = SECTION_ORDER.indexOf(name);
      return i === -1 ? 1000 + seenOrder.indexOf(name) : i;
    };

    return Array.from(by.entries())
      .sort((a, b) => orderIndex(a[0]) - orderIndex(b[0]))
      .map(([section, items]) => ({ section, slides: items }));
  }, [slidesWithIds]);

  const [activeSection, setActiveSection] = useState<string>("General");
  useEffect(() => {
    if (groups.length > 0) setActiveSection(groups[0].section);
  }, [groups]);

  const [activeDomId, setActiveDomId] = useState<string | null>(null);

  useEffect(() => {
    if (!ready) return;

    const applyHash = () => {
      const decoded = readHash();

      if (!decoded) {
        setActiveDomId(null);
        return;
      }

      const found = slidesWithIds.find((s) => s.__domId === decoded);
      if (!found) {
        setActiveDomId(null);
        return;
      }

      const section = found.section?.trim() || "General";
      setActiveSection(section);
      setActiveDomId(found.__domId);
      setTimeout(() => scrollToDomId(found.__domId), 30);
    };

    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, [ready, slidesWithIds]);

  const filteredSlides = useMemo<SlideWithDom[]>(
    () =>
      slidesWithIds.filter(
        (s) => (s.section?.trim() || "General") === (activeSection || "General")
      ),
    [slidesWithIds, activeSection]
  );

  const activeSlide = useMemo<SlideWithDom | null>(() => {
    if (!activeDomId) return null;
    return filteredSlides.find((s) => s.__domId === activeDomId) ?? null;
  }, [filteredSlides, activeDomId]);

  const navIndex = useMemo(() => {
    if (!activeDomId) return -1;
    return filteredSlides.findIndex((s) => s.__domId === activeDomId);
  }, [filteredSlides, activeDomId]);

  const hasPrev = navIndex > 0;
  const hasNext = navIndex >= 0 && navIndex < filteredSlides.length - 1;

  const prevId = hasPrev ? filteredSlides[navIndex - 1].__domId : null;
  const nextId = hasNext ? filteredSlides[navIndex + 1].__domId : null;

  return (
    <Container>
      <div className="mb-4 md:mb-6 flex items-center justify-between">
        <h1 className="text-xl md:text-3xl font-semibold tracking-tight">Presentation</h1>
      </div>

      {err && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <div className="font-semibold mb-1">Could not load slides</div>
          <div>{err}</div>
          <div className="mt-2 text-red-600/80">
            Tip: open <code>/presentations/{cleanSlug || "your-slug"}/slides.json</code> directly.
          </div>
        </div>
      )}

      {groups.length > 0 && (
        <div className="mb-4">
          <SectionNav2
            groups={groups}
            activeDomId={activeDomId ?? undefined}
            activeSection={activeSection}
            onSectionChange={setActiveSection}
          />
        </div>
      )}

      {!activeSlide && (
        <div className="rounded-xl border bg-white p-4 text-sm text-zinc-700">
          Select a slide from the index above.
        </div>
      )}

      {activeSlide && (
        <div className="pb-20">
          <motion.div
            key={activeSlide.__domId}
            id={activeSlide.__domId}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
          >
            <Card className="p-4 md:p-6">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-lg md:text-xl font-semibold">{activeSlide.title}</h2>
                {isDownload(activeSlide) && <DownloadButton href={activeSlide.href} />}
              </div>

              {isText(activeSlide) && (
                <Prose>
                  <div dangerouslySetInnerHTML={{ __html: activeSlide.md }} />
                </Prose>
              )}

              {isStats(activeSlide) && (
                <div className="grid gap-3 md:grid-cols-2">
                  {activeSlide.items.map((it, idx) => (
                    <div key={idx} className="rounded-xl border bg-white p-3">
                      <div className="text-sm text-zinc-600">{it.label}</div>
                      <div className="text-xl font-semibold">{it.value}</div>
                      {it.footnote && <div className="text-xs text-zinc-500 mt-1">{it.footnote}</div>}
                    </div>
                  ))}
                </div>
              )}

              {isChart(activeSlide) && <ChartRouter chart={activeSlide.chart} args={activeSlide.args} />}

              {isImage(activeSlide) && (
                <div>
                  <img
                    src={activeSlide.src}
                    alt={activeSlide.title}
                    className="w-full rounded-xl border bg-white"
                  />
                  {activeSlide.caption && (
                    <div className="mt-2 text-sm text-zinc-600">{activeSlide.caption}</div>
                  )}
                </div>
              )}

              {isVideo(activeSlide) && (
                <div className="aspect-video w-full overflow-hidden rounded-xl border bg-white">
                  <iframe
                    className="h-full w-full"
                    src={activeSlide.src}
                    title={activeSlide.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}

              {isProfiles(activeSlide) && <ProfilesGrid people={activeSlide.people} />}
            </Card>
          </motion.div>
        </div>
      )}

      <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 md:px-6 py-2 flex items-center justify-between gap-2">
          <button
            type="button"
            className="rounded-lg border px-3 py-2 text-sm disabled:opacity-50"
            disabled={!prevId}
            onClick={() => prevId && setHash(prevId)}
          >
            Previous
          </button>

          <button
            type="button"
            className="rounded-lg border px-3 py-2 text-sm"
            onClick={() => {
              clearHash();
              setActiveDomId(null);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            Back to index
          </button>

          <button
            type="button"
            className="rounded-lg border px-3 py-2 text-sm disabled:opacity-50"
            disabled={!nextId}
            onClick={() => nextId && setHash(nextId)}
          >
            Next
          </button>
        </div>
      </div>
    </Container>
  );
}
