import type { Metadata } from "next";
import Link from "next/link";
import { VOLTEC_WHATSAPP } from "@/lib/products";
import { WhatsAppIcon } from "@/components/icons";
import JsonLd from "@/components/JsonLd";
import { absUrl } from "@/lib/site";
import { getT } from "@/lib/i18n-server";

// Solutions → Solar & hybrid inverters. A plain-language landing page for the
// most common solar complaint we get on WhatsApp: a hybrid solar inverter that
// trips and shuts the whole house down when WAPDA voltage climbs too high. The
// fix is a Voltec SVC servo stabilizer (10/15/20 kVA) sitting between the grid
// and the inverter. Content is English (matches the site's content layer);
// chrome stays localized. NOTE: UR/AR body translation is a follow-up.

const wa = (text: string) =>
  `https://wa.me/${VOLTEC_WHATSAPP}?text=${encodeURIComponent(text)}`;
const WA_SIZE = wa(
  "Hi Voltec! My solar inverter keeps shutting down on high grid voltage. Can you recommend the right SVC stabilizer?",
);

// Match the stabilizer to the inverter — same kVA or one size up for headroom.
const SIZES: { kva: string; forText: string }[] = [
  { kva: "10 kVA", forText: "For a ~6–8 kVA hybrid inverter — a typical solar home." },
  { kva: "15 kVA", forText: "For a 10 kVA inverter, or a home with heavy AC + motor load." },
  { kva: "20 kVA", forText: "For a 12 kVA+ inverter, large home or small commercial setup." },
];

const WHY_VOLTEC: string[] = [
  "Holds a steady 220V output even when the grid climbs toward 300V",
  "100% pure-copper windings — not aluminium",
  "Smooth servo correction (±1%), not the rough jumps of cheap relay units",
  "Single-phase or 3-phase — sized to match your inverter",
  "Large contacts and a thermal-cutoff controller, built to run all day",
  "6-month warranty · pickup or delivery in Lahore",
];

const FAQS: { q: string; a: string }[] = [
  {
    q: "My solar inverter shuts down when the grid voltage goes high — will a stabilizer fix it?",
    a: "Yes. Hybrid solar inverters have a built-in high-voltage cutoff: when the incoming voltage climbs past their limit (often around 250–270V) they disconnect to protect themselves, and if your home runs on solar the whole house drops. A Voltec SVC servo stabilizer sits between the grid and your inverter and holds the output at a steady 220V even when the input is as high as ~300V — so the inverter never sees the over-voltage that trips it and stays online.",
  },
  {
    q: "What size stabilizer do I need for a 10 kVA solar inverter?",
    a: "Match the stabilizer to the inverter, or go one size up for headroom. For a 10 kVA inverter we usually recommend a 15–20 kVA SVC stabilizer. Tell us your inverter rating on WhatsApp and we'll size it exactly — there's no benefit to guessing.",
  },
  {
    q: "Why does the grid voltage get so high in the first place?",
    a: "It's common in Pakistan — voltage often rises well above 250V when load-shedding ends and the grid switches back, or on a lightly loaded line, especially in areas with a lot of solar feeding back. Your inverter is doing the right thing by cutting out to protect itself; the stabilizer simply gives it clean, in-range voltage so it doesn't have to.",
  },
  {
    q: "Single-phase or 3-phase?",
    a: "Whatever your inverter is. We build both. If you have a 3-phase hybrid inverter, you'll want a 3-phase SVC stabilizer.",
  },
  {
    q: "Is it pure copper?",
    a: "Yes — pure-copper windings, not aluminium. Copper runs cooler, lasts longer and handles the continuous load of a whole-home solar setup.",
  },
  {
    q: "Warranty and delivery?",
    a: "6-month warranty. Pickup from our Lahore facility, or delivery if you're in Lahore. Message us on WhatsApp and we'll confirm stock and timing.",
  },
];

export const metadata: Metadata = {
  title: "Solar Inverter Shutting Down on High Voltage? | Voltec SVC Stabilizers",
  description:
    "Hybrid solar inverter tripping when grid voltage goes high (250–270V+)? A Voltec SVC servo stabilizer (10/15/20 kVA) holds a steady 220V from inputs up to ~300V, so your inverter stays online. Pure copper, single or 3-phase, Lahore-made.",
  alternates: { canonical: "/solar" },
  openGraph: {
    type: "website",
    title: "Stop Solar Inverter High-Voltage Shutdowns | Voltec",
    description:
      "A Voltec SVC servo stabilizer keeps a steady 220V even when the grid climbs toward 300V — so your hybrid solar inverter stops cutting out.",
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

      {/* ===== Hero ===== */}
      <section className="page-head">
        <div className="container">
          <div className="crumbs">
            <Link href="/">{t("nav.home")}</Link> <span>/</span> <span>{t("nav.solutions")}</span>{" "}
            <span>/</span> <span>{t("nav.solar")}</span>
          </div>
          <div className="med-eyebrow">For solar &amp; hybrid inverter homes</div>
          <h1>Solar inverter shutting down on high voltage? Fix it with one stabilizer.</h1>
          <p className="page-lede" style={{ maxWidth: "62ch" }}>
            When the grid climbs to 250–270V — or spikes higher — a hybrid solar inverter trips on
            over-voltage to protect itself, and your whole house goes dark. A Voltec SVC servo
            stabilizer sits between the grid and your inverter and holds a steady 220V even from a 300V
            input, so the inverter never cuts out.
          </p>
          <div className="med-cta">
            <a href={WA_SIZE} target="_blank" rel="noopener" className="btn btn-wa">
              <WhatsAppIcon /> <span>Get sized for my inverter</span>
            </a>
            <Link href="/showcase/svc" className="btn btn-ghost">
              See the SVC range →
            </Link>
          </div>
        </div>
      </section>

      {/* ===== The problem ===== */}
      <section className="section hairline-top">
        <div className="container med-narrow">
          <h2 className="med-h2">Why your inverter keeps cutting out</h2>
          <p className="med-body">
            Every hybrid solar inverter has a high-voltage cutoff. When the incoming grid voltage rises
            past its limit — often around 250–270V, and in many areas it goes higher when load-shedding
            ends or the line is lightly loaded — the inverter disconnects to protect itself. That&apos;s
            the inverter doing its job. But if your home runs on solar, the whole house drops with it.
            You don&apos;t need a new inverter. You need to stop feeding it dangerous voltage.
          </p>
        </div>
      </section>

      {/* ===== The solution ===== */}
      <section className="section" style={{ background: "var(--paper-2)" }}>
        <div className="container med-narrow">
          <h2 className="med-h2">One stabilizer between the grid and your inverter</h2>
          <p className="med-body">
            A Voltec SVC servo stabilizer continuously reads the incoming voltage and corrects it to a
            steady 220V (±1%), even when the grid is as high as ~300V. Your inverter only ever sees
            clean, in-range voltage — so it stays online through the spikes that used to shut it down.
            It&apos;s the same servo technology that has kept ACs, motors and whole homes steady across
            Punjab for years, now sized for your solar setup.
          </p>
          <p className="med-note">
            Holds 220V from a high grid · pure-copper windings · smooth servo correction · single or
            3-phase.
          </p>
        </div>
      </section>

      {/* ===== Pick your size (10/15/20 kVA) ===== */}
      <section className="section hairline-top">
        <div className="container">
          <div className="med-narrow" style={{ marginBottom: 32 }}>
            <h2 className="med-h2">Pick the size that matches your inverter</h2>
            <p className="med-body">
              Match the stabilizer to your inverter&apos;s kVA, or step up one size for headroom. Not
              sure which? Send us your inverter rating and we&apos;ll size it for you — it takes a
              minute on WhatsApp.
            </p>
          </div>
          <div className="med-sizes">
            {SIZES.map((s) => (
              <div className="med-vs-card is-win" key={s.kva}>
                <div className="med-vs-tag">SVC · pure copper</div>
                <div className="med-size-kva">{s.kva}</div>
                <p style={{ margin: "10px 0 0", fontSize: 15, lineHeight: 1.5, color: "var(--ink)" }}>
                  {s.forText}
                </p>
              </div>
            ))}
          </div>
          <p className="med-scope">
            Also available in 5 kVA for smaller setups, and in larger three-phase ratings (100 kVA and
            up) for commercial solar. Tell us your load and we&apos;ll match it.
          </p>
        </div>
      </section>

      {/* ===== Why Voltec ===== */}
      <section className="section">
        <div className="container">
          <div className="med-narrow" style={{ marginBottom: 28 }}>
            <h2 className="med-h2">Why a Voltec SVC stabilizer</h2>
            <p className="med-body">
              Built for the continuous, whole-home load a solar house puts on it — not a cheap relay box
              that jumps in rough steps and burns out.
            </p>
          </div>
          <div className="med-grid">
            {WHY_VOLTEC.map((item) => (
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
                Solar owners <em>ask us</em>.
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
            Keep your house on, even when the grid spikes.
          </h2>
          <p style={{ maxWidth: "52ch", margin: "0 auto 26px", fontSize: 16, lineHeight: 1.6, color: "oklch(85% 0.02 250 / 0.9)" }}>
            Tell us your inverter rating and we&apos;ll recommend the exact SVC stabilizer — with a price
            and delivery, same day on WhatsApp.
          </p>
          <a href={WA_SIZE} target="_blank" rel="noopener" className="btn btn-wa" style={{ display: "inline-flex" }}>
            <WhatsAppIcon /> <span>Get sized for my inverter</span>
          </a>
        </div>
      </section>
    </main>
  );
}
