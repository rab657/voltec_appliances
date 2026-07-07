import type { Metadata } from "next";
import Link from "next/link";
import WhatsAppButton from "@/components/WhatsAppButton";
import JsonLd from "@/components/JsonLd";
import { absUrl, SITE } from "@/lib/site";
import { getT } from "@/lib/i18n-server";

// Solutions → Business / Bulk / Tenders. The B2B landing page and Google Search
// ad destination. Covers the full at-scale offering — voltage stabilizers
// (servo / IGBT / 3-phase industrial) and imported lithium cells & energy
// storage — for industry, corporates, dealers and government tenders. Nationwide.
// Capture = WhatsApp quote (load/kVA + city + tender), fires `lead`.

const B2B_WA =
  "your business/bulk supply — please share specs, documentation and pricing. Requirement: ___ (stabilizer kVA / lithium cells / energy storage), city ___ (tender / corporate / dealer)";

const PILLARS: { id: string; title: string; body: string; points: string[] }[] = [
  {
    id: "stabilizers",
    title: "Voltage stabilizers — every technology",
    body: "We manufacture the full range in Lahore: servo (SVC) for whole buildings, IGBT/static for sensitive and precision loads, AVR relay for single machines, and heavy 3-phase for plants.",
    points: ["Servo (SVC) — 10–500 kVA, built to order", "IGBT / static — precision & medical loads", "AVR relay — single appliances & machines", "100% pure copper, 1-year warranty"],
  },
  {
    id: "energy-storage",
    title: "Lithium cells & energy storage",
    body: "Direct importers of genuine Grade-A EVE LiFePO4 cells — matched and QR-traceable in Lahore — with BMS for solar and UPS banks. Supplied loose or as built packs, in volume.",
    points: ["Grade-A EVE LiFePO4 (280Ah / 304Ah)", "BMS & battery packs, built to spec", "Solar & UPS energy-storage banks", "Bulk / dealer pricing on request"],
  },
  {
    id: "industrial",
    title: "3-phase industrial systems",
    body: "SJW-series three-phase stabilizers from 100 kVA to 500 kVA and beyond, built to order — balanced 400 V ±1%, 24/7 duty, with install and service.",
    points: ["100 kVA · 200 kVA · 500 kVA+ built to order", "Balanced 400 V ±1% output", "Install, bypass & service contracts", "Remote monitoring"],
  },
];

const SIZES: { kva: string; note: string }[] = [
  { kva: "100 kVA", note: "Mid-size plants, commercial buildings, cold storage" },
  { kva: "200 kVA", note: "Factories, textile & processing units, hospitals" },
  { kva: "500 kVA+", note: "Heavy industry & institutions — built to spec" },
];

const TENDER: { title: string; desc: string }[] = [
  { title: "Complete tender documentation", desc: "Certified technical specs, datasheets, test reports and compliance papers prepared for public-sector and corporate tenders." },
  { title: "Engineer-led sizing", desc: "Send your load list, single-line diagram or BOQ — our engineers spec the exact stabilizer rating or cell/pack configuration." },
  { title: "Bulk, dealer & institutional supply", desc: "Multi-unit rollouts and volume orders — stabilizers or lithium cells — built to order with a firm delivery schedule and warranty." },
  { title: "Proven on the ground", desc: "We have solved three-phase voltage problems for plants like K&N's in Kasur — references available on request." },
];

const FAQS: { q: string; a: string }[] = [
  {
    q: "Do you supply for government or corporate tenders?",
    a: "Yes. We are a Lahore-based importer and manufacturer since 1995 and supply industrial, corporate and institutional buyers nationwide. We prepare complete tender documentation — certified specifications, datasheets, test reports and compliance papers — and quote against your BOQ, for stabilizers and for lithium cells / energy storage. Message us your requirement and we respond with specs and pricing.",
  },
  {
    q: "What size three-phase stabilizer does my factory or project need?",
    a: "Size it to your total connected load in kVA, with headroom for motor start-up. We build SJW-series three-phase stabilizers from 100 kVA and 200 kVA up to 500 kVA and beyond, made to order. Send us your load list or single-line diagram and our engineers will size and quote it.",
  },
  {
    q: "Are your lithium cells genuine EVE, and can you supply in bulk?",
    a: "Yes — genuine Grade-A EVE LiFePO4 cells (280Ah / 304Ah), QR-traceable and capacity-matched at our Lahore facility, supplied loose or as BMS-managed packs. We handle volume and dealer orders for solar and UPS energy storage. Message us your quantity and we will quote.",
  },
  {
    q: "Do you provide installation and service, and deliver outside Lahore?",
    a: "Yes. We supply, install and service industrial systems — bypass cabinets, remote monitoring and planned engineer visits — and deliver and commission across Pakistan. Built-to-order lead time depends on capacity and configuration.",
  },
];

export const metadata: Metadata = {
  title: "Voltage Stabilizers, Lithium Cells & Industrial Power — Bulk & Tenders | Voltec",
  description:
    "Importer & manufacturer since 1995 — voltage stabilizers (servo, IGBT, 3-phase 100–500 kVA+), genuine EVE Grade-A LiFePO4 lithium cells and energy storage. Bulk, dealer, corporate & government tender supply across Pakistan. Full documentation, install & service.",
  alternates: { canonical: "/industrial" },
  openGraph: {
    type: "website",
    title: "Voltage Stabilizers, Lithium Cells & Industrial Power — Bulk & Tenders | Voltec",
    description:
      "Servo, IGBT & 3-phase stabilizers plus EVE Grade-A lithium cells & energy storage. Corporate, dealer & government tender supply nationwide. Since 1995.",
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
            <span>/</span> <span>Business &amp; Tenders</span>
          </div>
          <div className="ac-hero">
            <div>
              <div className="med-eyebrow">For industry, corporates, dealers &amp; tenders</div>
              <h1>Stabilizers, lithium cells &amp; industrial power — at scale</h1>
              <p className="page-lede">
                A Lahore <strong>importer &amp; manufacturer since 1995</strong>. We make voltage
                stabilizers in every technology — servo, IGBT and heavy 3-phase to 500 kVA+ — and
                directly import genuine <strong>Grade-A EVE lithium cells</strong> and energy-storage
                systems. We supply industry, corporates, dealers and government tenders nationwide,
                with full documentation, installation and service.
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
              alt="Voltec industrial power equipment — 3-phase stabilizers and lithium energy storage"
            />
          </div>
        </div>
      </section>

      {/* ===== Trust strip ===== */}
      <section className="section hairline-top hairline-bot">
        <div className="container">
          <div className="med-stats">
            <div className="med-stat"><strong>1995</strong><span>Importer &amp; maker since</span></div>
            <div className="med-stat"><strong>100–500kVA+</strong><span>Stabilizers built to order</span></div>
            <div className="med-stat"><strong>Grade-A</strong><span>Genuine EVE LiFePO4</span></div>
            <div className="med-stat"><strong>24/7</strong><span>Industrial duty</span></div>
          </div>
        </div>
      </section>

      {/* ===== What we supply — three pillars ===== */}
      <section className="section">
        <div className="container">
          <div className="med-narrow" style={{ marginBottom: 28 }}>
            <h2 className="med-h2">What we supply at scale</h2>
            <p className="med-body">
              One partner for power quality and storage — manufactured and imported in Lahore,
              quoted against your load, BOQ or tender.
            </p>
          </div>
          <div className="med-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 22 }}>
            {PILLARS.map((p) => (
              <div id={p.id} key={p.id} style={{ border: "1px solid var(--rule-strong)", borderRadius: 16, padding: "24px 22px", background: "#fff", scrollMarginTop: 90 }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: 23, margin: "0 0 8px" }}>{p.title}</h3>
                <p style={{ fontSize: 14.5, lineHeight: 1.55, color: "var(--ink-2)", margin: "0 0 14px" }}>{p.body}</p>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                  {p.points.map((pt) => (
                    <li key={pt} style={{ display: "flex", gap: 9, alignItems: "flex-start", fontSize: 14, color: "var(--ink)" }}>
                      <span style={{ color: "var(--accent)", fontWeight: 700 }}>✓</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Industrial capacity lineup ===== */}
      <section className="section hairline-top">
        <div className="container">
          <div className="med-narrow" style={{ marginBottom: 28 }}>
            <h2 className="med-h2">3-phase stabilizers — sized to your load</h2>
            <p className="med-body">
              Built to order against your connected load, with headroom for motor start-up. Not sure
              of the size? Send us your load list or single-line diagram and our engineers size it — free.
            </p>
          </div>
          <div className="med-sizes">
            {SIZES.map((s) => (
              <div className="med-vs-card is-win" key={s.kva}>
                <div className="med-vs-tag">3-phase SJW</div>
                <div className="med-size-kva">{s.kva}</div>
                <p style={{ margin: "8px 0 0", fontSize: 15.5, lineHeight: 1.5, color: "var(--ink-2)" }}>{s.note}</p>
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
              sizing, and a manufacturer that stands behind the supply.
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
              Send us your tender, BOQ or load list
            </WhatsAppButton>
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
          <p style={{ maxWidth: "54ch", margin: "0 auto 26px", fontSize: 16, lineHeight: 1.6, color: "oklch(85% 0.02 250 / 0.9)" }}>
            Message us what you need — stabilizer kVA, lithium cells or energy storage — your city,
            and any tender or BOQ details. Our engineers reply with specs, documentation and pricing,
            usually the same day.
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
