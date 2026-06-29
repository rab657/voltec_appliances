import type { Metadata } from "next";
import Link from "next/link";
import { VOLTEC_WHATSAPP } from "@/lib/products";
import { WhatsAppIcon } from "@/components/icons";
import JsonLd from "@/components/JsonLd";
import { absUrl } from "@/lib/site";
import { getT } from "@/lib/i18n-server";

// Solutions → Solar. A plain-language landing page for non-technical Pakistani
// solar owners whose hybrid inverter shuts down when grid voltage goes high.
// Goal: super easy to read, answer the question fast, ONE CTA (WhatsApp).
// Keep the language simple — no "over-voltage", "servo", "±1%", "kVA matching".
// Content is English (the site's content layer); chrome stays localized.

const wa = (text: string) =>
  `https://wa.me/${VOLTEC_WHATSAPP}?text=${encodeURIComponent(text)}`;
// Single, repeated call to action across the whole page.
const WA_HELP = wa(
  "Hi Voltec, my solar inverter keeps shutting down when the voltage is high. Which stabilizer do I need?",
);
const CTA_LABEL = "Message us on WhatsApp";

const BENEFITS: string[] = [
  "No more sudden shutdowns — your inverter stays on",
  "Your appliances are safe — no surge reaches them, nothing gets blown",
  "Works even when the voltage is very high",
  "100% pure copper inside — built to last",
];

// Inverter size → the stabilizer that handles it (about 1.5× for headroom on a
// high-voltage line). Confirmed by the owner.
const SIZES: { svc: string; inv: string }[] = [
  { svc: "10 kVA", inv: "6–8 kVA inverter" },
  { svc: "15 kVA", inv: "10 kVA inverter" },
  { svc: "20 kVA", inv: "15 kVA inverter" },
];

const WHY: string[] = [
  "100% pure copper inside — lasts much longer",
  "Works on very high voltage (up to 300V)",
  "6-month warranty",
  "Delivery in Lahore, or pickup",
  "Free advice — we help you choose the right size",
];

const FAQS: { q: string; a: string }[] = [
  {
    q: "Will a stabilizer really stop my inverter from shutting down?",
    a: "Yes. The stabilizer keeps the voltage at a safe, steady level. So your inverter never sees the high voltage that makes it switch off — and it stays on.",
  },
  {
    q: "Can high voltage damage my appliances, not just the inverter?",
    a: "Yes — and this is the real danger. When the voltage spikes, many inverters switch to the grid (bypass) and send that high voltage straight to your sockets. Your TV, fridge, ACs and other appliances can get blown in seconds. A stabilizer keeps the voltage steady, so the surge never reaches them.",
  },
  {
    q: "What size do I need for my inverter?",
    a: "It depends on your inverter. A 6–8 kVA inverter needs a 10 kVA stabilizer, a 10 kVA inverter needs a 15 kVA, and a 15 kVA inverter needs a 20 kVA. We make both single-phase and 3-phase. Tell us your inverter size on WhatsApp and we'll confirm it — free.",
  },
  {
    q: "Is it pure copper?",
    a: "Yes — 100% pure copper inside. Copper stays cooler and lasts much longer than cheaper aluminium units.",
  },
  {
    q: "Do you deliver? What about warranty?",
    a: "We deliver in Lahore, or you can pick up. Every stabilizer comes with a 6-month warranty. Message us and we'll arrange it.",
  },
];

export const metadata: Metadata = {
  title: "Solar Inverter Keeps Shutting Down? The Easy Fix | Voltec",
  description:
    "Is your solar inverter switching off when the voltage goes high? A Voltec stabilizer keeps the voltage steady so your inverter stays on. Pure copper, 6-month warranty, delivery in Lahore. Message us on WhatsApp.",
  alternates: { canonical: "/solar" },
  openGraph: {
    type: "website",
    title: "Solar Inverter Keeps Shutting Down? The Easy Fix | Voltec",
    description:
      "A Voltec stabilizer keeps your voltage steady, so your solar inverter stops shutting down. Message us on WhatsApp.",
    url: absUrl("/solar"),
    // OWNER: add a solar OG image when available — falls back to the site default card.
  },
};

export default async function SolarPage() {
  const t = await getT();

  return (
    <main>
      <JsonLd
        id="ld-solar-faq"
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

      {/* ===== Hero — ask their question, give the answer, one CTA ===== */}
      <section className="page-head">
        <div className="container">
          <div className="crumbs">
            <Link href="/">{t("nav.home")}</Link> <span>/</span> <span>{t("nav.solutions")}</span>{" "}
            <span>/</span> <span>{t("nav.solar")}</span>
          </div>
          <div className="med-eyebrow">For solar homes</div>
          <h1>Solar inverter keeps shutting down?</h1>
          <p className="page-lede" style={{ maxWidth: "58ch" }}>
            When your area&apos;s voltage goes too high, your solar inverter can shut down — and your
            whole house goes dark. Worse, that high voltage can pass straight through to your appliances
            and blow them. A Voltec stabilizer stops both. It keeps the voltage steady and safe, so your
            inverter stays on and nothing gets damaged.
          </p>
          <div className="med-cta">
            <a href={WA_HELP} target="_blank" rel="noopener" className="btn btn-wa">
              <WhatsAppIcon /> <span>{CTA_LABEL}</span>
            </a>
          </div>
        </div>
      </section>

      {/* ===== Why + the fix ===== */}
      <section className="section hairline-top">
        <div className="container">
          <div className="med-narrow" style={{ marginBottom: 28 }}>
            <h2 className="med-h2">Why this happens — and how we fix it</h2>
            <p className="med-body">
              In many areas the voltage often goes too high — above 250 volts. When it does, one of two
              things happens — and both are bad. Your inverter shuts off to protect itself, and your
              whole house goes dark. Or it switches over to the grid (the bypass), sending that same high
              voltage straight to your sockets — and your TV, fridge, ACs and anything plugged in can get
              blown in seconds.
            </p>
            <p className="med-body" style={{ marginTop: 14 }}>
              A Voltec stabilizer sits between the grid and your inverter. It brings the high voltage
              down to a safe, steady level before it can reach your inverter or your appliances. So your
              inverter keeps running — and nothing gets blown.
            </p>
          </div>
          <div className="med-grid">
            {BENEFITS.map((item) => (
              <div className="med-grid-item" key={item}>
                <span className="med-check" aria-hidden="true">
                  ✓
                </span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Which size ===== */}
      <section className="section" style={{ background: "var(--paper-2)" }}>
        <div className="container">
          <div className="med-narrow" style={{ marginBottom: 28 }}>
            <h2 className="med-h2">Which size do you need?</h2>
            <p className="med-body">
              Find your inverter size below — that&apos;s the stabilizer you need. Not sure? Just send us
              your inverter size on WhatsApp and we&apos;ll confirm it for you, free.
            </p>
          </div>
          <div className="med-sizes">
            {SIZES.map((s) => (
              <div className="med-vs-card is-win" key={s.svc}>
                <div className="med-vs-tag">For a {s.inv}</div>
                <div className="med-size-kva">{s.svc}</div>
                <p style={{ margin: "8px 0 0", fontSize: 15.5, lineHeight: 1.5, color: "var(--ink-2)" }}>
                  stabilizer · pure copper
                </p>
              </div>
            ))}
          </div>
          <p className="med-scope">
            Single-phase or 3-phase — we make both, and we&apos;ll match whatever your inverter is. Got a
            different size? Just ask.
          </p>
        </div>
      </section>

      {/* ===== Why Voltec ===== */}
      <section className="section">
        <div className="container">
          <div className="med-narrow" style={{ marginBottom: 24 }}>
            <h2 className="med-h2">Why buy from Voltec</h2>
          </div>
          <div className="med-grid">
            {WHY.map((item) => (
              <div className="med-grid-item" key={item}>
                <span className="med-check" aria-hidden="true">
                  ✓
                </span>
                <span>{item}</span>
              </div>
            ))}
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
            Stop the shutdowns. Keep your house running.
          </h2>
          <p style={{ maxWidth: "48ch", margin: "0 auto 26px", fontSize: 16, lineHeight: 1.6, color: "oklch(85% 0.02 250 / 0.9)" }}>
            Send us your inverter size on WhatsApp. We&apos;ll tell you the right stabilizer and the
            price — same day.
          </p>
          <a href={WA_HELP} target="_blank" rel="noopener" className="btn btn-wa" style={{ display: "inline-flex" }}>
            <WhatsAppIcon /> <span>{CTA_LABEL}</span>
          </a>
        </div>
      </section>
    </main>
  );
}
