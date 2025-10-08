import { ButtonLink } from "./ui";

export default function DownloadButton({ href, label = "Download official PDF" }: { href: string; label?: string }) {
  // Accept both absolute and /presentations/<slug>/<file>.pdf
  return (
    <div className="mt-4">
      <ButtonLink href={href} aria-label={label}>
        <span aria-hidden>⬇</span> {label}
      </ButtonLink>
    </div>
  );
}