/* eslint-disable @next/next/no-img-element */
"use client";

/**
 * This page:
 *  - Orders section tabs by SECTION_ORDER (fallback = discovery order)
 *  - Uses optional `navTitle` (from slides.json) for the small sub-pills
 */

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, Container, Prose } from "@/components/ui";
import DownloadButton from "@/components/DownloadButton";
import ProfilesGrid from "@/components/ProfilesGrid";
import ChartRouter from "@/components/ChartRouter";
import SectionNav2 from "@/components/SectionNav2";
import { motion } from "framer-motion";

/* ---------------- Config: desired tab order ---------------- */
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

/* ---------------- Types ---------------- */
type SlideBase = {
  id: string;
  title: string;
  section?: string;      // drives grouping
  navTitle?: string;     // optional short label used in sub-pills
};

type SlideText = SlideBase & { type: "text"; md: string };
type SlideChart = SlideBase & {
  type: "chart";
  chart: string;
  args?: Record<string, unknown>;
};
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

/* ---------------- Type guards ---------------- */
const isText = (s: SlideItem): s is SlideText => s.type === "text";
const isStats = (s: SlideItem): s is SlideStats => s.type === "stats";
const isChart = (s: SlideItem): s is SlideChart => s.type === "chart";
const isVideo = (s: SlideItem): s is SlideVideo => s.type === "video";
const isImage = (s: SlideItem): s is SlideImage => s.type === "image";
const isProfiles = (s: SlideItem): s is SlideProfiles => s.type === "profiles";
const isDownload = (s: SlideItem): s is SlideDownload => s.type === "download";

/* ---------------- Helpers ---------------- */
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

export default function PresentationPage() {
  const router = useRouter();
  const params = useParams();

  // Slug normalization
  const rawSlug = (params as Record<string, string | string[] | undefined>)?.slug;
  const slug = Array.isArray(rawSlug) ? rawSlug[0] : rawSlug || "";
  const cleanSlug = slug.toString().trim().replace(/\/+$/g, "").replace(/\.+$/g, "");

  useEffect(() => {
    if (slug && slug !== cleanSlug) router.replace(`/${encodeURIComponent(cleanSlug)}`);
  }, [slug, cleanSlug, router]);

  // Data state
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

  // Unique ids
  const slidesWithIds = useMemo<SlideWithDom[]>(() => makeUniqueIds(slides), [slides]);

  // Build groups from slide.section, then sort by SECTION_ORDER
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
        title: s.navTitle ?? s.title, // 👈 use short label if provided
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

  // Active section = first section in our sorted groups
  const [activeSection, setActiveSection] = useState<string>("General");
  useEffect(() => {
    if (groups.length > 0) setActiveSection(groups[0].section);
  }, [groups]);

  // Filter slides to active section only
  const filteredSlides = useMemo<SlideWithDom[]>(
    () =>
      slidesWithIds.filter(
        (s) => (s.section?.trim() || "General") === (activeSection || "General")
      ),
    [slidesWithIds, activeSection]
  );

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

      {/* Section tabs + sub-pills */}
      {groups.length > 0 && (
        <div className="mb-4">
          <SectionNav2
            groups={groups}
            activeDomId={undefined}
            activeSection={activeSection}           // 👈 controlled tab
            onSectionChange={setActiveSection}      // 👈 controlled tab
          />
        </div>
      )}

      {/* Only render slides from the active section */}
      <div className="mt-6 space-y-6">
        {ready &&
          filteredSlides.map((s, idx) => (
            <motion.section
              key={s.__domId}
              id={s.__domId}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.35, delay: idx * 0.03 }}
              className="scroll-mt-24"
            >
              <Card>
                <h2 className="text-xl md:text-2xl font-semibold">{s.title}</h2>

                {isText(s) && (
                  <Prose className="mt-3 prose prose-zinc max-w-none">
                    <p>{s.md}</p>
                  </Prose>
                )}

                {isStats(s) && (() => {
                  const isHero = s.id === "q2-2025-at-a-glance";
                  return (
                    <div
                      className={
                        isHero
                          ? "mt-3 rounded-3xl p-[1px] bg-gradient-to-r from-sky-500/30 via-cyan-500/30 to-blue-600/30"
                          : "mt-3"
                      }
                    >
                      <div
                        className={
                          isHero
                            ? "rounded-3xl bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/80 p-5"
                            : ""
                        }
                      >
                        <div className={isHero ? "mb-2 text-sm text-neutral-600" : "hidden"}>
                          Quarter snapshot
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                          {s.items.map((kpi, i) => (
                            <div
                              key={`${s.id}-${i}`}
                              className={
                                isHero
                                  ? "rounded-2xl border border-neutral-200 bg-white p-6 shadow-soft hover:shadow-md transition"
                                  : "rounded-2xl border border-neutral-200 bg-white p-5 shadow-soft"
                              }
                            >
                              <div className="text-sm text-neutral-600">{kpi.label}</div>
                              <div
                                className={
                                  isHero
                                    ? "mt-1 text-3xl md:text-4xl font-semibold tracking-tight"
                                    : "mt-1 text-2xl font-semibold tracking-tight"
                                }
                              >
                                {kpi.value}
                              </div>
                              {kpi.footnote && (
                                <div className="mt-1 text-xs text-neutral-500">{kpi.footnote}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {isChart(s) && (
                  <div className="mt-4">
                    <ChartRouter name={s.chart} args={s.args} />
                  </div>
                )}

                {isVideo(s) && (
                  <div className="mt-4 aspect-video overflow-hidden rounded-xl">
                    <iframe
                      src={s.src}
                      className="h-full w-full"
                      allow="autoplay; fullscreen; picture-in-picture"
                      loading="lazy"
                    />
                  </div>
                )}

                {isImage(s) && (
                  <div className="mt-3">
                    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-soft">
                      <img
                        src={s.src}
                        alt={s.title}
                        className="block h-auto w-full"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.alt = "Image not found";
                          e.currentTarget.src = "/presentations/placeholder-image.png";
                        }}
                      />
                    </div>
                    {s.caption && <p className="mt-2 text-sm text-neutral-600">{s.caption}</p>}
                  </div>
                )}

                {isProfiles(s) && (
                  <div className="mt-3">
                    <ProfilesGrid people={s.people} />
                  </div>
                )}

                {isDownload(s) && (
                  <div className="mt-4">
                    <DownloadButton href={s.href} />
                  </div>
                )}
              </Card>
            </motion.section>
          ))}
      </div>
    </Container>
  );
}