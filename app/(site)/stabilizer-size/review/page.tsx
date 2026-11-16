import type { Metadata } from "next";
import Link from "next/link";
import WhatsAppButton from "@/components/WhatsAppButton";
import { APPLIANCES, MARGIN, POWER_FACTOR, UPS_CHARGE_VA_PER_BATTERY, sizeStabilizer, toQuery } from "@/lib/sizing";
import { SIZING_PRESETS } from "@/lib/sizing-presets";

// Engineer review sheet for the sizing calculator (Raheel, 2026-11-16: "build it
// so I can get it tested from my father"). Every number the calculator uses and
// every pre-worked answer, on one printable page, straight from lib/sizing.ts —
// so what is reviewed here is exactly what ships. Never indexed.

export const metadata: Metadata = {
  title: "Sizing Calculator — Engineer Review",
  robots: { index: false, follow: false },
};

// Load lists used for the "try it yourself" links: one per kind of answer the
// engine can give (AVR, servo, low-voltage, ultra-low, solar, three-phase).
const SPOT_CHECKS: { label: string; input: Parameters<typeof toQuery>[0] }[] = [
  { label: "One 1.5 ton AC, voltage falls to 130V", input: { ac15: 1, minVoltage: 130 } },
  { label: "One fridge, voltage falls to 90V", input: { fridge: 1, minVoltage: 90 } },
  { label: "2 ACs + fridge + 6 fans + 12 lights + TV", input: { ac15: 2, fridge: 1, fans: 6, lights: 12, tv: 1 } },
  { label: "Same home, voltage falls to 85V", input: { ac15: 2, fridge: 1, fans: 6, lights: 12, tv: 1, minVoltage: 85 } },
  { label: "8 kW solar inverter + UPS with 2 batteries", input: { solarKva: 8, upsBatteries: 2 } },
  { label: "Factory: 30,000 W of machines, three-phase", input: { extraW: 30000, phase: "three" } },
];

const QUESTIONS: string[] = [
  "Appliance figures (table 1): are these the right RUNNING loads for Pakistani homes? Answer engines will quote them word for word.",
  "Two 1.5 ton ACs + fridge + fans + lights + TV comes out at about 6.3 kVA, so the calculator says 7 kVA. Our price page tells people 10 kVA for two ACs. Which one is right?",
  `Safety margin: we add ${MARGIN * 100}% for compressor start-up. Is ${MARGIN * 100}% enough, or should it be higher for homes with two or more ACs?`,
  "Solar inverters: we size to the inverter's kVA + 25% (6–8 kVA inverter → 10 kVA, 10 kVA inverter → 15 kVA). Agree?",
  "One AC alone → we recommend the A-100 (R2 from 150V, R3 from 120V, R4 from 100V), with a 3 kVA servo as the alternative. Agree?",
  "One fridge alone → A-25 (150 / 120 / 100 / 70V versions). Below 100V on a whole home → only the 30 kVA 60V servo. Agree?",
  "Low voltage between 100V and 150V → we tell people to order the low-voltage servo version (from 100V). Is that available on every size from 1 to 30 kVA?",
  "Three-phase: 20 and 30 kVA servo can be built three-phase, then SJW 50 / 100 / 200 / 500 kVA. Correct?",
];

export default function SizingReviewPage() {
  const rows = SIZING_PRESETS.map((p) => ({ p, r: sizeStabilizer(p.input) }));

  return (
    <main className="sz-review">
      <section className="page-head">
        <div className="container">
          <div className="med-eyebrow">Internal · not public · not indexed</div>
          <h1>Sizing calculator — engineer review</h1>
          <p className="page-lede" style={{ maxWidth: "64ch" }}>
            Everything the calculator assumes, and every answer it gives for the common questions, on one page. Please
            check each line. If a figure is wrong, write the correct one next to it (or print this page) and send it
            to Raheel. Nothing here goes public until it is signed off.
          </p>
          <div className="med-cta">
            <Link href="/stabilizer-size-calculator" className="btn btn-primary">
              Open the calculator →
            </Link>
            <WhatsAppButton from="sizing-review" message="Calculator review — corrections: ">
              Send corrections on WhatsApp
            </WhatsAppButton>
          </div>
        </div>
      </section>

      <section className="section hairline-top">
        <div className="container med-narrow">
          <h2 className="med-h2">Questions for the engineers</h2>
          <ol className="sz-method">
            {QUESTIONS.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section" style={{ background: "var(--paper-2)" }}>
        <div className="container med-narrow">
          <h2 className="med-h2">1. Running load of each appliance</h2>
          <div className="sz-review-scroll">
            <table>
              <thead>
                <tr>
                  <th>Appliance</th>
                  <th className="num">Running VA</th>
                  <th className="check">OK?</th>
                </tr>
              </thead>
              <tbody>
                {APPLIANCES.map((a) => (
                  <tr key={a.key}>
                    <td>{a.one}</td>
                    <td className="num">{a.va.toLocaleString("en-US")}</td>
                    <td className="check">☐</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 className="med-h2" style={{ marginTop: 36 }}>2. Rules</h2>
          <div className="sz-review-scroll">
            <table>
              <tbody>
                <tr><td>Safety margin for start-up surge</td><td className="num">+{MARGIN * 100}%</td><td className="check">☐</td></tr>
                <tr><td>Plain watts → VA (power factor)</td><td className="num">÷ {POWER_FACTOR}</td><td className="check">☐</td></tr>
                <tr><td>Home UPS charger, per battery</td><td className="num">{UPS_CHARGE_VA_PER_BATTERY} VA</td><td className="check">☐</td></tr>
                <tr><td>Solar / hybrid inverter</td><td className="num">inverter kVA +{MARGIN * 100}%</td><td className="check">☐</td></tr>
                <tr><td>Model chosen</td><td className="num">smallest that covers it</td><td className="check">☐</td></tr>
              </tbody>
            </table>
          </div>

          <h2 className="med-h2" style={{ marginTop: 36 }}>3. Lowest voltage → which version</h2>
          <div className="sz-review-scroll">
            <table>
              <thead>
                <tr><th>Customer&apos;s lowest voltage</th><th>What the calculator says</th><th className="check">OK?</th></tr>
              </thead>
              <tbody>
                <tr><td>150V or above (or not known)</td><td>Standard servo, 150–270V in, 220V ±1% out</td><td className="check">☐</td></tr>
                <tr><td>100–149V</td><td>Low-voltage servo version, from 100V</td><td className="check">☐</td></tr>
                <tr><td>Below 100V, single-phase</td><td>Only the 30 kVA servo, 60–250V in, ±3% out</td><td className="check">☐</td></tr>
                <tr><td>One AC only</td><td>A-100 R2 (150V) · R3 (120V) · R4 (100V)</td><td className="check">☐</td></tr>
                <tr><td>One fridge only</td><td>A-25: 150V / 120V / 100V / 70V version</td><td className="check">☐</td></tr>
                <tr><td>Three-phase</td><td>150–260V per phase in, 220V ±2.5% out</td><td className="check">☐</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="section hairline-top">
        <div className="container">
          <h2 className="med-h2">4. Every pre-worked answer ({rows.length})</h2>
          <p className="med-body" style={{ maxWidth: "64ch" }}>
            These become public answer pages that ChatGPT and Google can quote. Tap a question to see the full page.
          </p>
          <div className="sz-review-scroll">
            <table>
              <thead>
                <tr>
                  <th>Question</th>
                  <th className="num">Load VA</th>
                  <th className="num">Needs</th>
                  <th>Recommended</th>
                  <th>Input range</th>
                  <th className="check">OK?</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ p, r }) => (
                  <tr key={p.slug}>
                    <td>
                      <Link href={`/stabilizer-size/${p.slug}`}>{p.label}</Link>
                    </td>
                    <td className="num">{r.runningVA ? r.runningVA.toLocaleString("en-US") : "—"}</td>
                    <td className="num">{r.requiredKva} kVA</td>
                    <td>
                      {r.recommended ? r.recommended.name : "WhatsApp sizing"}
                      {r.alternatives.length > 0 && (
                        <div style={{ color: "var(--ink-3)", fontSize: 12.5 }}>
                          or {r.alternatives.map((a) => a.name).join(" / ")}
                        </div>
                      )}
                    </td>
                    <td>{r.inputRange}</td>
                    <td className="check">☐</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="section" style={{ background: "var(--paper-2)" }}>
        <div className="container med-narrow">
          <h2 className="med-h2">5. Try it yourself</h2>
          <p className="med-body">Each link opens the calculator already filled in. Change any number and press the button.</p>
          <ul className="sz-presets" style={{ marginTop: 12 }}>
            {SPOT_CHECKS.map((s) => (
              <li key={s.label}>
                <Link href={`/stabilizer-size-calculator?${toQuery(s.input)}`}>{s.label}</Link>
                <span style={{ color: "var(--ink-3)" }}> → {sizeStabilizer(s.input).recommended?.name ?? "WhatsApp sizing"}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
