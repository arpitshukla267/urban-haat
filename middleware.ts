import { NextResponse, type NextRequest } from "next/server";

// A scanned ticket QR opens "/?t=UH-...". Send it straight to the verify page on the
// server, before the home page (and its booking form) is ever rendered.
export function middleware(req: NextRequest) {
  const t = req.nextUrl.searchParams.get("t");
  if (t) {
    const url = req.nextUrl.clone();
    url.pathname = "/verify";
    url.search = `?t=${encodeURIComponent(t)}`;
    url.hash = "";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

// Only run on the home page.
export const config = { matcher: "/" };
