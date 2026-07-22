import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "dev-secret"
);
const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/manifest.json",
  "/sw.js",
  // SEO surfaces — crawlers don't hold sessions.
  "/robots.txt",
  "/sitemap.xml",
  "/opengraph-image",
  // Generated favicon routes (also covers /icons/* and /apple-icon).
  "/icon",
  "/apple-icon",
  // Public trust & compliance pages — must be reachable without a session.
  "/privacy",
  "/terms",
  "/data",
  "/security",
  "/support",
];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    pathname === "/" || // public marketing page
    PUBLIC_PATHS.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith("/api/auth") ||
    // Yoco calls this server-to-server; authenticity is HMAC-verified in the route.
    pathname === "/api/billing/webhook" ||
    // Hardware sensors push readings here; authenticated by API key in the route.
    pathname === "/api/ingest" ||
    pathname.startsWith("/icons")
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get("kg_session")?.value;
  let authed = false;
  if (token) {
    try {
      await jwtVerify(token, SECRET);
      authed = true;
    } catch {
      authed = false;
    }
  }

  if (!authed) {
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
