@import "tailwindcss";

/* ===== Design tokens ===== */
:root {
  /* Base colours */
  --background: #ffffff;
  --foreground: #171717;

  /* Brand (Present) */
  --brand: #16A34A;   /* accent */
  --brand-fg: #0B6A2F;
  --brand-bg: #F0FDF4;

  /* Layout rhythm */
  --rhythm: 0.6rem;
}

@theme inline {
  /* Map CSS vars to Tailwind tokens (v4) */
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-brand: var(--brand);
  --color-brand-fg: var(--brand-fg);
  --color-brand-bg: var(--brand-bg);

  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

/* Dark scheme */
@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}

/* ===== Global resets & behaviours ===== */
html { scroll-behavior: smooth; }

body {
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-sans), ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji";
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Links & focus */
a {
  text-decoration-thickness: 2px;
  text-underline-offset: 2px;
  text-decoration-color: color-mix(in oklab, var(--brand) 30%, transparent);
}
a:hover { text-decoration-color: var(--brand); }
:focus-visible {
  outline: 2px solid var(--brand);
  outline-offset: 3px;
}

/* ===== Helpers for Step D ===== */

/* Lightweight prose */
.prose-lite h1 { @apply text-3xl md:text-4xl font-semibold tracking-tight; }
.prose-lite h2 { @apply text-2xl md:text-3xl font-semibold mt-8; }
.prose-lite h3 { @apply text-xl md:text-2xl font-semibold mt-6; }
.prose-lite p  { @apply leading-7 mt-4; }
.prose-lite ul { @apply mt-4 list-disc pl-5 space-y-2; }
.prose-lite ol { @apply mt-4 list-decimal pl-5 space-y-2; }

/* Card */
.card {
  @apply rounded-2xl bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05),0_8px_24px_rgba(0,0,0,0.08)] transition-shadow;
}
.card:hover {
  @apply shadow-[0_6px_20px_rgba(0,0,0,0.12)];
}

/* Subtle brand top stripe (if you add a div.h-1.bg-brand) */
.bg-brand    { background-color: var(--brand); }
.text-brand  { color: var(--brand); }
.bg-brand-bg { background-color: var(--brand-bg); }
.text-brand-fg { color: var(--brand-fg); }

/* Utility: section anchor offset for sticky navs (use with class "scroll-mt-24" on sections) */
.scroll-mt-24 { scroll-margin-top: 6rem; }