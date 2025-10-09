// components/SectionNav2.tsx
"use client";

import { useMemo } from "react";
import { cn } from "@/lib/cn";

type SectionItem = { id: string; title: string; __domId: string };
type Group = { section: string; slides: SectionItem[] };

export default function SectionNav2({
  groups,
  activeSection,
  onSectionChange,
  activeDomId,
}: {
  groups: Group[];
  activeSection: string;
  onSectionChange: (section: string) => void;
  activeDomId?: string | null;
}) {
  const current = useMemo(
    () => groups.find((g) => g.section === activeSection) ?? groups[0],
    [groups, activeSection]
  );

  return (
    <nav className="sticky top-14 z-30 space-y-3">
      {/* ====== TOP: SECTION TABS (distinct shape/style) ====== */}
      <div
        role="tablist"
        aria-label="Sections"
        className="relative -mx-2 flex gap-2 overflow-x-auto px-2 pb-1 no-scrollbar"
      >
        {/* subtle container bg to visually separate from slide chips */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 top-0 bg-neutral-50/60" />

        <div className="relative flex gap-2">
          {groups.map((g) => {
            const active = g.section === activeSection;
            return (
              <button
                key={g.section}
                role="tab"
                aria-selected={active}
                onClick={() => onSectionChange(g.section)}
                className={cn(
                  // different shape: not fully rounded, chunkier, bigger text
                  "relative whitespace-nowrap rounded-xl border px-4 py-2 text-sm font-medium transition",
                  "shadow-soft",
                  active
                    ? "border-sky-600 bg-sky-600 text-white"
                    : "border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50"
                )}
              >
                {g.section}

                {/* active underline indicator for extra affordance */}
                {active && (
                  <span className="absolute -bottom-1 left-1/2 h-1 w-10 -translate-x-1/2 rounded-full bg-sky-600" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ====== BOTTOM: SLIDE CHIPS (smaller rounded pills) ====== */}
      {current && (
        <div
          aria-label={`${current.section} slides`}
          className="flex flex-wrap gap-2"
        >
          {current.slides.map((s) => {
            const active = activeDomId === s.__domId;
            return (
              <a
                key={s.__domId}
                href={`#${s.__domId}`}
                className={cn(
                  // keep these as compact, fully rounded pills to contrast with tabs
                  "rounded-full border px-3 py-1 text-[13px] transition",
                  active
                    ? "border-sky-500 bg-sky-500 text-white shadow-sm"
                    : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
                )}
              >
                {s.title}
              </a>
            );
          })}
        </div>
      )}
    </nav>
  );
}