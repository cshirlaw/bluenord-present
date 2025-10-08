"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/cn";

type Section = { id: string; title: string };

export default function SectionNav({
  sections,
  offset = 80,
}: {
  sections: Section[];
  offset?: number;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const lastY = useRef(0);

  const targets = useMemo(
    () =>
      sections
        .map((s) => document.getElementById(s.id))
        .filter((el): el is HTMLElement => !!el),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sections.map((s) => s.id).join("|")]
  );

  useEffect(() => {
    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible[0]?.target?.id) {
          setActiveId(visible[0].target.id);
        } else {
          const fromTop = window.scrollY + offset + 1;
          let current: string | null = null;
          for (const el of targets) {
            if (el.offsetTop <= fromTop) current = el.id;
          }
          if (current) setActiveId(current);
        }
      },
      { rootMargin: `-${offset}px 0px -60% 0px`, threshold: [0, 0.1, 0.5, 1] }
    );

    targets.forEach((el) => observer.observe(el));

    const seed = () => {
      const fromTop = window.scrollY + offset + 1;
      let current: string | null = null;
      for (const el of targets) {
        if (el.offsetTop <= fromTop) current = el.id;
      }
      if (current) setActiveId(current);
    };
    seed();

    return () => observer.disconnect();
  }, [targets, offset]);

  // add subtle shadow only after you scroll a bit
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 4);
      lastY.current = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const onJump = (id: string) => {
    setActiveId(id);
    const el = document.getElementById(id);
    if (el) {
      window.scrollTo({ top: el.offsetTop - (offset + 8), behavior: "smooth" });
    }
  };

  return (
    <nav
      className={cn(
        "sticky top-14 z-30 rounded-xl bg-white/90 backdrop-blur",
        "border border-neutral-200",
        "transition-shadow",
        scrolled ? "shadow-soft" : "shadow-none",
        "p-2"
      )}
      aria-label="Section navigation"
    >
      {/* Mobile: compact select */}
      <div className="sm:hidden">
        <label className="sr-only" htmlFor="section-select">Jump to</label>
        <select
          id="section-select"
          className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm"
          value={activeId || ""}
          onChange={(e) => onJump(e.target.value)}
        >
          <option value="" disabled>Jump to…</option>
          {sections.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title}
            </option>
          ))}
        </select>

        {/* Horizontal chips (scrollable) */}
        <div className="mt-2 -mx-2 overflow-x-auto pb-1">
          <ul className="flex min-w-full gap-2 px-2">
            {sections.map((s) => (
              <li key={s.id} className="shrink-0">
                <button
                  onClick={() => onJump(s.id)}
                  className={cn(
                    "whitespace-nowrap rounded-full border px-3 py-1.5 text-sm",
                    "transition-all duration-200",
                    activeId === s.id
                      ? "border-brand bg-brand text-white shadow-soft"
                      : "border-neutral-200 bg-white hover:-translate-y-0.5"
                  )}
                >
                  {s.title}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Desktop/tablet: pill row */}
      <div className="hidden sm:block">
        <ul className="flex flex-wrap gap-2">
          {sections.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className={cn(
                  "pill transition-all duration-300 ease-gentle",
                  activeId === s.id
                    ? "border-brand bg-brand text-white shadow-soft"
                    : "hover:-translate-y-0.5"
                )}
                onClick={(e) => {
                  e.preventDefault();
                  onJump(s.id);
                }}
              >
                {s.title}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}