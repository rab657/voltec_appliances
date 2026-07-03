import type { Metadata } from "next";
import Link from "next/link";
import WhatsAppButton from "@/components/WhatsAppButton";
import { AC_MODELS as MODELS, fmtPKR } from "@/lib/ac-products";
import { PROT_ICONS } from "@/components/showcase/primitives";
import JsonLd from "@/components/JsonLd";
import { absUrl, SITE } from "@/lib/site";
import { getT } from "@/lib/i18n-server";

// Solutions → AC stabilizers. Plain-language landing page for the 2026 heat wave:
// solar runs ACs by day, but at night ACs fall back to the grid, where voltage
// sags — so the AC won't start or the compressor is at risk. A Voltec AC
// stabilizer boosts low voltage back to a steady 220V. Goal: read fast, pick a
// model by how low the voltage drops, message on WhatsApp. This page is the ad
// destination for the retail + wholesale AC campaigns.

// Buyable AC line (with prices) lives in lib/ac-products — shared with /checkout.


const VALUE_PROPS: { title: string; desc: string }[] = [
  { title: "Built for ACs — 10,000W", desc: "Sized and tuned for 1 and 1.5 ton air conditioners, inverter or normal." },
  { title: "99% pure copper transformer", desc: "Real copper, not aluminium — runs cooler and lasts for years." },
  { title: "Energy saver — 10% less current", desc: "Draws about 10% less current, so your AC runs on a lower electricity bill." },
  { title: "Starts your AC on low voltage", desc: "Boosts a weak night-time grid back to a steady 220V, so the AC starts and runs." },
  { title: "Protects the compressor", desc: "Low voltage burns AC compressors. Steady output keeps yours safe." },
  { title: "1 year warranty", desc: "Every unit is backed for a full year. We service what we sell." },
];

// Walk-in-first (2026-07): we currently serve Lahore only — showroom visits
// and Lahore delivery. No bulk / out-of-city sales for now.

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
    q: "Where can I buy? Do you deliver?",
    a: "Right now we serve Lahore — visit our showroom on Abid Market (10am–8pm) to see the stabilizers working, or order online for delivery within Lahore. Message us on WhatsApp and we'll help you pick the right model before you come.",
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
          <div className="ac-hero">
            <div>
              <div className="med-eyebrow">For homes with AC</div>
              <h1>Low voltage? AC keeps tripping?</h1>
              <p className="page-lede">
                In this heat wave your solar runs the AC all day. But at night there&apos;s no solar — the
                AC runs on the grid, and the voltage drops low. On low voltage your AC won&apos;t start, and
                the compressor can burn out. A Voltec AC stabilizer boosts that weak voltage back to a
                steady 220V — so your AC runs cool all night, and the compressor stays safe.
              </p>
              <div className="med-cta">
                <WhatsAppButton productName="AC Stabilizer — help me pick (1/1.5 ton)" lead>
                  Get my AC stabilizer <span className="arrow" style={{ marginLeft: 4 }}>→</span>
                </WhatsAppButton>
              </div>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="ac-hero-img"
              src="/assets/ac-bedroom.webp"
              alt="A Voltec AC stabilizer keeping the bedroom AC running through a low-voltage night"
            />
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
          <div className="ac-models">
            {MODELS.map((m) => (
              <div key={m.code} className={`ac-mcard${m.popular ? " is-popular" : ""}`}>
                <div className="ac-mcard-media">
                  {m.badge && <span className="ac-mcard-badge">{m.badge}</span>}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.image} alt={`Voltec ${m.code} AC voltage stabilizer`} />
                </div>
                <div className="ac-mcard-body">
                  <div className="ac-mcard-name">Voltec {m.code}</div>
                  <div className="ac-mcard-from">Works from {m.fromV}</div>
                  <ul className="ac-mcard-feats">
                    {[m.fits, "10,000W · 99% pure copper", "Energy saver — ~10% less current", "1 year warranty"].map((f) => (
                      <li key={f}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="ac-mcard-foot">
                    <div className="ac-mcard-price">
                      <b>{fmtPKR(m.price)}</b>
                      <span>per unit</span>
                    </div>
                    <Link href={`/checkout?model=${m.code}`} className="btn btn-primary ac-card-cta" style={{ justifyContent: "center" }}>
                      Buy {m.code} now →
                    </Link>
                    <WhatsAppButton
                      productName={`the Voltec A-100 ${m.code} AC Stabilizer (10,000W, works from ${m.fromV})`}
                      variant="light"
                      className="ac-card-cta"
                      lead
                    >
                      Ya WhatsApp par poochein
                    </WhatsAppButton>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="med-scope" style={{ marginTop: 22 }}>
            Pick by how low your voltage drops at night. Or visit our Lahore showroom — details below.
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

      {/* ===== Lahore showroom strip ===== */}
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
                Visit us in Lahore
              </div>
              <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "clamp(24px,3vw,34px)", lineHeight: 1.1, margin: "0 0 10px" }}>
                See it working at our Abid Market showroom
              </h2>
              <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.6, color: "oklch(90% 0.02 250 / 0.85)" }}>
                Open 10am–8pm. Watch the stabilizer hold 220V on a live low-voltage demo, get free
                advice on the right model for your AC, and take yours home the same day.
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-start" }}>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(SITE.mapsQuery)}`}
                target="_blank"
                rel="noopener"
                className="btn btn-ghost-light"
              >
                Get directions →
              </a>
              <WhatsAppButton productName="AC Stabilizer — showroom visit (Lahore)" variant="light" lead>
                WhatsApp before you come
              </WhatsAppButton>
            </div>
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
            Tell us your AC size on WhatsApp. We&apos;ll confirm the right model the same day —
            then pick it up at our Lahore showroom, or get it delivered within Lahore.
          </p>
          <WhatsAppButton productName="AC Stabilizer — help me pick (1/1.5 ton)" variant="light" lead>
            Get my AC stabilizer
          </WhatsAppButton>
        </div>
      </section>
    </main>
  );
}
