import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, isValidSession, authEnabled } from "@/lib/admin-auth";

// Protect the CMS (/admin/**) and its API (/api/admin/**) behind the admin
// session cookie. The login routes themselves are always reachable.
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isLogin = pathname === "/admin/login" || pathname === "/api/admin/login";
  if (isLogin || !authEnabled()) return NextResponse.next();

  const ok = isValidSession(req.cookies.get(ADMIN_COOKIE)?.value);
  if (ok) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const url = req.nextUrl.clone();
  url.pathname = "/admin/login";
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
