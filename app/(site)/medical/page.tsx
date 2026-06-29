import type { Metadata } from "next";
import Link from "next/link";
import { VOLTEC_WHATSAPP } from "@/lib/products";
import { WhatsAppIcon } from "@/components/icons";
import JsonLd from "@/components/JsonLd";
import { SITE, absUrl, VOLTEC_ORG } from "@/lib/site";
import { getT } from "@/lib/i18n-server";

// Industries → Medical. A non-technical, insurance-framed landing page that
// sells the existing inverter (IGBT) stabilizer to clinic owners/doctors —
// distinct from the spec-led IGBT showcase that targets the engineer.
// Content is English (matches the site's content layer); chrome stays localized.
// NOTE: UR/AR translation of this page's body copy is a follow-up (TODO_UR / TODO_AR).

const IGBT_SLUG = "smart-inverter-voltage-stabilizer";

const wa = (text: string) =>
  `https://wa.me/${VOLTEC_WHATSAPP}?text=${encodeURIComponent(text)}`;
const WA_ASSESS = wa(
  "Hi Voltec! I run a clinic and want to protect my equipment. Can you assess what I need?",
);

const PROTECTS: string[] = [
  "Aesthetic & dermatology lasers (IPL, Nd:YAG, diode, CO₂, Q-switched / picosecond)",
  "Hair- and tattoo-removal laser platforms",
  "RF and HIFU aesthetic devices",
  "Cryolipolysis / body-contouring systems",
  "Dental units, dental lasers and dental imaging",
  "Ultrasound machines",
  "Lab analysers, centrifuges, incubators",
  "Autoclaves and sterilizers with electronic controls",
];

const SERVO_POINTS = [
  "Motor-driven correction",
  "Reacts in a fraction of a second — too slow for a laser",
  "Has a motor and carbon brush that wear out",
  "Built for appliances, not clinical equipment",
];
// Both Voltec options are solid-state and beat a servo on the points that matter.
const SOLID_POINTS = [
  "Fully electronic, solid-state correction",
  "Faster than a servo — no motor to physically move",
  "No moving parts — nothing to wear out",
  "Built for clinical and precision equipment",
];
// Two solid-state ways to protect — both better than a servo for a clinic.
const SOLUTIONS: { name: string; tag: string; slug: string; points: string[] }[] = [
  {
    name: "Voltec Inverter (IGBT)",
    tag: "Precision",
    slug: "smart-inverter-voltage-stabilizer",
    points: [
      "Stepless, pure-sine output held to ±1%",
      "Instant, sub-cycle correction",
      "For your most sensitive machines — lasers, ultrasound, diagnostics, lab analysers",
    ],
  },
  {
    name: "Voltec SCR — Thyristor",
    tag: "Solid-state",
    slug: "scr",
    points: [
      "Solid-state thyristor switching, fast (~20 ms)",
      "Stepped correction, no motor or brush to service",
      "For rugged clinical loads — compressors, HVAC, autoclaves, sterilizers, plug-load",
    ],
  },
];

const FAQS: { q: string; a: string }[] = [
  {
    q: "How much does protection cost compared to my machine?",
    a: "A small fraction of the machine's value. Send us your equipment and load on WhatsApp and we'll size it and quote you.",
  },
  {
    q: "Isn't my existing servo stabilizer enough?",
    a: "For appliances, yes. For a laser or sensitive diagnostic machine, a servo reacts too slowly and its motor and brush wear out over time. Voltec's solid-state units — the inverter (IGBT) and the SCR thyristor — react faster and have no moving parts to wear out. The IGBT is the choice for the most sensitive equipment; the SCR suits rugged clinical loads.",
  },
  {
    q: "What size do I need?",
    a: "Most clinic machines fall in the 3–15 kVA single-phase range. Tell us the equipment and we'll size it exactly — there's no single right answer for every clinic.",
  },
  {
    q: "Do you cover MRI or CT?",
    a: "No — and we'll be straight with you about it. Large three-phase imaging systems are power-conditioned to the scanner maker's own specification. We protect the single-phase clinical and aesthetic equipment that usually has no proper protection at all.",
  },
  {
    q: "What if the stabilizer itself fails?",
    a: "It safely bypasses to mains so your equipment is never left without power, and with no moving parts there's far less to go wrong than a motor-driven servo.",
  },
];

export const metadata: Metadata = {
  title: "Power Protection for Medical & Aesthetic Clinics | Voltec Appliances",
  description:
    "Stepless inverter (IGBT) power protection for clinic lasers, ultrasound and sensitive medical equipment in Pakistan. Protect an expensive machine from a single voltage event. Lahore-made, 40 years of power engineering.",
  alternates: { canonical: "/medical" },
  openGraph: {
    type: "website",
    title: "Power Protection for Medical & Aesthetic Clinics | Voltec",
    description:
      "Protect clinic lasers, ultrasound and sensitive equipment from a single voltage event with stepless inverter (IGBT) power protection.",
    url: absUrl("/medical"),
    // OWNER: add medical OG image when available — falls back to the site default card.
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
          <div className="med-eyebrow">For medical &amp; aesthetic clinics</div>
          <h1>You spent millions on the machine. Protect it for a fraction of that.</h1>
          <p className="page-lede" style={{ maxWidth: "60ch" }}>
            One voltage spike or sag can damage a laser, ultrasound or diagnostic system you can&apos;t
            easily replace. Voltec&apos;s solid-state protection — inverter (IGBT) and SCR thyristor —
            stands between your equipment and the grid, correcting voltage faster than any motor-driven
            servo.
          </p>
          <div className="med-cta">
            {/* OWNER: switch CTA to purchase/inquiry-to-buy once IGBT medical unit is shippable. */}
            <a href={WA_ASSESS} target="_blank" rel="noopener" className="btn btn-wa">
              <WhatsAppIcon /> <span>Book a clinic assessment</span>
            </a>
            <Link href={`/showcase/${IGBT_SLUG}`} className="btn btn-ghost">
              See the technical specs →
            </Link>
          </div>
        </div>
      </section>

      {/* ===== The risk ===== */}
      <section className="section hairline-top">
        <div className="container med-narrow">
          <h2 className="med-h2">The risk isn&apos;t frequent. It&apos;s expensive.</h2>
          <p className="med-body">
            Most days your power is fine. But it only takes one event — a spike when the grid switches
            back after load-shedding, a deep sag when a heavy load kicks in next door — to damage the
            power supply of an expensive machine. Repairs mean weeks of downtime and lost bookings.
            Replacement can cost as much as the machine did. Protection costs a small fraction of either.
          </p>
        </div>
      </section>

      {/* ===== Why a servo isn't enough ===== */}
      <section className="section" style={{ background: "var(--paper-2)" }}>
        <div className="container">
          <div className="med-narrow" style={{ marginBottom: 36 }}>
            <h2 className="med-h2">Why the usual stabilizer can&apos;t protect a laser</h2>
            <p className="med-body">
              Most clinics rely on a servo (motor-driven) stabilizer. It works by physically turning a
              motor to adjust voltage — which takes a fraction of a second. That&apos;s fine for an air
              conditioner. But a laser fires in milliseconds. By the time the servo motor has moved, the
              voltage event has already reached your machine. And the servo&apos;s motor and carbon brush
              wear out over time — so the thing protecting your equipment can itself fail.
            </p>
          </div>
          <div className="med-vs">
            <div className="med-vs-card">
              <div className="med-vs-tag is-muted">Servo (SVC) stabilizer</div>
              <ul>
                {SERVO_POINTS.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
            <div className="med-vs-card is-win">
              <div className="med-vs-tag">Voltec solid-state (IGBT &amp; SCR)</div>
              <ul>
                {SOLID_POINTS.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
          </div>
          <p className="med-note">
            No motor. No brushes. Nothing to wear out — so the protection itself doesn&apos;t fail when
            you need it most.
          </p>
        </div>
      </section>

      {/* ===== Two ways to protect (IGBT & SCR) ===== */}
      <section className="section hairline-top">
        <div className="container">
          <div className="med-narrow" style={{ marginBottom: 32 }}>
            <h2 className="med-h2">Two ways to protect — both better than a servo</h2>
            <p className="med-body">
              Voltec offers two solid-state stabilizers, neither with a motor or brush to wear out. We
              match the right one to each machine: the inverter (IGBT) for your most sensitive equipment,
              and the SCR thyristor for rugged, everyday clinical loads.
            </p>
          </div>
          <div className="med-vs">
            {SOLUTIONS.map((s) => (
              <div className="med-vs-card is-win" key={s.slug}>
                <div className="med-vs-tag">{s.tag}</div>
                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: 24, margin: "0 0 14px", letterSpacing: "-0.01em" }}>
                  {s.name}
                </h3>
                <ul>
                  {s.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
                <Link href={`/showcase/${s.slug}`} className="serve-cta" style={{ marginTop: 18 }}>
                  See the {s.name} range <span className="arrow">→</span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== What it protects ===== */}
      <section className="section">
        <div className="container">
          <div className="med-narrow" style={{ marginBottom: 28 }}>
            <h2 className="med-h2">Built for the equipment a clinic actually runs</h2>
            <p className="med-body">
              Voltec&apos;s solid-state protection — inverter (IGBT) and SCR thyristor — is sized for
              single-phase clinical and aesthetic equipment, typically 1–15 kVA.
            </p>
          </div>
          {/* OWNER: confirm this equipment list; do NOT add MRI/CT here. */}
          <div className="med-grid">
            {PROTECTS.map((item) => (
              <div className="med-grid-item" key={item}>
                <span className="med-check" aria-hidden="true">
                  ✓
                </span>
                <span>{item}</span>
              </div>
            ))}
          </div>
          <p className="med-scope">
            For large three-phase imaging systems like MRI and CT, power conditioning is specified by the
            scanner manufacturer — that&apos;s a different class of system, and we&apos;ll tell you so
            honestly rather than sell you the wrong thing.
          </p>
        </div>
      </section>

      {/* ===== How it works ===== */}
      <section className="section" style={{ background: "var(--paper-2)" }}>
        <div className="container med-narrow">
          <h2 className="med-h2">How the protection works</h2>
          <p className="med-body">
            Voltec&apos;s inverter (IGBT) stabilizer continuously reads the incoming voltage and
            electronically rebuilds a clean, steady output — stepless, with a pure sine-wave that
            sensitive electronics expect. If anything inside ever faults, it safely bypasses so your
            equipment is never left without power. It&apos;s the same technology principle as an inverter
            air conditioner: smooth, electronic, efficient. The SCR thyristor option protects the same
            solid-state way — correcting in fast steps, a lower-cost choice for rugged clinical loads.
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
                Clinic owners <em>ask us</em>.
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
            Protect the machine you can&apos;t afford to lose.
          </h2>
          <p style={{ maxWidth: "52ch", margin: "0 auto 26px", fontSize: 16, lineHeight: 1.6, color: "oklch(85% 0.02 250 / 0.9)" }}>
            Tell us what equipment you run. We&apos;ll assess it and recommend exactly what you need — no
            overselling.
          </p>
          <a href={WA_ASSESS} target="_blank" rel="noopener" className="btn btn-wa" style={{ display: "inline-flex" }}>
            <WhatsAppIcon /> <span>Book a clinic assessment</span>
          </a>
        </div>
      </section>
    </main>
  );
}
