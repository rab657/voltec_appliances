"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AC_MODELS, acModel, fmtPKR } from "@/lib/ac-products";
import { track } from "@/lib/analytics";

function CheckoutInner() {
  const sp = useSearchParams();
  const router = useRouter();
  const initial = acModel(sp.get("model") || "") ? (sp.get("model") as string) : "R3";
  const [code, setCode] = useState(initial);
  const [qty, setQty] = useState(1);
  // Lahore-only for now (walk-in pivot 2026-07): city is fixed, delivery within
  // Lahore or pickup at the Abid Market showroom.
  const [form, setForm] = useState({ name: "", phone: "", address: "", city: "Lahore" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const m = acModel(code)!;
  const total = m.price * qty;

  // Fire InitiateCheckout when the model in view changes.
  useEffect(() => {
    track("begin_checkout", { content_ids: [code], content_name: m.name, value: m.price * qty, currency: "PKR" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: code, qty, ...form }),
      });
      const d = await res.json();
      if (!res.ok || !d.ref) {
        setErr(d.error === "missing_fields" ? "Please fill all fields." : "Something went wrong — please try again or WhatsApp us.");
        setBusy(false);
        return;
      }
      track("purchase", { content_ids: [code], content_name: m.name, value: total, currency: "PKR", transaction_id: d.ref, num_items: qty });
      router.push(`/order/${d.ref}`);
    } catch {
      setErr("Network error — please try again.");
      setBusy(false);
    }
  }

  const input: React.CSSProperties = {
    width: "100%", padding: "13px 14px", borderRadius: 10, border: "1px solid var(--rule-strong)",
    background: "#fff", fontSize: 16, fontFamily: "var(--font-ui)", color: "var(--ink)",
  };
  const label: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: "var(--ink-2)", marginBottom: 6, display: "block" };

  return (
    <section className="page-head">
      <div className="container">
        <div className="crumbs">
          <Link href="/">Home</Link> <span>/</span> <Link href="/ac">AC Stabilizers</Link> <span>/</span> <span>Checkout</span>
        </div>
        <h1 style={{ marginBottom: 6 }}>Checkout</h1>
        <p className="page-lede" style={{ maxWidth: "52ch", marginBottom: 28 }}>
          Order now, pay by bank transfer, share your receipt on WhatsApp — we confirm and deliver in Lahore.
        </p>

        <div className="checkout-grid">
          {/* Form */}
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <span style={label}>Model</span>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {AC_MODELS.map((mm) => (
                  <button key={mm.code} type="button" onClick={() => setCode(mm.code)}
                    style={{
                      padding: "10px 16px", borderRadius: 999, cursor: "pointer", fontWeight: 700, fontSize: 15,
                      border: code === mm.code ? "2px solid var(--accent)" : "1px solid var(--rule-strong)",
                      background: code === mm.code ? "var(--accent-soft)" : "#fff", color: "var(--ink)",
                    }}>
                    {mm.code} · from {mm.fromV}
                  </button>
                ))}
              </div>
            </div>
            <div className="checkout-two">
              <div><span style={label}>Full name</span><input style={input} required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" /></div>
              <div><span style={label}>Phone / WhatsApp</span><input style={input} required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="03xx xxxxxxx" inputMode="tel" /></div>
            </div>
            <div><span style={label}>Delivery address (Lahore)</span><textarea style={{ ...input, minHeight: 74, resize: "vertical" }} required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="House, street, area — Lahore" /></div>
            <div>
              <span style={label}>City</span>
              <input style={{ ...input, background: "var(--paper-2)", color: "var(--ink-2)" }} value="Lahore" readOnly aria-readonly="true" />
              <p style={{ fontSize: 12.5, color: "var(--ink-3)", margin: "6px 0 0" }}>
                We currently deliver within Lahore only — or pick up at our Abid Market showroom (10am–8pm).
              </p>
            </div>
            <div>
              <span style={label}>Quantity</span>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} style={{ width: 40, height: 40, borderRadius: 10, border: "1px solid var(--rule-strong)", background: "#fff", fontSize: 20, cursor: "pointer" }}>−</button>
                <span style={{ fontSize: 18, fontWeight: 700, minWidth: 28, textAlign: "center" }}>{qty}</span>
                <button type="button" onClick={() => setQty((q) => Math.min(50, q + 1))} style={{ width: 40, height: 40, borderRadius: 10, border: "1px solid var(--rule-strong)", background: "#fff", fontSize: 20, cursor: "pointer" }}>+</button>
              </div>
            </div>
            {err && <p style={{ color: "var(--warn)", fontWeight: 600, fontSize: 14 }}>{err}</p>}
            <div style={{ display: "flex", gap: "6px 16px", flexWrap: "wrap", fontSize: 13, fontWeight: 600, color: "var(--ink-2)" }}>
              <span>✓ 1-year warranty</span>
              <span>✓ Trusted since 1995</span>
              <span>✓ We confirm on WhatsApp before you pay</span>
            </div>
            <button type="submit" disabled={busy} className="btn btn-primary" style={{ marginTop: 4, justifyContent: "center", fontSize: 17, padding: "15px 20px", opacity: busy ? 0.6 : 1 }}>
              {busy ? "Placing order…" : `Place order — ${fmtPKR(total)}`}
            </button>
            <p style={{ fontSize: 12.5, color: "var(--ink-3)" }}>No online payment now — you'll get our bank details next and confirm on WhatsApp before transferring.</p>
          </form>

          {/* Summary */}
          <aside className="checkout-aside">
            <div style={{ fontFamily: "var(--font-display)", fontSize: 24 }}>{m.name}</div>
            <div className="mono" style={{ fontSize: 12, color: "var(--accent-deep)", letterSpacing: "0.04em", marginTop: 4 }}>WORKS FROM {m.fromV} · {m.fits}</div>
            <ul style={{ listStyle: "none", padding: 0, margin: "16px 0", display: "flex", flexDirection: "column", gap: 7, fontSize: 14, color: "var(--ink-2)" }}>
              <li>✓ 10,000W · 99% pure copper</li>
              <li>✓ Energy saver · 1-year warranty</li>
              <li>✓ Lahore delivery · or showroom pickup</li>
            </ul>
            <div style={{ borderTop: "1px solid var(--rule)", paddingTop: 14, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ color: "var(--ink-2)" }}>{qty} × {fmtPKR(m.price)}</span>
              <span style={{ fontFamily: "var(--font-display)", fontSize: 28 }}>{fmtPKR(total)}</span>
            </div>
            <p style={{ fontSize: 12.5, color: "var(--ink-3)", marginTop: 8 }}>+ delivery — charged separately by city, confirmed on WhatsApp.</p>
          </aside>
        </div>
      </div>
    </section>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutInner />
    </Suspense>
  );
}
