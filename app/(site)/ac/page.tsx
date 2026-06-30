import type { Metadata } from "next";
import Link from "next/link";
import WhatsAppButton from "@/components/WhatsAppButton";
import { PROT_ICONS } from "@/components/showcase/primitives";
import JsonLd from "@/components/JsonLd";
import { absUrl } from "@/lib/site";
import { getT } from "@/lib/i18n-server";

// Solutions → AC stabilizers. Plain-language landing page for the 2026 heat wave:
// solar runs ACs by day, but at night ACs fall back to the grid, where voltage
// sags — so the AC won't start or the compressor is at risk. A Voltec AC
// stabilizer boosts low voltage back to a steady 220V. Goal: read fast, pick a
// model by how low the voltage drops, message on WhatsApp. This page is the ad
// destination for the retail + wholesale AC campaigns.

type AcModel = {
  code: string;
  price: string;
  fromV: string;
  fits: string;
  badge?: string;
  popular?: boolean;
};

// Retail rates. The differentiator is the low-voltage floor — pick by how far the
// voltage drops at night. Bulk/wholesale pricing is handled on WhatsApp.
const MODELS: AcModel[] = [
  { code: "R2", price: "24,000", fromV: "150V", fits: "Inverter AC · 1 / 1.5 ton", badge: "Lighter sag" },
  { code: "R3", price: "29,000", fromV: "120V", fits: "Inverter & Normal AC · 1 / 1.5 ton", badge: "Most popular", popular: true },
  { code: "R4", price: "32,000", fromV: "100V", fits: "Inverter & Normal AC · 1 / 1.5 ton", badge: "Severe low-voltage" },
];

const VALUE_PROPS: { title: string; desc: string }[] = [
  { title: "Built for ACs — 10,000W", desc: "Sized and tuned for 1 and 1.5 ton air conditioners, inverter or normal." },
  { title: "99% pure copper transformer", desc: "Real copper, not aluminium — runs cooler and lasts for years." },
  { title: "Energy saver — 10% less current", desc: "Draws about 10% less current, so your AC runs on a lower electricity bill." },
  { title: "Starts your AC on low voltage", desc: "Boosts a weak night-time grid back to a steady 220V, so the AC starts and runs." },
  { title: "Protects the compressor", desc: "Low voltage burns AC compressors. Steady output keeps yours safe." },
  { title: "1 year warranty", desc: "Every unit is backed for a full year. We service what we sell." },
];

const WHOLESALE_CITIES = ["Karachi", "Rawalpindi", "Peshawar"];

const FAQS: { q: string; a: string }[] = [
  {
    q: "Why does my AC work in the day but not at night?",
    a: "In the day your solar runs the AC on steady power. At night there is no solar, so the AC runs on the grid — and during the heat wave the grid voltage drops low. On low voltage an AC either will not start, or the compressor strains and can burn out. An AC stabilizer boosts that low voltage back to a steady 220V, so your AC starts and runs safely all night.",
  },
  {
    q: "Which model do I need — R2, R3 or R4?",
    a: "Pick by how low your voltage drops at night. R2 works from 150V (lighter sag, inverter AC). R3 works from 120V — the most popular, for inverter and normal ACs. R4 works from 100V, for severe low-voltage areas. Not sure how low your voltage gets? Message us on WhatsApp and we'll tell you the right one.",
  },
  {
    q: "Will one stabilizer run a 1.5 ton AC?",
    a: "Yes. All three models are 10,000W, specially designed for 1 and 1.5 ton ACs — inverter or normal. R3 and R4 handle both inverter and normal ACs.",
  },
  {
    q: "Does it really lower my electricity bill?",
    a: "It draws about 10% less current thanks to the pure-copper, energy-saver design. Over a hot summer of nightly AC use, that adds up on your bill.",
  },
  {
    q: "Do you have wholesale / bulk pricing?",
    a: "Yes. These are retail rates. We supply dealers and bulk buyers in Karachi, Rawalpindi and Peshawar at wholesale prices. Message us on WhatsApp with your quantity and city for a bulk quote.",
  },
];

export const metadata: Metadata = {
  title: "AC Stabilizer for Low Voltage at Night — 1 & 1.5 Ton | Voltec",
  description:
    "Heat wave nights drop the grid voltage and your AC won't start. Voltec AC stabilizers (10,000W, 99% copper) boost low voltage to a steady 220V so your 1 / 1.5 ton AC runs all night. Works from 150V, 120V or 100V. 1-year warranty. Message us on WhatsApp.",
  alternates: { canonical: "/ac" },
  openGraph: {
    type: "website",
    title: "AC Stabilizer for Low Voltage at Night | Voltec",
    description:
      "Your AC dies at night when the grid voltage drops? A Voltec AC stabilizer boosts it back to a steady 220V. 10,000W, 99% copper, energy saver, 1-year warranty.",
    url: absUrl("/ac"),
  },
};

export default async function AcPage() {
  const t = await getT();

  return (
    <main>
      <JsonLd
        id="ld-ac-faq"
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
            <span>/</span> <span>{t("nav.ac")}</span>
          </div>
          <div className="med-eyebrow">For homes with AC</div>
          <h1>Low voltage tripping your AC at night?</h1>
          <p className="page-lede" style={{ maxWidth: "60ch" }}>
            In this heat wave your solar runs the AC all day. But at night there&apos;s no solar — the AC
            runs on the grid, and the voltage drops low. On low voltage your AC won&apos;t start, and the
            compressor can burn out. A Voltec AC stabilizer boosts that weak voltage back to a steady
            220V — so your AC runs cool all night, and the compressor stays safe.
          </p>
          <div className="med-cta">
            <WhatsAppButton productName="AC Stabilizer — help me pick (1/1.5 ton)">
              Get my AC stabilizer <span className="arrow" style={{ marginLeft: 4 }}>→</span>
            </WhatsAppButton>
          </div>
        </div>
      </section>

      {/* ===== The three models ===== */}
      <section className="section hairline-top">
        <div className="container">
          <div className="med-narrow" style={{ marginBottom: 28 }}>
            <h2 className="med-h2">Pick by how low your voltage drops</h2>
            <p className="med-body">
              All three are <strong>10,000W</strong>, specially designed for 1 and 1.5 ton ACs. The
              difference is how low a voltage they keep working at. Not sure how far your voltage drops?
              Message us — we&apos;ll tell you the right one, free.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 18 }}>
            {MODELS.map((m) => (
              <div
                key={m.code}
                style={{
                  position: "relative",
                  border: m.popular ? "2px solid var(--accent)" : "1px solid var(--rule-strong)",
                  borderRadius: 16,
                  padding: "26px 22px",
                  background: "#fff",
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                }}
              >
                {m.badge && (
                  <span
                    style={{
                      alignSelf: "flex-start",
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      padding: "4px 10px",
                      borderRadius: 999,
                      background: m.popular ? "var(--accent)" : "var(--paper-2)",
                      color: m.popular ? "#fff" : "var(--ink-2)",
                    }}
                  >
                    {m.badge}
                  </span>
                )}
                <div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 30, letterSpacing: "-0.01em" }}>
                    Voltec {m.code}
                  </div>
                  <div className="mono" style={{ fontSize: 12, color: "var(--accent-deep)", letterSpacing: "0.04em", marginTop: 2 }}>
                    Works from {m.fromV}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <span style={{ fontFamily: "var(--font-display)", fontSize: 32, color: "var(--ink)" }}>
                    Rs {m.price}
                  </span>
                  <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>retail</span>
                </div>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8, fontSize: 14.5, color: "var(--ink-2)" }}>
                  <li>✓ {m.fits}</li>
                  <li>✓ 10,000W · 99% pure copper</li>
                  <li>✓ Energy saver — ~10% less current</li>
                  <li>✓ 1 year warranty</li>
                </ul>
                <div style={{ marginTop: "auto", paddingTop: 6 }}>
                  <WhatsAppButton
                    productName={`AC Stabilizer ${m.code} (works from ${m.fromV}) — Rs ${m.price}`}
                    className="ac-card-cta"
                  >
                    Order {m.code} — Rs {m.price}
                  </WhatsAppButton>
                </div>
              </div>
            ))}
          </div>
          <p className="med-scope" style={{ marginTop: 22 }}>
            Retail rates shown. Dealer &amp; bulk pricing available — see below.
          </p>
        </div>
      </section>

      {/* ===== Why these / value props ===== */}
      <section className="section" style={{ background: "var(--paper-2)" }}>
        <div className="container">
          <div className="med-narrow" style={{ marginBottom: 28 }}>
            <h2 className="med-h2">Why a Voltec AC stabilizer</h2>
            <p className="med-body">
              Not a generic stabilizer — specially built for air conditioners, so your AC starts on a weak
              night grid and runs without straining the compressor.
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

      {/* ===== Wholesale strip ===== */}
      <section className="section hairline-top">
        <div className="container">
          <div
            style={{
              border: "1px solid var(--rule-strong)",
              borderRadius: 16,
              padding: "30px 26px",
              background: "var(--ink)",
              color: "#fff",
              display: "flex",
              flexWrap: "wrap",
              gap: 20,
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ maxWidth: "52ch" }}>
              <div className="mono" style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--steel-bright, oklch(70% 0.13 245))", marginBottom: 10 }}>
                Dealers &amp; bulk buyers
              </div>
              <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "clamp(24px,3vw,34px)", lineHeight: 1.1, margin: "0 0 10px" }}>
                Wholesale pricing in {WHOLESALE_CITIES.join(", ")}
              </h2>
              <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.6, color: "oklch(90% 0.02 250 / 0.85)" }}>
                Stocking up for the season? We supply dealers and bulk buyers at wholesale rates, with
                stock ready for the heat wave. Message us your quantity and city for a bulk quote.
              </p>
            </div>
            <WhatsAppButton productName="WHOLESALE AC stabilizers — bulk quote (qty + city)" variant="light">
              Get a bulk quote
            </WhatsAppButton>
          </div>
        </div>
      </section>

      {/* ===== Six built-in protections ===== */}
      <section className="section">
        <div className="container">
          <div className="med-narrow is-center" style={{ margin: "0 auto 24px", textAlign: "center" }}>
            <h2 className="med-h2" style={{ fontSize: "clamp(24px,3vw,34px)" }}>Six built-in protections</h2>
            <p className="med-body">Guards your AC against the full range of power faults — automatically.</p>
          </div>
          <div className="solar-prot">
            {["over-volt", "under-volt", "over-current", "over-temp", "short", "delay"].map((k) => {
              const pi = PROT_ICONS[k];
              if (!pi) return null;
              return (
                <div className="solar-prot-item" key={k}>
                  <div className="solar-prot-ic">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                      <path d={pi.d} />
                    </svg>
                  </div>
                  <span>{pi.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== Trust strip ===== */}
      <section className="section hairline-top hairline-bot">
        <div className="container">
          <h2 className="med-h2" style={{ textAlign: "center", marginBottom: 28 }}>
            Trusted across Pakistan for 40 years.
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
                Common <em>questions</em>.
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
            Keep your AC running all night.
          </h2>
          <p style={{ maxWidth: "50ch", margin: "0 auto 26px", fontSize: 16, lineHeight: 1.6, color: "oklch(85% 0.02 250 / 0.9)" }}>
            Tell us your AC size and city on WhatsApp. We&apos;ll confirm the right model and the price —
            same day, with delivery.
          </p>
          <WhatsAppButton productName="AC Stabilizer — help me pick (1/1.5 ton)" variant="light">
            Get my AC stabilizer
          </WhatsAppButton>
        </div>
      </section>
    </main>
  );
}
