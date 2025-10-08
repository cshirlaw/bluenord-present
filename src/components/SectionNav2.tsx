"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";

type SectionItem = { id: string; title: string; __domId: string };
type Group = { section: string; slides: SectionItem[] };

export default function SectionNav2({
  groups,
  activeDomId,
}: {
  groups: Group[];
  activeDomId?: string | null;
}) {
  const [activeSection, setActiveSection] = useState(groups[0]?.section ?? "General");

  const current = useMemo(
    () => groups.find(g => g.section === activeSection) ?? groups[0],
    [groups, activeSection]
  );

  return (
    <nav className="sticky top-14 z-30 space-y-2">
      {/* Top tabs (sections) */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-2 px-2">
        {groups.map((g) => (
          <button
            key={g.section}
            onClick={() => setActiveSection(g.section)}
            className={cn(
              "whitespace-nowrap rounded-full border px-3 py-1 text-sm transition",
              g.section === activeSection
                ? "border-sky-500 bg-sky-50 text-sky-700"
                : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
            )}
          >
            {g.section}
          </button>
        ))}
      </div>

      {/* Sub-pills (slides in section) */}
      {current && (
        <div className="flex flex-wrap gap-2">
          {current.slides.map((s) => (
            <a
              key={s.__domId}
              href={`#${s.__domId}`}
              className={cn(
                "rounded-full border px-3 py-1 text-sm transition",
                activeDomId === s.__domId
                  ? "border-sky-500 bg-sky-500 text-white shadow-sm"
                  : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
              )}
            >
              {s.title}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}