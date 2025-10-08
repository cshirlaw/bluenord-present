"use client";
import { useState } from "react";

export default function ProductionUpdate() {
  const [showMore, setShowMore] = useState(false);

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-soft">
      <h3 className="text-xl font-semibold text-brand mb-2">
        Preliminary Production – September 2025
      </h3>
      <p className="text-neutral-700 leading-relaxed">
        In <strong>September 2025</strong>, preliminary production was
        <strong> 41.2 mboepd net</strong> to BlueNord.
      </p>

      <div className="mt-3 space-y-2 text-sm text-neutral-700">
        <p>
          • <strong>Tyra hub:</strong> 22.0 mboepd – highest since restart,
          with stability improving and further reliability actions planned.
        </p>
        <p>
          • <strong>Base assets (Dan, Gorm, Halfdan):</strong> 19.2 mboepd.
          Gorm faced compressor and water injection issues; recovery expected soon.
        </p>
        <p>
          • <strong>Q3 2025 overview:</strong> Tyra averaged 18.9 mboepd (top of 17–19 guidance),
          base assets 20.2 mboepd (slightly below 21–23 guidance),
          overall DUC 39.1 mboepd within 38–42 mboepd guidance range.
        </p>
      </div>

      <button
        onClick={() => setShowMore(!showMore)}
        className="mt-4 text-sm text-brand underline hover:text-brand/80"
      >
        {showMore ? "Hide details" : "Read full release"}
      </button>

      {showMore && (
        <div className="mt-4 text-sm text-neutral-600 space-y-2 border-t pt-3">
          <p>
            Efforts to further enhance reliability and performance at Tyra are ongoing,
            with actions planned based on comprehensive studies completed by the operator.
          </p>
          <p>
            BlueNord expects TotalEnergies to address the key issues identified to
            enable stable plateau production during 2025.
          </p>
          <p>
            This information is subject to disclosure requirements pursuant to section
            5-12 of the Norwegian Securities Trading Act.
          </p>
        </div>
      )}

      {/* Optional: simple export/download button */}
      <div className="mt-5 text-right">
        <a
          href="/data/production-sep2025.pdf"
          download
          className="inline-flex items-center rounded-lg border border-brand px-3 py-1.5 text-sm font-medium text-brand hover:bg-brand hover:text-white transition-colors"
        >
          ⬇ Download summary PDF
        </a>
      </div>
    </div>
  );
}