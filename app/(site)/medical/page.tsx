import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import WhatsAppButton from "@/components/WhatsAppButton";
import { MEDICAL_PAGES, SERVO_STRENGTHS, SOLID_STATE } from "@/lib/medical-pages";
import { SITE, absUrl, VOLTEC_ORG } from "@/lib/site";
import { getT } from "@/lib/i18n-server";

// Industries → Medical hub (rewritten 2026-11-16). Servo motor stabilizers lead —
// Voltec as servo specialists (pure copper, cuts HIGH voltage too); IGBT/SCR are
// a custom-order option. Sub-pages per equipment type: /medical/[slug], data in
// lib/medical-pages.ts. No "medical-grade"/IEC claims (no certificate).
// Content is English (matches the site's content layer); chrome stays localized.
// NOTE: UR/AR translation of this page's body copy is a follow-up (TODO_UR / TODO_AR).

const WA_ASSESS_TEXT =
  "Hi Voltec! Mujhe clinic / medical equipment ke liye stabilizer chahiye. Machine: ___ Sheher: ___";
const SIZES = [
  { kva: "1–5 kVA", use: "One analyser, ultrasound room or bench" },
  { kva: "10 kVA", use: "One laser room — our most-ordered size for lasers" },
  { kva: "15–20 kVA", use: "A full clinic, two machines or dental with OPG" },
  { kva: "30 kVA", use: "Very weak line — works from 60V (single-phase)" },
  { kva: "50 kVA 3-phase", use: "Diagnostic centre or hospital wing" },
  { kva: "Custom", use: "IGBT / SCR solid-state on order" },
];

const FAQS: { q: string; a: string }[] = [
  {
    q: "Which stabilizer is best for medical equipment in Pakistan?",
    a: "For most clinics — laser, ultrasound, dental, lab — a servo motor stabilizer is the proven choice: it holds 220V ±1%, brings high voltage back down as well as boosting low voltage, and is easy to service. Voltec servo stabilizers use copper windings and carry a 1-year warranty. For the most sensitive electronics we also supply IGBT and SCR solid-state stabilizers on custom order.",
  },
  {
    q: "Does a Voltec stabilizer protect against high voltage?",
    a: "Yes. When power returns after load-shedding the line can jump to 260–280V. Voltec servo stabilizers bring high input back down to 220V and cut off above their limit — they do not only boost low voltage.",
  },
  {
    q: "What size stabilizer does my clinic need?",
    a: "Take the machine's rating in kVA (watts ÷ 0.8), add everything else on the same supply and add 25%. A single laser room usually needs a 10 kVA servo; a whole clinic 15–20 kVA; a hospital wing a 3-phase unit. Send us the machine model and we size it for you.",
  },
  {
    q: "Can I order an IGBT or SCR stabilizer?",
    a: "Yes, on custom order. Tell us the machine and supply on WhatsApp or through the custom order form, and we quote the specification, price and lead time in writing.",
  },
  {
    q: "Do you cover MRI or CT?",
    a: "No. Large CT and MRI systems use power conditioning specified by the scanner maker. We protect the laser, ultrasound, X-ray, dental and lab equipment that usually has no proper protection at all.",
  },
  {
    q: "Do you deliver outside Lahore?",
    a: "Yes, nationwide. Our showroom is in Abid Market, Lahore, and our own team handles warranty service.",
  },
];

export const metadata: Metadata = {
  title: "Voltage Stabilizers for Medical & Laser Equipment in Pakistan — Servo Specialists",
  description:
    "Servo motor stabilizers for laser, ultrasound, X-ray, dental and lab equipment. Steady 220V ±1%, cuts high voltage up to 280V, pure copper windings, 1-year warranty. IGBT & SCR on custom order. VOLTEC — assembled in Lahore since 1995. Supplied to Chughtai Labs.",
  alternates: { canonical: "/medical" },
  openGraph: {
    type: "website",
    title: "Voltage Stabilizers for Medical & Laser Equipment | Voltec",
    description:
      "Servo motor stabilizer specialists: steady 220V ±1%, high-voltage protection, pure copper. IGBT & SCR on custom order.",
    url: absUrl("/medical"),
  },
};

export default async function MedicalPage() {
  const t = await getT();

  return (
    <main>
      <JsonLd
        id="ld-medical-faq"
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
            <Link href="/">{t("nav.home")}</Link> <span>/</span> <span>Solutions</span> <span>/</span>{" "}
            <span>Medical</span>
          </div>
          <div className="med-eyebrow">Medical &amp; laser equipment · servo specialists</div>
          <h1>Voltage stabilizers for medical and laser equipment</h1>
          <p className="page-lede" style={{ maxWidth: "62ch" }}>
            Your laser, ultrasound or dental unit cost lakhs. Pakistan&apos;s supply swings from a low evening
            sag to a high-voltage spike when power returns. A VOLTEC servo motor stabilizer — assembled in Lahore — holds it at a
            steady 220V ±1%, boosting low voltage and cutting high voltage, on pure copper windings. Chughtai Labs and
            medical equipment importers already run on VOLTEC.
          </p>
          <div className="med-cta">
            <WhatsAppButton lead from="medical-hub" message={WA_ASSESS_TEXT}>
              Send your machine model on WhatsApp
            </WhatsAppButton>
            <Link href="/medical/laser-machines" className="btn btn-ghost">
              Laser machines →
            </Link>
          </div>
        </div>
      </section>

      {/* ===== By equipment ===== */}
      <section className="section hairline-top">
        <div className="container">
          <div className="med-narrow" style={{ marginBottom: 28 }}>
            <h2 className="med-h2">Choose your equipment</h2>
            <p className="med-body">Each page shows what to protect, the right size and the questions clinics ask us.</p>
          </div>
          <div className="med-sizes">
            {MEDICAL_PAGES.map((p) => (
              <Link key={p.slug} href={`/medical/${p.slug}`} className="med-vs-card is-win" style={{ textDecoration: "none", color: "inherit" }}>
                <div className="med-vs-tag">{p.eyebrow}</div>
                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: 24, margin: "0 0 10px" }}>{p.nav}</h3>
                <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.55, color: "var(--ink-2)" }}>{p.equipment.slice(0, 3).join(" · ")}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== High voltage ===== */}
      <section className="section" style={{ background: "var(--paper-2)" }}>
        <div className="container med-narrow">
          <h2 className="med-h2">The danger most stabilizers miss: high voltage</h2>
          <p className="med-body">
            Everyone plans for low voltage. But when the grid comes back after load-shedding, or the load
            on your transformer drops late at night, the line can jump to 260–280V — and that is what burns
            power boards. Some stabilizers only boost low voltage. Every Voltec servo stabilizer also brings
            high voltage back down to 220V, and its cutoff and time-delay restart keep the surge from ever
            reaching your machine. Ask any seller one question: <em>what does it do at 270V?</em>
          </p>
        </div>
      </section>

      {/* ===== Why Voltec servo ===== */}
      <section className="section hairline-top">
        <div className="container">
          <div className="med-narrow" style={{ marginBottom: 28 }}>
            <h2 className="med-h2">Why clinics choose a Voltec servo motor stabilizer</h2>
          </div>
          <div className="med-grid">
            {SERVO_STRENGTHS.map((s) => (
              <div className="med-grid-item" key={s.t} style={{ flexDirection: "column", gap: 6 }}>
                <strong>{s.t}</strong>
                <span style={{ color: "var(--ink-2)" }}>{s.d}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Sizing ===== */}
      <section className="section" style={{ background: "var(--paper-2)" }}>
        <div className="container">
          <div className="med-narrow" style={{ marginBottom: 28 }}>
            <h2 className="med-h2">What size do you need?</h2>
            <p className="med-body">
              Machine rating in kVA (watts ÷ 0.8) + everything else on the same supply + 25%. Typical setups:
            </p>
          </div>
          <div className="med-sizes">
            {SIZES.map((s) => (
              <div className="med-vs-card" key={s.use}>
                <div className="med-size-kva">{s.kva}</div>
                <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5 }}>{s.use}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Solid-state custom order ===== */}
      <section className="section hairline-top">
        <div className="container">
          <div className="med-narrow" style={{ marginBottom: 28 }}>
            <h2 className="med-h2">{SOLID_STATE.title}</h2>
            <p className="med-body">{SOLID_STATE.body}</p>
          </div>
          <div className="med-vs">
            {SOLID_STATE.options.map((o) => (
              <div className="med-vs-card" key={o.name}>
                <div className="med-vs-tag is-muted">Custom order</div>
                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: 24, margin: "0 0 14px" }}>{o.name}</h3>
                <ul>
                  {o.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="med-scope">
            Not sure which you need? We&apos;ll tell you honestly — most clinic equipment runs best on a servo.{" "}
            <Link href="/medical/igbt-scr-custom-order">IGBT &amp; SCR custom order →</Link>
          </p>
        </div>
      </section>

      {/* ===== Trust strip ===== */}
      <section className="section hairline-top hairline-bot">
        <div className="container">
          <h2 className="med-h2" style={{ textAlign: "center", marginBottom: 28 }}>
            Four decades of power engineering in Lahore.
          </h2>
          <div className="med-stats">
            <div className="med-stat">
              <strong>40+</strong>
              <span>{t("trust.years")}</span>
            </div>
            <div className="med-stat">
              <strong>10,000+</strong>
              <span>{t("trust.customers")}</span>
            </div>
            <div className="med-stat">
              <strong>24/7</strong>
              <span>{t("trust.warranty")}</span>
            </div>
          </div>
          <div className="clients-list" style={{ marginTop: 36, justifyContent: "center" }}>
            {/* eslint-disable @next/next/no-img-element */}
            <img src="/assets/client-kns.png" alt="K&N's" className="client-logo" />
            <img src="/assets/client-chughtai.png" alt="Chughtai Labs" className="client-logo" />
            <img src="/assets/client-fauji.png" alt="Fauji Fertilizer" className="client-logo" />
            <img src="/assets/client-4.png" alt="Client" className="client-logo" />
            <img src="/assets/client-5.png" alt="Client" className="client-logo" />
            {/* eslint-enable @next/next/no-img-element */}
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
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  letterSpacing: "0.14em",
                  color: "var(--ink-3)",
                  textTransform: "uppercase",
                  marginBottom: 14,
                }}
              >
                FAQ
              </div>
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 400,
                  fontSize: "clamp(30px,3.6vw,46px)",
                  lineHeight: 1.02,
                  letterSpacing: "-0.02em",
                  margin: 0,
                }}
              >
                Clinics <em>ask us</em>.
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
            Tell us the machine. We&apos;ll size the protection.
          </h2>
          <p style={{ maxWidth: "52ch", margin: "0 auto 26px", fontSize: 16, lineHeight: 1.6, color: "oklch(85% 0.02 250 / 0.9)" }}>
            Send the machine model and your city on WhatsApp. Written recommendation and quote, 1-year
            warranty, nationwide delivery.
          </p>
          <WhatsAppButton lead from="medical-hub-footer" message={WA_ASSESS_TEXT}>
            WhatsApp Voltec
          </WhatsAppButton>
        </div>
      </section>
    </main>
  );
}
