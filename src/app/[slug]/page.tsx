/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, Container, Prose } from "@/components/ui";
import SectionNav from "@/components/SectionNav";
import DownloadButton from "@/components/DownloadButton";
import ProfilesGrid from "@/components/ProfilesGrid";
import ChartRouter from "@/components/ChartRouter";
import { motion } from "framer-motion";

// Slide item shape
type SlideItem =
  | { id: string; type: "text"; title: string; md: string }
  | { id: string; type: "chart"; title: string; chart: string; args?: Record<string, unknown> }
  | { id: string; type: "video"; title: string; src: string }
  | { id: string; type: "download"; title: string; href: string }
  | { id: string; type: "image"; title: string; src: string; caption?: string }
  | {
      id: string;
      type: "profiles";
      title: string;
      people: {
        name: string;
        title: string;
        photo: string;
        bio?: string;
        bioLong?: string;
        link?: string;
      }[];
    }
  | {
      id: string;
      type: "stats";
      title: string;
      items: { label: string; value: string; footnote?: string }[];
    };

// Ensure every slide gets a unique DOM id, even if source ids repeat
function makeUniqueIds<T extends { id: string; title?: string }>(arr: T[]) {
  const seen = new Map<string, number>();
  return arr.map((s, idx) => {
    const base = (s.id || `section-${idx}`).trim();
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    const domId = count === 0 ? base : `${base}-${count + 1}`;
    return { ...s, __domId: domId } as T & { __domId: string };
  });
}

export default function PresentationPage() {
  const router = useRouter();
  const params = useParams();

  // Get slug from route params
  const rawSlug = (params as Record<string, string | string[] | undefined>)?.slug;
  const slug = Array.isArray(rawSlug) ? rawSlug[0] : rawSlug || "";

  // Normalize: trim spaces, strip trailing slashes/dots
  const cleanSlug = slug.toString().trim().replace(/\/+$/g, "").replace(/\.+$/g, "");

  // Optional: auto-correct the URL if a trailing dot/slash sneaks in
  useEffect(() => {
    if (slug && slug !== cleanSlug) {
      router.replace(`/${encodeURIComponent(cleanSlug)}`);
    }
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
    // (Optional) allow only sane chars
    if (!/^[a-z0-9._-]+$/i.test(cleanSlug)) {
      setErr(`Slug contains unexpected characters: "${cleanSlug}"`);
      return;
    }

    const url = `/presentations/${encodeURIComponent(cleanSlug)}/slides.json`;
    // Debug log (browser console)
    console.log("[slides] raw:", slug, "clean:", cleanSlug, "→", url);

    (async () => {
      try {
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
        const data = (await res.json()) as SlideItem[];
        if (!Array.isArray(data)) throw new Error("slides.json did not return an array");
        setSlides(data);
        setReady(true);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        console.error("[slides] load error:", msg);
        setErr(msg);
      }
    })();
  }, [cleanSlug, slug]);

  // Build slides with unique DOM ids (recompute whenever slides change)
  const slidesWithIds = useMemo(() => makeUniqueIds(slides), [slides]);

  // Use these for the section nav (title + unique id)
  const sections = slidesWithIds.map((s) => ({ id: s.__domId, title: s.title }));

  return (
    <Container>
      {/* ⬇️ Tiny spacing tweak for mobile */}
      <div className="mb-4 md:mb-6 flex items-center justify-between">
        <h1 className="text-xl md:text-3xl font-semibold tracking-tight">Presentation</h1>
      </div>

      {err && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <div className="font-semibold mb-1">Could not load slides</div>
          <div>{err}</div>
          <div className="mt-2 text-red-600/80">
            Tip: open{" "}
            <code>/presentations/{cleanSlug || "your-slug"}/slides.json</code> directly in your
            browser to verify the file exists.
          </div>
        </div>
      )}

      {sections.length > 1 && <SectionNav sections={sections} />}

      <div className="mt-6 space-y-6">
        {ready &&
          slidesWithIds.map((s, idx) => (
            <motion.section
              key={s.__domId} // ✅ unique React key
              id={s.__domId}  // ✅ unique DOM id
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.35, delay: idx * 0.03 }}
              className="scroll-mt-24"
            >
              <Card>
                <h2 className="text-xl md:text-2xl font-semibold">{s.title}</h2>

                {s.type === "text" && (
                  <Prose className="mt-3 prose prose-zinc max-w-none">
                    <p>{s.md}</p>
                  </Prose>
                )}

                {s.type === "stats" && (() => {
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
                                <div className="mt-1 text-xs text-neutral-500">
                                  {kpi.footnote}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {s.type === "chart" && (
                  <div className="mt-4">
                    <ChartRouter name={(s as any).chart} args={(s as any).args} />
                  </div>
                )}

                {s.type === "video" && (
                  <div className="mt-4 aspect-video overflow-hidden rounded-xl">
                    <iframe
                      src={(s as any).src}
                      className="h-full w-full"
                      allow="autoplay; fullscreen; picture-in-picture"
                      loading="lazy"
                    />
                  </div>
                )}

                {s.type === "image" && (
                  <div className="mt-3">
                    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-soft">
                      <img
                        src={(s as any).src}
                        alt={s.title}
                        className="block h-auto w-full"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.alt = "Image not found";
                          e.currentTarget.src = "/presentations/placeholder-image.png";
                        }}
                      />
                    </div>
                    {(s as any).caption && (
                      <p className="mt-2 text-sm text-neutral-600">{(s as any).caption}</p>
                    )}
                  </div>
                )}

                {s.type === "profiles" && (
                  <div className="mt-3">
                    <ProfilesGrid people={(s as any).people} />
                  </div>
                )}

                {s.type === "download" && (
                  <div className="mt-4">
                    <DownloadButton href={(s as any).href} />
                  </div>
                )}
              </Card>
            </motion.section>
          ))}
      </div>
    </Container>
  );
}