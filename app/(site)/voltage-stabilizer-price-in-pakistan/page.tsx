import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import WhatsAppButton from "@/components/WhatsAppButton";
import ShowroomMap from "@/components/ShowroomMap";
import InquireLink from "@/components/InquireLink";
import { absUrl, SITE } from "@/lib/site";
import { getT } from "@/lib/i18n-server";

// "Voltage stabilizer price in Pakistan" — the page that answers the search.
//
// WHY (2026-11-11 audit): "voltage stabilizer pakistan" is the biggest Google Ads
// keyword (AED 431, 410 clicks) and matches "voltage stabilizer price in pakistan"
// searches, but it landed on /industrial, scored Quality Score 4 with a
// below-average landing page, and ranked ~50 organically. Price is 70% of every
// WhatsApp question, and the pages answer engines quote are the ones with a dated
// price table. Raheel: "super optimize for this keyword" — focus cities Lahore,
// Islamabad, Rawalpindi and KPK.
//
// NO PRICES ON THIS PAGE (Raheel, 2026-11-11: "for price → inquire. We'll give the
// price later."). Every row ends in an Inquire link that opens WhatsApp with the
// model named; the price is quoted there. Do not add rupee figures here or in the
// Google ad that points at this page. No IGBT/SCR rows — not in stock yet.

type Row = { use: string; model: string; handles: string; href: string };

const ROWS: Row[] = [
  { use: "One AC (1 or 1.5 ton), voltage drops to 150V", model: "Voltec A-100 R2", handles: "10,000 W, inverter AC", href: "/products/vt-avr-a100-r2" },
  { use: "One AC, voltage drops to 120V", model: "Voltec A-100 R3", handles: "10,000 W, inverter and normal AC", href: "/products/vt-avr-a100-r3" },
  { use: "One AC, voltage drops to 100V", model: "Voltec A-100 R4", handles: "10,000 W, severe low-voltage areas", href: "/products/vt-avr-a100-r4" },
  { use: "TV, computer, router or one fridge", model: "Servo (SVC) 1 kVA", handles: "220V ±1%, single-phase", href: "/products/vt-svc-1k" },
  { use: "Whole home with two ACs, or a 6–8 kVA solar inverter", model: "Servo (SVC) 10 kVA", handles: "220V ±1%, input range 100–280V chosen at order", href: "/products/vt-svc-10k" },
  { use: "Large home with two or three ACs, or a 10 kVA inverter", model: "Servo (SVC) 15 kVA", handles: "220V ±1%, single-phase", href: "/products/vt-svc-15k" },
  { use: "Very weak line: works from 60V", model: "Servo (SVC) 30 kVA ultra low voltage", handles: "60–250V in, 220V ±3% out, single-phase", href: "/products/vt-svc-30k-60v" },
  { use: "Factory or any three-phase load", model: "SJW 3-phase 50 kVA", handles: "150–260V per phase in, 220V ±2.5% out", href: "/products/vt-ind-50k" },
];

const QUOTED = "5, 7 and 20 kVA servo, three-phase 100, 200 and 500 kVA, and the A-25 and A-50 for a fridge or small AC";

const FAQS: { q: string; a: string }[] = [
  {
    q: "What is the price of a voltage stabilizer in Pakistan?",
    a: "It depends on what you protect: one AC, a whole home, or a three-phase factory load. Tell us the model or your load and your city on WhatsApp, and we send today's price in writing the same day.",
  },
  {
    q: "What is the price of a 10 kVA servo stabilizer?",
    a: "Message us for today's price; it is quoted the same day. The Voltec servo (SVC) 10 kVA is single-phase, holds 220V ±1%, has copper windings, and runs two inverter ACs plus the rest of a home. You choose the input range, from 100V to 280V, when you order.",
  },
  {
    q: "What is the price of a stabilizer for a 1.5 ton AC?",
    a: "The Voltec A-100 is built for one 1 or 1.5 ton AC, and all three versions are 10,000 W. Choose by how low your voltage falls: R2 works from 150V, R3 from 120V and R4 from 100V. Tell us which one and your city, and we send the price.",
  },
  {
    q: "Why do stabilizer prices differ so much between shops?",
    a: "Four things decide the price: how much copper is inside (some units use aluminium), the true kVA it can carry, how wide the input voltage range is, and who repairs it afterwards. Before you compare prices, compare the weight, the winding material, the input range on the nameplate and the warranty.",
  },
  {
    q: "Do you deliver to Islamabad, Rawalpindi and Peshawar?",
    a: "Yes. We deliver from Lahore to Islamabad, Rawalpindi, Peshawar and across Khyber Pakhtunkhwa and the rest of Pakistan by cargo. Freight is extra and is written on your quote. Send your city and the model on WhatsApp and we reply with the total.",
  },
  {
    q: "How do I pay, and is there a warranty?",
    a: "You pay by bank transfer, or at our Lahore showroom when you collect. We do not offer cash on delivery. Every Voltec stabilizer carries a 1-year warranty and is serviced by our own team.",
  },
  {
    q: "Which size stabilizer do I need?",
    a: "For one AC, use the A-100. For a home with one inverter AC, a fridge and lights, about 5 kVA. For two ACs and the rest of the house, 10 kVA. For a full home with a geyser, motors and two or three ACs, 15 kVA. For a solar inverter: 10 kVA for a 6–8 kVA inverter, 15 kVA for a 10 kVA inverter. If you are not sure, send your appliance list on WhatsApp and we will size it.",
  },
];

const TITLE = "Voltage Stabilizer Price in Pakistan (2026) — AC, Servo & 3-Phase";
const DESCRIPTION =
  "Get today's voltage stabilizer price in Pakistan on WhatsApp, the same day and in writing: AC stabilizers, servo 1 to 30 kVA and three-phase 50 to 500 kVA. Lahore showroom; delivery to Islamabad, Rawalpindi, Peshawar and across Pakistan.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/voltage-stabilizer-price-in-pakistan" },
  openGraph: { type: "website", title: TITLE, description: DESCRIPTION, url: absUrl("/voltage-stabilizer-price-in-pakistan") },
};

const cell: React.CSSProperties = { padding: "14px 8px", borderBottom: "1px solid var(--rule)", verticalAlign: "top", textAlign: "left" };
const head: React.CSSProperties = { ...cell, fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-3)", borderBottom: "1px solid var(--rule-strong)" };

export default async function StabilizerPricePage() {
  const t = await getT();
  const telStore = `tel:${SITE.phoneStore.replace(/[^+\d]/g, "")}`;

  return (
    <main>
      <JsonLd
        id="ld-price-faq"
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
        }}
      />

      {/* ===== Hero ===== */}
      <section className="page-head">
        <div className="container">
          <div className="crumbs">
            <Link href="/">{t("nav.home")}</Link> <span>/</span> <span>Stabilizer prices</span>
          </div>
          <div className="med-eyebrow">Price on WhatsApp · same day</div>
          <h1>Voltage stabilizer price in Pakistan</h1>
          <p className="page-lede" style={{ maxWidth: "62ch" }}>
            Find what you want to protect in the table and tap Inquire. We send today&apos;s price for
            your city on WhatsApp the same day, in writing.
          </p>
          <div className="med-cta">
            <WhatsAppButton
              lead
              from="price-page"
              productName="stabilizer price"
              message="Hi Voltec! Stabilizer price chahiye. Model ya load: ___ Quantity: ___ City: ___"
            >
              Get today&apos;s price on WhatsApp
            </WhatsAppButton>
            <a href={telStore} className="btn btn-ghost">
              Call the showroom {SITE.phoneStoreDisplay}
            </a>
          </div>
        </div>
      </section>

      {/* ===== Price table ===== */}
      <section className="section hairline-top">
        <div className="container">
          <h2 className="med-h2">Find your stabilizer, then inquire</h2>
          {/* Three columns, no minimum width: on a phone the price must be on screen
              without scrolling sideways, so the spec sits under the model name. */}
          <div style={{ marginTop: 18 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 15 }}>
              <thead>
                <tr>
                  <th style={head}>What you want to protect</th>
                  <th style={head}>Model</th>
                  <th style={{ ...head, textAlign: "right", whiteSpace: "nowrap" }}>Price</th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map((r) => (
                  <tr key={r.href}>
                    <td style={cell}>{r.use}</td>
                    <td style={cell}>
                      <Link href={r.href}>{r.model}</Link>
                      <span style={{ display: "block", marginTop: 4, fontSize: 13, color: "var(--ink-3)" }}>{r.handles}</span>
                    </td>
                    <td style={{ ...cell, textAlign: "right", whiteSpace: "nowrap" }}>
                      <InquireLink model={r.model} from="price-page" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="med-body" style={{ marginTop: 18 }}>
            We also supply {QUOTED}. Send the size, single or three phase, and your city, and we
            reply with the price the same day.
          </p>
        </div>
      </section>

      {/* ===== What decides the price ===== */}
      <section className="section" style={{ background: "var(--paper-2)" }}>
        <div className="container med-narrow">
          <h2 className="med-h2">What decides the price</h2>
          <p className="med-body">
            <strong>Copper.</strong> A stabilizer is mostly a transformer. More copper costs more and
            runs cooler; some cheap units use aluminium.
          </p>
          <p className="med-body">
            <strong>True capacity.</strong> A 10 kVA unit must carry 10 kVA at low voltage, when the
            current is highest. Compare the weight, not only the label.
          </p>
          <p className="med-body">
            <strong>Input range.</strong> A unit that works from 100V costs more than one that cuts
            off at 150V. Buy for the lowest voltage your area actually gets.
          </p>
          <p className="med-body">
            <strong>Warranty and repair.</strong> Every Voltec stabilizer has a 1-year warranty and is
            serviced by our own team in Lahore.
          </p>
          <p className="med-body">
            More detail: <Link href="/blog/compare-stabilizer-brands-pakistan">how to compare stabilizer brands</Link>{" "}
            and <Link href="/blog/what-size-stabilizer-pakistan-home">what size your home needs</Link>.
          </p>
        </div>
      </section>

      {/* ===== Buying ===== */}
      <section className="section hairline-top">
        <div className="container med-narrow">
          <h2 className="med-h2">Buying from Lahore, Islamabad, Rawalpindi or Peshawar</h2>
          <p className="med-body">
            <strong>In Lahore:</strong> come to the showroom at {SITE.addressDisplay} and see a
            stabilizer hold 220V on a live low-voltage demo. Mon–Sat, 10:30am–8:30pm.
          </p>
          <p className="med-body">
            <strong>Islamabad, Rawalpindi, Peshawar and across KPK:</strong> we send by cargo from
            Lahore. Freight is extra and is written on your quote.
          </p>
          <p className="med-body">
            <strong>Payment:</strong> bank transfer, or pay at the showroom when you collect. No cash
            on delivery.
          </p>
          <p className="med-body">
            <strong>Dealers:</strong> dealer terms start at 10 pieces.{" "}
            <Link href="/#dealers">See the dealer offer</Link>.
          </p>
        </div>
      </section>

      <ShowroomMap from="price-page" />

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
                Price <em>questions</em>.
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
