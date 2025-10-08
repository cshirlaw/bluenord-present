"use client";
import { useEffect, useState } from "react";
import Modal from "@/components/Modal";
import { motion } from "framer-motion";

export type Person = {
  name: string;
  title: string;
  photo: string;
  bio?: string;      // one-liner for card
  bioLong?: string;  // detailed bio for modal
};

export default function ProfilesGrid({ people }: { people: Person[] }) {
  const [active, setActive] = useState<Person | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setExpanded(false);
    setCopied(false);
  }, [active?.name]);

  const copyBio = async () => {
    if (!active) return;
    const text = active.bioLong || active.bio || "";
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    }
  };

  return (
    <>
      <div className="grid items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {people.map((p) => (
          <div
            key={p.name}
            className="group relative flex h-full flex-col rounded-2xl border border-zinc-200 bg-white p-5 transition-all duration-300 hover:-translate-y-0.5 focus-within:ring-2 focus-within:ring-brand/60"
          >
            <button
              type="button"
              className="absolute right-3 top-3 text-xs text-brand underline underline-offset-4"
              onClick={(e) => {
                e.stopPropagation();
                setActive(p);
                setExpanded(true);
              }}
              aria-label={`Open full bio for ${p.name}`}
            >
              Full bio
            </button>

            <motion.button
              type="button"
              onClick={() => setActive(p)}
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.25 }}
              className="w-full"
              aria-label={`Open bio for ${p.name}`}
            >
              <div className="aspect-square w-44 overflow-hidden rounded-full border border-zinc-100 ring-2 ring-brand/20">
                <img
                  src={p.photo}
                  alt={p.name}
                  className="h-full w-full object-cover object-top"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.alt = "Image not found";
                    e.currentTarget.src = "/presentations/placeholder-image.png";
                  }}
                />
              </div>
            </motion.button>

            <button
              type="button"
              onClick={() => setActive(p)}
              className="mt-4 text-left"
              aria-label={`Open bio for ${p.name}`}
            >
              <div className="text-base font-semibold">{p.name}</div>
              <div className="text-sm text-zinc-600">{p.title}</div>
              {p.bio && <p className="mt-2 text-sm text-zinc-600">{p.bio}</p>}
            </button>

            <div className="mt-auto" />
          </div>
        ))}
      </div>

      <Modal open={!!active} onClose={() => setActive(null)} title={active?.name}>
        {active && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 overflow-hidden rounded-full border border-zinc-100 ring-2 ring-brand/20">
                <img
                  src={active.photo}
                  alt={active.name}
                  className="h-full w-full object-cover object-top"
                />
              </div>
              <div>
                <div className="text-lg font-semibold">{active.name}</div>
                <div className="text-sm text-zinc-600">{active.title}</div>
              </div>
            </div>

            <div className="text-sm leading-relaxed text-zinc-700">
              {expanded
                ? <p>{active.bioLong || active.bio}</p>
                : (active.bio && <p>{active.bio}</p>)}
              {(active.bioLong && active.bioLong !== active.bio) && (
                <button
                  className="mt-2 text-sm underline underline-offset-4 text-brand"
                  onClick={() => setExpanded((x) => !x)}
                  aria-expanded={expanded}
                >
                  {expanded ? "Show less" : "Read more"}
                </button>
              )}
            </div>

            <div className="flex items-center justify-end gap-2">
              {(active.bioLong || active.bio) && (
                <button type="button" className="btn-ghost" onClick={copyBio}>
                  {copied ? "Copied ✓" : "Copy bio"}
                </button>
              )}
              <button className="btn-brand" onClick={() => setActive(null)}>Close</button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}