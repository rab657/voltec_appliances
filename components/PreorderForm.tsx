"use client";

import { useState } from "react";
import { track } from "@/lib/analytics";
import { SITE } from "@/lib/site";
import { WhatsAppIcon } from "./icons";
import {
  PREORDER_BUYER_TYPES,
  PREORDER_RANGES,
  PREORDER_SIZE_UNSURE,
  preorderRange,
  type PreorderRangeId,
} from "@/lib/preorder";

// Pre-order form for the coming-soon solid-state range. It saves the request
// (so it is recorded even if the buyer never opens WhatsApp), fires `lead` with
// the buyer profile, then offers a one-tap WhatsApp message carrying the same
// details and the PRE- reference so the chat can be matched to the record.

const input: React.CSSProperties = {
  width: "100%",
  padding: "13px 14px",
  borderRadius: 10,
  border: "1px solid var(--rule-strong)",
  background: "#fff",
  fontSize: 16,
  fontFamily: "var(--font-ui)",
  color: "var(--ink)",
};
const label: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  color: "var(--ink-2)",
  marginBottom: 6,
  display: "block",
};
const chip = (on: boolean): React.CSSProperties => ({
  padding: "10px 14px",
  borderRadius: 999,
  border: `1px solid ${on ? "var(--ink)" : "var(--rule-strong)"}`,
  background: on ? "var(--ink)" : "#fff",
  color: on ? "#fff" : "var(--ink)",
  fontSize: 14,
  fontFamily: "var(--font-ui)",
  cursor: "pointer",
  textAlign: "left",
});

export default function PreorderForm({ defaultRange = "scr" }: { defaultRange?: PreorderRangeId }) {
  const [range, setRange] = useState<PreorderRangeId>(defaultRange);
  const [size, setSize] = useState("");
  const [qty, setQty] = useState(1);
  const [buyer, setBuyer] = useState("");
  const [form, setForm] = useState({ use: "", city: "", name: "", phone: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState<{ ref: string; product: string } | null>(null);

  const r = preorderRange(range)!;
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  function pickRange(id: PreorderRangeId) {
    setRange(id);
    setSize(""); // sizes differ per range
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!buyer) {
      setErr("Please choose who the stabilizer is for.");
      return;
    }
    setBusy(true);
    setErr("");
    try {
      const res = await fetch("/api/preorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ range, size: size || PREORDER_SIZE_UNSURE, qty, buyer, ...form }),
      });
      const d = await res.json();
      if (!res.ok || !d.ref) {
        setErr(
          d.error === "missing_fields"
            ? "Please add your name, city and a phone number we can reach you on."
            : "Something went wrong — please try again, or WhatsApp us.",
        );
        setBusy(false);
        return;
      }
      // No name or phone in analytics — only the shape of the demand.
      track("lead", {
        from: "preorder",
        product: d.product,
        range,
        size: size || "unsure",
        qty,
        buyer,
        city: form.city,
        ref: d.ref,
      });
      setDone({ ref: d.ref, product: d.product });
    } catch {
      setErr("Network error — please try again.");
      setBusy(false);
    }
  }

  if (done) {
    const text =
      `Hi Voltec! I pre-ordered on your website. Ref ${done.ref}.\n` +
      `${done.product}\n` +
      `Quantity: ${qty}\n` +
      `For: ${buyer}` +
      (form.use ? `\nWill protect: ${form.use}` : "") +
      `\nCity: ${form.city}\n` +
      `Please tell me the price and when it arrives.`;
    const href = `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}`;
    return (
      <div
        role="status"
        // The form is taller than this panel, so without this the page is left
        // showing whatever sat below the form and the confirmation is off-screen.
        ref={(el) => el?.scrollIntoView({ block: "center", behavior: "smooth" })}
        style={{ border: "1px solid var(--rule-strong)", borderRadius: 16, padding: "26px 24px", background: "#fff" }}
      >
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ink-3)" }}>
          Pre-order received
        </div>
        <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: 30, letterSpacing: "-0.01em", margin: "10px 0 8px" }}>
          You are on the list. Ref {done.ref}
        </h3>
        <p style={{ color: "var(--ink-2)", margin: "0 0 18px", maxWidth: "52ch" }}>
          We will contact you on {form.phone} when the stock lands, with the price and arrival date. Send
          the same details on WhatsApp now and you will hear from us there first.
        </p>
        <a
          href={href}
          target="_blank"
          rel="noopener"
          className="btn btn-wa"
          onClick={() => track("whatsapp_click", { from: "preorder-confirm", ref: done.ref, channel: "whatsapp" })}
        >
          <WhatsAppIcon /> <span>Send my pre-order on WhatsApp</span>
        </a>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      style={{ border: "1px solid var(--rule-strong)", borderRadius: 16, padding: "26px 24px", background: "#fff", display: "grid", gap: 20 }}
    >
      <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
        <legend style={label}>Which range?</legend>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {PREORDER_RANGES.map((o) => (
            <button key={o.id} type="button" aria-pressed={range === o.id} onClick={() => pickRange(o.id)} style={chip(range === o.id)}>
              {o.label}
              <span style={{ display: "block", fontSize: 12, opacity: 0.75 }}>{o.note}</span>
            </button>
          ))}
        </div>
      </fieldset>

      {r.sizes.length > 0 && (
        <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
          <legend style={label}>Which size?</legend>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {[...r.sizes, PREORDER_SIZE_UNSURE].map((s) => (
              <button key={s} type="button" aria-pressed={size === s} onClick={() => setSize(s)} style={chip(size === s)}>
                {s}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
        <legend style={label}>Who is it for?</legend>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {PREORDER_BUYER_TYPES.map((b) => (
            <button key={b} type="button" aria-pressed={buyer === b} onClick={() => setBuyer(b)} style={chip(buyer === b)}>
              {b}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="preorder-two" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
        <div>
          <label style={label} htmlFor="po-qty">How many units?</label>
          <input
            id="po-qty"
            style={input}
            type="number"
            inputMode="numeric"
            min={1}
            max={9999}
            value={qty}
            onChange={(e) => setQty(Math.max(1, Math.min(9999, parseInt(e.target.value, 10) || 1)))}
            required
          />
        </div>
        <div>
          <label style={label} htmlFor="po-city">City</label>
          <input id="po-city" style={input} value={form.city} onChange={set("city")} placeholder="Lahore, Peshawar, Karachi…" autoComplete="address-level2" required />
        </div>
      </div>

      <div>
        <label style={label} htmlFor="po-use">What will it protect? <span style={{ fontWeight: 400 }}>(optional)</span></label>
        <input id="po-use" style={input} value={form.use} onChange={set("use")} placeholder="e.g. laser machine, 2 inverter ACs, CNC, stock for my shop" maxLength={300} />
      </div>

      <div className="preorder-two" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
        <div>
          <label style={label} htmlFor="po-name">Your name</label>
          <input id="po-name" style={input} value={form.name} onChange={set("name")} autoComplete="name" required />
        </div>
        <div>
          <label style={label} htmlFor="po-phone">Phone / WhatsApp number</label>
          <input id="po-phone" style={input} type="tel" inputMode="tel" value={form.phone} onChange={set("phone")} placeholder="03xx xxxxxxx" autoComplete="tel" required />
        </div>
      </div>

      {err && (
        <p role="alert" style={{ color: "#a11", margin: 0, fontSize: 14 }}>
          {err}
        </p>
      )}

      <div>
        <button type="submit" className="btn btn-primary" disabled={busy} style={{ minWidth: 220 }}>
          {busy ? "Sending…" : "Place my pre-order"}
        </button>
        <p style={{ fontSize: 13, color: "var(--ink-3)", margin: "10px 0 0" }}>
          No payment now. We confirm the price and arrival date before you decide.
        </p>
      </div>
    </form>
  );
}
