import Link from "next/link";
import type { Metadata } from "next";
import { getSupabaseAdmin } from "@/lib/supabase";
import { SITE } from "@/lib/site";
import { fmtPKR } from "@/lib/ac-products";
import { WhatsAppIcon } from "@/components/icons";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false, follow: false }, title: "Your order — Voltec" };

type Order = {
  order_ref: string; model: string; product_name: string; qty: number;
  unit_price: number; total: number; customer_name: string; city: string; status: string;
};

export default async function OrderPage({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  const db = getSupabaseAdmin();
  let order: Order | null = null;
  if (db) {
    const { data } = await db.from("orders").select("*").eq("order_ref", ref).maybeSingle();
    order = (data as Order) || null;
  }

  if (!order) {
    return (
      <section className="page-head"><div className="container">
        <h1>Order not found</h1>
        <p className="page-lede">We couldn&apos;t find order <strong>{ref}</strong>. Please check the link or <Link href="/ac">start again</Link>.</p>
      </div></section>
    );
  }

  const b = SITE.bank;
  const wa =
    `https://wa.me/${SITE.whatsapp}?text=` +
    encodeURIComponent(
      `Assalam o Alaikum Voltec! Mera order ${order.order_ref} — ${order.qty} × ${order.model} (${order.product_name}), product total ${fmtPKR(order.total)}. ${order.city} ke liye delivery charge confirm kar dein. Phir transfer karke receipt bhejta/bhejti hoon.`,
    );

  const row: React.CSSProperties = { display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid var(--rule)" };

  return (
    <section className="page-head"><div className="container" style={{ maxWidth: 720 }}>
      <div className="mono" style={{ color: "var(--ok)", letterSpacing: "0.08em", fontSize: 13 }}>✓ ORDER PLACED</div>
      <h1 style={{ marginTop: 6 }}>Thank you — order {order.order_ref}</h1>
      <p className="page-lede" style={{ maxWidth: "56ch" }}>
        Almost done. Message us on WhatsApp to confirm your delivery charge &amp; final total, then transfer to the account below and share your receipt — we dispatch same day.
      </p>

      {/* Order summary */}
      <div style={{ border: "1px solid var(--rule-strong)", borderRadius: 14, padding: "18px 20px", background: "#fff", marginTop: 22 }}>
        <div style={row}><span style={{ color: "var(--ink-2)" }}>Item</span><strong>{order.qty} × {order.product_name}</strong></div>
        <div style={row}><span style={{ color: "var(--ink-2)" }}>Deliver to</span><span>{order.customer_name}, {order.city}</span></div>
        <div style={{ ...row, borderBottom: "none", paddingTop: 12 }}><span style={{ color: "var(--ink-2)" }}>Product total</span><span style={{ fontFamily: "var(--font-display)", fontSize: 26 }}>{fmtPKR(order.total)}</span></div>
        <p style={{ fontSize: 13, color: "var(--ink-3)", margin: "6px 0 0" }}>+ Delivery to {order.city} — charged separately. We&apos;ll confirm it on WhatsApp before you transfer.</p>
      </div>

      {/* Bank details */}
      <div style={{ border: "2px solid var(--accent)", borderRadius: 14, padding: "18px 20px", background: "var(--accent-soft)", marginTop: 16 }}>
        <div style={{ fontWeight: 800, marginBottom: 10 }}>1 · Bank transfer</div>
        <div style={row}><span style={{ color: "var(--ink-2)" }}>Bank</span><strong>{b.bankName}</strong></div>
        <div style={row}><span style={{ color: "var(--ink-2)" }}>Branch</span><strong>{b.branch}</strong></div>
        <div style={row}><span style={{ color: "var(--ink-2)" }}>Account title</span><strong>{b.accountTitle}</strong></div>
        <div style={row}><span style={{ color: "var(--ink-2)" }}>Account #</span><strong className="mono">{b.accountNumber}</strong></div>
        <div style={{ ...row, borderBottom: "none" }}><span style={{ color: "var(--ink-2)" }}>IBAN</span><strong className="mono">{b.iban}</strong></div>
      </div>

      {/* WhatsApp receipt */}
      <div style={{ marginTop: 20 }}>
        <div style={{ fontWeight: 800, marginBottom: 10 }}>2 · Confirm delivery &amp; send receipt</div>
        <a href={wa} target="_blank" rel="noopener" className="btn btn-wa" style={{ fontSize: 17, padding: "15px 24px" }}>
          <WhatsAppIcon /> <span>Send receipt on WhatsApp</span>
        </a>
        <p style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 10 }}>
          Order <strong>{order.order_ref}</strong> is already filled in — just attach your transfer screenshot. We verify and ship. 📦
        </p>
      </div>

      {/* Showroom pickup — Lahore walk-in option */}
      <div style={{ border: "1px solid var(--rule-strong)", borderRadius: 14, padding: "16px 20px", background: "#fff", marginTop: 20, display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontWeight: 800 }}>Prefer to pick it up?</div>
          <p style={{ fontSize: 14, color: "var(--ink-2)", margin: "4px 0 0" }}>
            Visit our showroom — 8-C Abid Market, Temple Road, Lahore · Mon–Sat 10am–8pm.
            See it working before you take it home.
          </p>
        </div>
        <a
          href="https://maps.google.com/?q=Voltec%20Appliances%20Lahore"
          target="_blank"
          rel="noopener"
          className="btn btn-ghost"
        >
          Get directions →
        </a>
      </div>
    </div></section>
  );
}
