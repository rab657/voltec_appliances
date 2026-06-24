import { NextResponse } from "next/server";
import { ADMIN_COOKIE, adminPassword, authEnabled, sessionToken } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!authEnabled()) {
    return NextResponse.json({ ok: true, note: "auth disabled" });
  }
  let password = "";
  try {
    ({ password } = await req.json());
  } catch {
    /* ignore */
  }
  if (password !== adminPassword()) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, sessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
