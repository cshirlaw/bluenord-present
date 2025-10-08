"use client";

function Check() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="h-4 w-4">
      <path
        d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 9.7A1 1 0 1 1 4.7 8.3l2.6 2.6 6.8-6.8a1 1 0 0 1 1.4 0z"
        fill="currentColor"
      />
    </svg>
  );
}

type Props = {
  /** optional id of the row to highlight, e.g. "transformational" or "hedged-flexible" */
  highlight?: string;
};

export default function ValueProposition({ highlight }: Props) {
  // give each row a stable id we can target with `highlight`
  const nearTerm = [
    { id: "robust-base",      label: "Robust Base Production" },
    { id: "transformational", label: "Transformational Growth" },
    { id: "hedged-flexible",  label: "Volumes Hedged & Flexible Low-Cost Base" },
    { id: "tax-losses",       label: "Substantial Tax Losses" }
  ];

  const longTerm = [
    { id: "regime",    label: "Supportive Regulatory Regime" },
    { id: "accretive", label: "Accretive Investment Projects" },
    { id: "stable",    label: "Stable Production Outlook" },
    { id: "capital",   label: "Fit-for-Purpose Capital Structure" }
  ];

  const Row = ({ id, children }: { id: string; children: React.ReactNode }) => {
    const active = highlight === id;
    return (
      <li
        className={[
          "flex items-start gap-3 rounded-lg px-3 py-2 transition",
          active ? "ring-2 ring-rose-300 bg-rose-50" : ""
        ].join(" ")}
      >
        <span
          className={
            "mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full " +
            (active ? "bg-rose-200 text-rose-700" : "bg-neutral-100 text-brand")
          }
        >
          <Check />
        </span>
        <span className={active ? "font-medium text-rose-800" : undefined}>{children}</span>
      </li>
    );
  };

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-soft">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: headline + two core priorities */}
        <div className="rounded-xl bg-brand/5 p-5">
          <h3 className="text-xl font-semibold tracking-tight">Our Value Proposition</h3>
          <p className="mt-2 text-sm text-neutral-700">
            Clear and simple focus on leveraging the strength of our underlying business to:
          </p>

          <ul className="mt-4 space-y-3">
            <li className="flex items-start gap-3">
              <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-md bg-brand/10 text-brand">
                <Check />
              </span>
              <span className="text-brand font-medium">Maximise Distributions</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-md bg-brand/10 text-brand">
                <Check />
              </span>
              <span className="text-brand font-medium">Maintain a Conservative Capital Structure</span>
            </li>
          </ul>
        </div>

        {/* Middle: Near-term */}
        <div className="rounded-xl border border-neutral-200 p-5">
          <div className="mb-3 text-sm font-semibold text-brand">
            Near-Term | Strongly Cash Generative
          </div>
          <ul className="space-y-2">
            {nearTerm.map((t) => (
              <Row key={t.id} id={t.id}>{t.label}</Row>
            ))}
          </ul>
          <div className="mt-3 text-xs text-neutral-600">
            Distribution policy: <span className="font-medium">50–70% of operating cash flow</span>
          </div>
        </div>

        {/* Right: Long-term */}
        <div className="rounded-xl border border-neutral-200 p-5">
          <div className="mb-3 text-sm font-semibold text-brand">
            Long-Term | Positive Outlook for Value Creation
          </div>
          <ul className="space-y-2">
            {longTerm.map((t) => (
              <Row key={t.id} id={t.id}>{t.label}</Row>
            ))}
          </ul>
          <div className="mt-3 text-xs text-neutral-600">
            Desire to maintain meaningful returns in <span className="font-medium">2027+</span>
          </div>
        </div>
      </div>
    </div>
  );
}