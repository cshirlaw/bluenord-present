import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import manifest from "./public/presentations/manifest.json";

type ManifestItem = { slug: string };

const BLOCKED = new Set(["nov-2025-clean"]);

function allowedSlugs(): Set<string> {
  const items = (manifest as ManifestItem[]) || [];
  return new Set(items.map((i) => i.slug).filter(Boolean));
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname.startsWith("/presentations/")
  ) {
    return NextResponse.next();
  }

  const m = pathname.match(/^\/([^/]+)\/?$/);
  if (!m) return NextResponse.next();

  const slug = decodeURIComponent(m[1] || "").trim();
  if (!slug) return NextResponse.next();
  if (BLOCKED.has(slug)) return NextResponse.next();

  const allowed = allowedSlugs();
  if (!allowed.has(slug)) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = `/presentations/${encodeURIComponent(slug)}`;
  return NextResponse.redirect(url, 308);
}

export const config = {
  matcher: ["/:slug", "/:slug/"],
};
