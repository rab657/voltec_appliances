import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { acModel } from "@/lib/ac-products";

export const runtime = "nodejs";

// Creates a bank-transfer order for the AC line. Price is derived server-side
// from the catalog (never trusts a client-sent price). Returns the order ref.
export async function POST(req: Request) {
  try {
    const b = await req.json();
    const m = acModel(String(b.model || ""));
    if (!m) return NextResponse.json({ error: "invalid_model" }, { status: 400 });

    const qty = Math.max(1, Math.min(50, parseInt(String(b.qty ?? 1), 10) || 1));
    const name = String(b.name || "").trim();
    const phone = String(b.phone || "").trim();
    const address = String(b.address || "").trim();
    const city = String(b.city || "").trim();
    if (!name || !phone || !address || !city) {
      return NextResponse.json({ error: "missing_fields" }, { status: 400 });
    }

    const ref =
      "VLT-" +
      Date.now().toString(36).slice(-4).toUpperCase() +
      Math.random().toString(36).slice(2, 5).toUpperCase();
    const total = m.price * qty;

    const db = getSupabaseAdmin();
    if (!db) return NextResponse.json({ error: "unavailable" }, { status: 503 });

    const { error } = await db.from("orders").insert({
      order_ref: ref,
      model: m.code,
      product_name: m.name,
      unit_price: m.price,
      qty,
      total,
      customer_name: name,
      phone,
      address,
      city,
      status: "pending_payment",
    });
    if (error) return NextResponse.json({ error: "insert_failed" }, { status: 500 });

    return NextResponse.json({ ref, total });
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
}
