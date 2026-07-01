import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, authEnabled, isValidSession } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED = new Set(["pending_payment", "paid", "shipped", "cancelled"]);

// Orders hold customer PII, so this FAILS CLOSED: if no ADMIN_PASSWORD is
// configured, access is denied (unlike the blog admin, which is open by default).
async function authed(): Promise<boolean> {
  if (!authEnabled()) return false;
  const c = await cookies();
  return isValidSession(c.get(ADMIN_COOKIE)?.value);
}

// List orders (newest first). Orders contain customer PII — always auth-gated.
export async function GET() {
  if (!(await authed())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ error: "unavailable" }, { status: 503 });
  const { data, error } = await db
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) return NextResponse.json({ error: "query_failed" }, { status: 500 });
  return NextResponse.json({ orders: data || [] });
}

// Update an order's status (mark paid / shipped / cancelled).
export async function PATCH(req: Request) {
  if (!(await authed())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ error: "unavailable" }, { status: 503 });
  try {
    const { ref, status } = await req.json();
    if (!ref || !ALLOWED.has(status)) return NextResponse.json({ error: "bad_request" }, { status: 400 });
    const { error } = await db.from("orders").update({ status }).eq("order_ref", ref);
    if (error) return NextResponse.json({ error: "update_failed" }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
}
