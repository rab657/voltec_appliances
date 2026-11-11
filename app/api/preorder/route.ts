import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import {
  PREORDER_BUYER_TYPES,
  PREORDER_SIZE_UNSURE,
  isValidPreorderSize,
  preorderRange,
} from "@/lib/preorder";

export const runtime = "nodejs";

// Stores a pre-order for a line that is not in stock yet (SCR / IGBT).
//
// It reuses the `orders` table so pre-orders show up in the existing admin
// orders list with no schema change: status "preorder", a PRE- reference, zero
// price (prices are confirmed when the shipment lands), and the buyer profile
// in `address` (kind of buyer) and `notes` (what it will protect).
//
// Nothing is charged and nothing is promised here — it is a reservation and a
// record of demand.
const clean = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max);

export async function POST(req: Request) {
  try {
    const b = await req.json();

    const range = preorderRange(clean(b.range, 20));
    if (!range) return NextResponse.json({ error: "invalid_range" }, { status: 400 });

    const size =
      range.id === "unsure" ? PREORDER_SIZE_UNSURE : clean(b.size, 40) || PREORDER_SIZE_UNSURE;
    if (!isValidPreorderSize(range.id, size)) {
      return NextResponse.json({ error: "invalid_size" }, { status: 400 });
    }

    const buyer = clean(b.buyer, 40);
    if (!(PREORDER_BUYER_TYPES as readonly string[]).includes(buyer)) {
      return NextResponse.json({ error: "invalid_buyer" }, { status: 400 });
    }

    const qty = Math.max(1, Math.min(9999, parseInt(String(b.qty ?? 1), 10) || 1));
    const name = clean(b.name, 80);
    const phone = clean(b.phone, 30);
    const city = clean(b.city, 60);
    const use = clean(b.use, 300);
    // A phone number we can actually call back: at least 7 digits.
    if (!name || !city || phone.replace(/\D/g, "").length < 7) {
      return NextResponse.json({ error: "missing_fields" }, { status: 400 });
    }

    const ref =
      "PRE-" +
      Date.now().toString(36).slice(-4).toUpperCase() +
      Math.random().toString(36).slice(2, 5).toUpperCase();

    const sizeLabel = size === PREORDER_SIZE_UNSURE ? "size to be advised" : size;
    const productName =
      range.id === "unsure"
        ? "Solid-state stabilizer (SCR or IGBT) — pre-order"
        : `${range.label} stabilizer — ${sizeLabel} — pre-order`;

    const db = getSupabaseAdmin();
    if (!db) return NextResponse.json({ error: "unavailable" }, { status: 503 });

    const { error } = await db.from("orders").insert({
      order_ref: ref,
      model: `PRE-${range.id.toUpperCase()}`,
      product_name: productName,
      unit_price: 0,
      qty,
      total: 0,
      customer_name: name,
      phone,
      address: `Buyer: ${buyer}`,
      city,
      status: "preorder",
      notes: use ? `Will protect: ${use}` : null,
    });
    if (error) return NextResponse.json({ error: "insert_failed" }, { status: 500 });

    return NextResponse.json({ ref, product: productName });
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
}
