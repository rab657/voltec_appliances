import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import PreorderForm from "@/components/PreorderForm";
import { absUrl } from "@/lib/site";
import { getT } from "@/lib/i18n-server";

// Pre-order page for the solid-state (SCR + IGBT) stabilizers.
//
// Owner, 2026-11-11: these lines are COMING SOON — the SCR range is on its way
// and arrives first, IGBT follows. Neither is in stock, so this page never says
// "buy" or "in stock"; it takes a pre-order and records who wants what (range,
// size, quantity, kind of buyer, city). Awareness only — no ad spend points here.
//
// Specs are the data-sheet numbers (lib/products.ts): SCR ±5%, ~20 ms, 95–250V;
// IGBT ±2%, 0 ms rated, 90–310V, pure sine. SCR is never "stepless" or "pure sine".
// No prices: they are confirmed when the shipment lands.

const RANGES: { name: string; tag: string; points: string[] }[] = [
  {
    name: "SCR (thyristor) stabilizer",
    tag: "Arriving first",
    points: [
      "1, 2, 3, 5 and 10 kVA, single-phase",
      "Holds 220V ±5% from a 95–250V input",
      "Corrects in about 20 ms — no motor, no carbon brush",
      "For laser machines, clinic devices, electronics, shops and homes",
    ],
  },
  {
    name: "IGBT (inverter) stabilizer",
    tag: "Follows the SCR range",
    points: [
      "550 VA, 2, 5, 10, 15 and 20 kVA, single-phase",
      "Holds 220V ±2% from a 90–310V input",
      "0 ms rated response, pure sine output",
      "For your most sensitive equipment, and areas with very low voltage",
    ],
  },
];

const FAQS: { q: string; a: string }[] = [
  {
    q: "When will Voltec's SCR and IGBT stabilizers be available?",
    a: "They are coming soon. The SCR range is on its way to Lahore and arrives first; the IGBT range follows. We do not publish a date until the stock has landed. Pre-order and we contact you the day it does.",
  },
  {
    q: "Do I pay anything to pre-order?",
    a: "No. The form takes no payment. It reserves your place and tells us what you need. We confirm the price and arrival date with you first, and you decide then.",
  },
  {
    q: "What is the price of an SCR or IGBT stabilizer?",
    a: "Prices are confirmed when the shipment lands. Pre-order with your size and quantity and you receive the price before anyone else.",
  },
  {
    q: "Can dealers and resellers pre-order in quantity?",
    a: "Yes. Choose \"Dealer or reseller\" and enter your quantity. Voltec dealer terms start at 10 pieces, and the dealer price is shared on WhatsApp.",
  },
  {
    q: "SCR or IGBT — which one should I pre-order?",
    a: "SCR is solid-state at a lower price: 220V ±5%, about 20 ms, for lasers, clinic devices, electronics, shops and homes. IGBT is the top of the range: 220V ±2%, 0 ms rated, pure sine, and it works from 90V. If you are not sure, choose \"Not sure yet\" and tell us what you want to protect.",
  },
  {
    q: "I need a stabilizer now. What can I buy today?",
    a: "Our servo (SVC) stabilizers from 1 to 30 kVA, the AVR relay stabilizers for a single AC or fridge, and three-phase industrial systems are available now. Send us your load on WhatsApp and we will size the right one.",
  },
];

export const metadata: Metadata = {
  title: "SCR & IGBT Solid-State Stabilizers — Coming Soon, Pre-order",
  description:
    "Voltec's solid-state stabilizers are coming soon to Pakistan: SCR (1–10 kVA) arrives first, IGBT (550 VA–20 kVA) follows. No motor, no carbon brush. Pre-order now — no payment — and hear first when stock lands in Lahore.",
  alternates: { canonical: "/pre-order" },
  openGraph: {
    type: "website",
    title: "SCR & IGBT Solid-State Stabilizers — Coming Soon | Voltec",
    description:
      "No motor, no carbon brush. The SCR range arrives first, IGBT follows. Pre-order now, no payment, and hear first when stock lands.",
    url: absUrl("/pre-order"),
  },
};

export default async function PreorderPage() {
  const t = await getT();

  return (
    <main>
      <JsonLd
        id="ld-preorder-faq"
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQS.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }}
      />

      {/* ===== Hero ===== */}
      <section className="page-head">
        <div className="container">
          <div className="crumbs">
            <Link href="/">{t("nav.home")}</Link> <span>/</span> <span>Pre-order</span>
          </div>
          <div className="med-eyebrow">Coming soon · Pre-order open</div>
          <h1>SCR &amp; IGBT solid-state stabilizers are coming soon.</h1>
          <p className="page-lede" style={{ maxWidth: "62ch" }}>
            No motor. No carbon brush. Nothing that wears each time the voltage is corrected. Our SCR
            range is on its way to Lahore and the IGBT range follows. Pre-order now and you hear first
            when the stock lands.
          </p>
          <p style={{ marginTop: 14, fontSize: 14, color: "var(--ink-2)" }}>
            <strong>No payment now.</strong> We confirm the price and arrival date before you decide.{" "}
            <a href="#preorder-form">Go to the form ↓</a>
          </p>
        </div>
      </section>

      {/* ===== The two ranges ===== */}
      <section className="section hairline-top">
        <div className="container">
          <div className="med-narrow" style={{ marginBottom: 32 }}>
            <h2 className="med-h2">Two ranges, both solid-state</h2>
            <p className="med-body">
              A servo stabilizer moves a brush with a motor to correct the voltage. A solid-state
              stabilizer does it with silicon switches, so it reacts faster and has nothing to wear in
              the correction path. Both ranges are imported.
            </p>
          </div>
          <div className="med-vs">
            {RANGES.map((r) => (
              <div className="med-vs-card is-win" key={r.name}>
                <div className="med-vs-tag">{r.tag}</div>
                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: 24, margin: "0 0 14px", letterSpacing: "-0.01em" }}>
                  {r.name}
                </h3>
                <ul>
                  {r.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="med-body" style={{ marginTop: 24 }}>
            Want the detail first? Read <Link href="/blog/scr-vs-servo-stabilizer">SCR vs servo</Link>,{" "}
            <Link href="/blog/igbt-vs-servo-stabilizer">IGBT vs servo</Link> or the full{" "}
            <Link href="/blog/solid-state-voltage-stabilizer">guide to solid-state stabilizers</Link>.
          </p>
        </div>
      </section>

      {/* ===== Form ===== */}
      <section className="section" id="preorder-form" style={{ background: "var(--paper-2)", scrollMarginTop: 90 }}>
        <div className="container" style={{ maxWidth: 820 }}>
          <h2 className="med-h2">Place your pre-order</h2>
          <p className="med-body" style={{ marginBottom: 24 }}>
            Tell us what you need. It takes a minute, and it helps us bring the right sizes first.
          </p>
          <PreorderForm />
        </div>
      </section>

      {/* ===== Available today ===== */}
      <section className="section hairline-top">
        <div className="container med-narrow">
          <h2 className="med-h2">Need a stabilizer today?</h2>
          <p className="med-body">
            Our <Link href="/showcase/svc">servo (SVC) stabilizers</Link> from 1 to 30 kVA and our{" "}
            <Link href="/industrial">three-phase industrial systems</Link> are available now. For one AC
            or a fridge, see the <Link href="/ac">AC stabilizers</Link>.
          </p>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="section">
        <div className="container">
          <div className="faq-wrap">
            <div className="faq-aside">
              <div
                className="num"
                style={{ fontFamily: "var(--font-mono)", fontSize: 12, letterSpacing: "0.14em", color: "var(--ink-3)", textTransform: "uppercase", marginBottom: 14 }}
              >
                FAQ
              </div>
              <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "clamp(30px,3.6vw,46px)", lineHeight: 1.02, letterSpacing: "-0.02em", margin: 0 }}>
                Pre-order <em>questions</em>.
              </h2>
            </div>
            <div className="faq-list">
              {FAQS.map((f, i) => (
                <details key={i} className="faq-item" open={i === 0}>
                  <summary>
                    {f.q}
                    <span className="faq-plus"></span>
                  </summary>
                  <div className="faq-a">{f.a}</div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
