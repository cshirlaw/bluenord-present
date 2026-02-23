import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  if (pathname === "/nov-2025-clean" || pathname.startsWith("/nov-2025-clean/")) {
    return NextResponse.next();
  }

  const m = pathname.match(/^\/([a-z0-9][a-z0-9._-]*)\/?$/i);
  const slug = m?.[1];

  if (!slug) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = `/presentations/${slug}`;
  url.search = search;
  return NextResponse.redirect(url, 308);
}

export const config = {
  matcher: ["/:slug", "/:slug/"],
};
