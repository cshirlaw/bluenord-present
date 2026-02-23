import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  if (pathname === "/nov-2025-clean" || pathname.startsWith("/nov-2025-clean/")) {
    const url = req.nextUrl.clone();
    url.pathname = pathname.replace("/nov-2025-clean", "/2025-11");
    url.search = search;
    return NextResponse.redirect(url, 308);
  }

  if (
    pathname === "/presentations/nov-2025-clean/slides.json" ||
    pathname.startsWith("/presentations/nov-2025-clean/")
  ) {
    const url = req.nextUrl.clone();
    url.pathname = pathname.replace("/presentations/nov-2025-clean", "/presentations/2025-11");
    url.search = search;
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/nov-2025-clean/:path*", "/presentations/nov-2025-clean/:path*"],
};
