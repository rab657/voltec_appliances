import type { Metadata } from "next";
import Link from "next/link";
import WhatsAppButton from "@/components/WhatsAppButton";
import JsonLd from "@/components/JsonLd";
import { absUrl, SITE } from "@/lib/site";
import { getT } from "@/lib/i18n-server";

// Solutions → Industrial. B2B / corporate / government-tender landing page for
// 3-phase voltage stabilizers (SJW-series, 100–500 kVA+, built to order). This is
// the Google Search ad destination for high-value industrial & tender queries.
// Goal: establish manufacturer credibility fast, then route to a WhatsApp quote
// with the buyer's load (kVA) + city + tender reference. Nationwide, not Lahore-only.

const B2B_WA =
  "3-phase industrial voltage stabilizers — please share specs, documentation and pricing. Our load is ___ kVA, city ___ (tender / corporate)";

// Capacity lineup — built to order, so no fixed price (quote-based).
const SIZES: { kva: string; note: string }[] = [
  { kva: "100 kVA", note: "Mid-size plants, commercial buildings, cold storage" },
  { kva: "200 kVA", note: "Factories, textile & processing units, hospitals" },
  { kva: "500 kVA+", note: "Heavy industry, institutions & multi-line loads — built to spec" },
];

// The six industrial guarantees (from the industrial showcase).
const VALUE_PROPS: { title: string; desc: string }[] = [
  { title: "Balanced 400V ±1% output", desc: "Every phase held to a clean, steady 400 V — protects motors, drives and PLCs from imbalance." },
  { title: "Deep low-voltage correction", desc: "Holds full output even when the input drops to 260 V line-to-line — no production stoppage on a weak grid." },
  { title: "24/7 industrial duty cycle", desc: "Built to run three shifts a day at 50 °C ambient. Heavy windings, continuous rating." },
  { title: "Oversized copper & contactors", desc: "100% copper current path and heavy contactors absorb motor inrush and surge." },
  { title: "Installation & service contracts", desc: "We supply, install and service — bypass cabinets, planned engineer visits, uptime SLAs." },
  { title: "Remote monitoring", desc: "Watch voltage and load on every phase from your phone, from anywhere." },
];

// Procurement / tender assurances — the B2B-critical block.
const TENDER: { title: string; desc: string }[] = [
  { title: "Complete tender documentation", desc: "Certified technical specs, datasheets, test reports and compliance papers prepared for public-sector and corporate tenders." },
  { title: "Engineer-led sizing", desc: "Send us your load list or single-line diagram — our engineers size the exact rating, with headroom for motor start-up." },
  { title: "Bulk & institutional supply", desc: "Multi-unit rollouts across sites, built to order with a firm delivery schedule and warranty." },
  { title: "Proven on the ground", desc: "We have solved three-phase voltage problems for plants like K&N's in Kasur — references available on request." },
];

const FAQS: { q: string; a: string }[] = [
  {
    q: "What size three-phase stabilizer does my factory or project need?",
    a: "Size it to your total connected load in kVA, with headroom for motor start-up. Voltec builds SJW-series three-phase stabilizers from 100 kVA and 200 kVA up to 500 kVA and beyond, made to order. Send us your load list or a single-line diagram on WhatsApp and our engineers will size it and quote it.",
  },
  {
    q: "Can you supply for a government or corporate tender?",
    a: "Yes. We are a Lahore-based manufacturer since 1995 and supply industrial and institutional buyers nationwide. We prepare complete tender documentation — certified specifications, datasheets, test reports and compliance papers — and can quote against your BOQ. Message us your tender or requirement and we will respond with specs and pricing.",
  },
  {
    q: "Do you provide installation and service contracts?",
    a: "Yes. We supply, install and service industrial systems, with bypass cabinets and remote monitoring, and planned engineer visits to keep the plant protected. We have done plants like K&N's in Kasur.",
  },
  {
    q: "How long does a custom industrial stabilizer take, and do you deliver outside Lahore?",
    a: "It is built to order, so lead time depends on capacity and configuration. We deliver and commission across Pakistan. Message us with your load and city and we will confirm the price and delivery time.",
  },
];

export const metadata: Metadata = {
  title: "3-Phase Industrial Voltage Stabilizers Pakistan — Corporate & Tender Supply | Voltec",
  description:
    "Manufacturer of 3-phase industrial voltage stabilizers in Pakistan — SJW-series 100 kVA to 500 kVA+, built to order. Balanced 400V ±1%, 24/7 duty, installation & service contracts, full tender documentation. Corporate, institutional & government tender supply nationwide. Since 1995.",
  alternates: { canonical: "/industrial" },
  openGraph: {
    type: "website",
    title: "3-Phase Industrial Voltage Stabilizers — Corporate & Tender Supply | Voltec",
    description:
      "SJW-series 100–500 kVA+ three-phase stabilizers, built to order. Certified specs & tender documentation, installation & service contracts. Nationwide supply, since 1995.",
    url: absUrl("/industrial"),
  },
};

export default async function IndustrialPage() {
  const t = await getT();

  return (
    <main>
      <JsonLd
        id="ld-industrial-faq"
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
            <Link href="/">{t("nav.home")}</Link> <span>/</span> <span>{t("nav.solutions")}</span>{" "}
            <span>/</span> <span>Industrial &amp; Tenders</span>
          </div>
          <div className="ac-hero">
            <div>
              <div className="med-eyebrow">For factories, institutions &amp; tenders</div>
              <h1>3-phase voltage stabilizers, built to order</h1>
              <p className="page-lede">
                Unstable three-phase power damages motors, drives and production lines — and stalls
                a whole shift. Voltec builds <strong>SJW-series industrial stabilizers from 100 kVA
                to 500 kVA and beyond</strong>, holding every phase at a clean 400 V ±1%, 24/7. A
                Lahore manufacturer since 1995, we supply industry, corporates and government tenders
                nationwide — with full documentation, installation and service.
              </p>
              <div className="med-cta">
                <WhatsAppButton productName={B2B_WA} lead>
                  Request a quote <span className="arrow" style={{ marginLeft: 4 }}>→</span>
                </WhatsAppButton>
              </div>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="ac-hero-img"
              src="/assets/factory-1.jpg"
              alt="Voltec 3-phase industrial voltage stabilizers protecting a factory's power supply"
            />
          </div>
        </div>
      </section>

      {/* ===== Trust strip ===== */}
      <section className="section hairline-top hairline-bot">
        <div className="container">
          <div className="med-stats">
            <div className="med-stat"><strong>1995</strong><span>Manufacturing since</span></div>
            <div className="med-stat"><strong>100–500kVA+</strong><span>Built to order</span></div>
            <div className="med-stat"><strong>400V ±1%</strong><span>Balanced output</span></div>
            <div className="med-stat"><strong>24/7</strong><span>Industrial duty</span></div>
          </div>
        </div>
      </section>

      {/* ===== Capacity lineup ===== */}
      <section className="section">
        <div className="container">
          <div className="med-narrow" style={{ marginBottom: 28 }}>
            <h2 className="med-h2">Sized to your load</h2>
            <p className="med-body">
              Every unit is built to order against your connected load, with headroom for motor
              start-up. Not sure of the size? Send us your load list or single-line diagram and our
              engineers will size it — free.
            </p>
          </div>
          <div className="med-sizes">
            {SIZES.map((s) => (
              <div className="med-vs-card is-win" key={s.kva}>
                <div className="med-vs-tag">3-phase SJW</div>
                <div className="med-size-kva">{s.kva}</div>
                <p style={{ margin: "8px 0 0", fontSize: 15.5, lineHeight: 1.5, color: "var(--ink-2)" }}>
                  {s.note}
                </p>
              </div>
            ))}
          </div>
          <p className="med-scope">
            Single or dual-conversion, indoor or weatherproof cabinets, with bypass — configured to spec.
          </p>
        </div>
      </section>

      {/* ===== Built for tenders & procurement ===== */}
      <section className="section" style={{ background: "var(--paper-2)" }}>
        <div className="container">
          <div className="med-narrow" style={{ marginBottom: 28 }}>
            <h2 className="med-h2">Built for tenders &amp; procurement</h2>
            <p className="med-body">
              We work the way procurement teams need us to — certified paperwork, engineer-led
              sizing, and a manufacturer that stands behind the install.
            </p>
          </div>
          <div className="med-grid">
            {TENDER.map((v) => (
              <div className="med-grid-item" key={v.title} style={{ alignItems: "flex-start" }}>
                <span className="med-check" aria-hidden="true">✓</span>
                <span>
                  <strong>{v.title}</strong>
                  <br />
                  <span style={{ color: "var(--ink-2)", fontSize: 14.5 }}>{v.desc}</span>
                </span>
              </div>
            ))}
          </div>
          <div className="med-cta" style={{ marginTop: 26 }}>
            <WhatsAppButton productName={B2B_WA} lead>
              Send us your tender or load list
            </WhatsAppButton>
          </div>
        </div>
      </section>

      {/* ===== Engineering value props ===== */}
      <section className="section hairline-top">
        <div className="container">
          <div className="med-narrow" style={{ marginBottom: 28 }}>
            <h2 className="med-h2">Engineered for the plant floor</h2>
            <p className="med-body">
              Not a scaled-up home unit — a heavy industrial machine designed to run continuously and
              protect what it powers.
            </p>
          </div>
          <div className="med-grid">
            {VALUE_PROPS.map((v) => (
              <div className="med-grid-item" key={v.title} style={{ alignItems: "flex-start" }}>
                <span className="med-check" aria-hidden="true">✓</span>
                <span>
                  <strong>{v.title}</strong>
                  <br />
                  <span style={{ color: "var(--ink-2)", fontSize: 14.5 }}>{v.desc}</span>
                </span>
              </div>
            ))}
          </div>
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
                Procurement <em>questions</em>.
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

      {/* ===== Final CTA ===== */}
      <section className="why-band">
        <div className="container" style={{ textAlign: "center" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "clamp(30px,4vw,52px)", lineHeight: 1.05, margin: "0 0 14px" }}>
            Get a quote for your project or tender.
          </h2>
          <p style={{ maxWidth: "52ch", margin: "0 auto 26px", fontSize: 16, lineHeight: 1.6, color: "oklch(85% 0.02 250 / 0.9)" }}>
            Message us your load (kVA), your city, and any tender or BOQ details. Our engineers reply
            with specs, documentation and pricing — usually the same day.
          </p>
          <WhatsAppButton productName={B2B_WA} variant="light" lead>
            Request a quote on WhatsApp
          </WhatsAppButton>
          <p style={{ marginTop: 16, fontSize: 14, color: "oklch(80% 0.02 250 / 0.8)" }}>
            Or call our engineers: {SITE.phoneDisplay}
          </p>
        </div>
      </section>
    </main>
  );
}
