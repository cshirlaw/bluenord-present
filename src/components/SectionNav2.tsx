"use client";

import { useMemo } from "react";
import { cn } from "@/lib/cn";

type SectionItem = { id: string; title: string; __domId: string };
type Group = { section: string; slides: SectionItem[] };

export default function SectionNav2({
  groups,
  activeDomId,
  activeSection,
  onSectionChange,
}: {
  groups: Group[];
  activeDomId?: string | null;
  activeSection: string;
  onSectionChange: (section: string) => void;
}) {
  const current = useMemo(
    () => groups.find((g) => g.section === activeSection) ?? groups[0],
    [groups, activeSection]
  );

  return (
    <nav className="sticky top-14 z-30 space-y-2">
      {/* Top tabs (sections) */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-2 px-2">
        {groups.map((g) => {
          const isActive = g.section === activeSection;
          return (
            <button
              key={g.section}
              onClick={() => onSectionChange(g.section)}
              className={cn(
                "whitespace-nowrap rounded-full border px-3 py-1 text-sm transition",
                isActive
                  ? "border-sky-500 bg-sky-50 text-sky-700"
                  : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
              )}
            >
              {g.section}
              <span
                className={cn(
                  "ml-2",
                  isActive ? "text-sky-700/70" : "text-neutral-500"
                )}
              >
                {g.slides.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Sub-pills (slides in the active section) */}
      {current && (
        <div className="flex flex-wrap gap-2">
          {current.slides.map((s) => {
            const isActive = activeDomId === s.__domId;
            return (
              <a
                key={s.__domId}
                href={`#${s.__domId}`}
                className={cn(
                  "rounded-full border px-3 py-1 text-sm transition",
                  isActive
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