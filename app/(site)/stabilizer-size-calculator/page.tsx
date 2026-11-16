import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import JsonLd from "@/components/JsonLd";
import SizingAnswer from "@/components/SizingAnswer";
import { absUrl } from "@/lib/site";
import { getT } from "@/lib/i18n-server";
import { APPLIANCES, METHOD, SIZING_ROBOTS, parseSizingParams, sizeStabilizer, toQuery } from "@/lib/sizing";
import SizingReviewBanner from "@/components/SizingReviewBanner";
import { SIZING_PRESETS } from "@/lib/sizing-presets";

// Stabilizer size calculator — server-rendered from the URL.
//
// WHY (2026-11-13): customers now arrive with a spec written by ChatGPT. Answer
// engines fetch pages; they do not run our JavaScript. So this is a plain GET
// form: every result has its own URL (?ac15=2&fridge=1&min_v=140) whose HTML
// already holds the answer, works with JavaScript off, and can be pasted into
// WhatsApp. The maths lives in lib/sizing.ts (shared with /stabilizer-size/*,
// /api/v1/stabilizer-size and llms.txt). No prices here — price is on WhatsApp.

const TITLE = "Stabilizer Size Calculator — What kVA Do I Need? (Pakistan)";
const DESCRIPTION =
  "Free stabilizer size calculator for Pakistani homes, shops and solar inverters. Enter your ACs, fridge, fans and lowest voltage — get the kVA you need and the right Voltec servo or AC stabilizer, with the working shown.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  // Every result URL points back here, so search engines index one page, not
  // thousands of load combinations. AI fetchers still read the result HTML.
  alternates: { canonical: "/stabilizer-size-calculator" },
  robots: SIZING_ROBOTS,
  openGraph: { type: "website", title: TITLE, description: DESCRIPTION, url: absUrl("/stabilizer-size-calculator") },
};

const FAQS = [
  {
    q: "How do I calculate what size stabilizer I need?",
    a: "Add up the running load of everything that runs at the same time (1.5 ton AC about 1,800 VA, fridge about 400 VA, fan about 100 VA), add 25% for the start-up surge, and pick the smallest model at least that big. For a solar inverter, use the inverter's kVA plus 25%. Then choose the input range by the lowest voltage you see.",
  },
  {
    q: "What size stabilizer do I need for one AC?",
    a: "One 1 or 1.5 ton AC needs about 1.5–2.3 kVA with margin. The Voltec A-100 (10,000 W) is built for one AC: R2 works from 150V, R3 from 120V and R4 from 100V. A 3 kVA servo also fits if you want ±1% output.",
  },
  {
    q: "What size stabilizer for a house with two ACs?",
    a: "Two 1.5 ton ACs with a fridge, fans and lights come to about 6–7 kVA, so a 7 kVA servo fits and a 10 kVA gives room to add more. A 10 marla house with a freezer and water motor needs about 10 kVA.",
  },
  {
    q: "What size stabilizer for a solar inverter?",
    a: "Size it to the inverter, because the whole house load passes through it: inverter kVA plus 25%. A 6–8 kVA inverter needs a 10 kVA servo, and a 10–12 kVA inverter needs 15 kVA. Set the inverter to its wide input range first.",
  },
  {
    q: "Does low voltage change the size I need?",
    a: "It changes the input range more than the size. A standard servo works from 150V. If your voltage drops lower, order the low-voltage version (from 100V). Below 100V, only the Voltec 30 kVA ultra-low-voltage servo works, from 60V.",
  },
];

const cellIn: React.CSSProperties = { width: "100%" };

export default async function StabilizerCalculatorPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const t = await getT();
  const sp = await searchParams;
  const input = parseSizingParams(sp);
  // The no-JS GET form submits every field, empty ones too (?ac1=&ac2=&…).
  // Redirect to the short URL so a shared link stays readable; the browser
  // keeps the #answer fragment across the redirect.
  if (Object.values(sp).some((v) => v === "")) {
    const short = toQuery(input);
    redirect(`/stabilizer-size-calculator${short ? `?${short}` : ""}`);
  }
  const r = sizeStabilizer(input);
  const val = (n: number) => (n ? String(n) : "");
  const exampleQuery = toQuery({ ac15: 2, fridge: 1, fans: 6, lights: 12, minVoltage: 140 });

  return (
    <main>
      <SizingReviewBanner />
      <JsonLd
        id="ld-calc"
        data={[
          {
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Voltec stabilizer size calculator",
            url: absUrl("/stabilizer-size-calculator"),
            applicationCategory: "UtilitiesApplication",
            operatingSystem: "Any",
            description: DESCRIPTION,
            isAccessibleForFree: true,
            offers: { "@type": "Offer", price: "0", priceCurrency: "PKR" },
            provider: { "@type": "Organization", name: "Voltec Appliances", url: absUrl("/") },
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
          },
        ]}
      />

      <section className="page-head">
        <div className="container">
          <div className="crumbs">
            <Link href="/">{t("nav.home")}</Link> <span>/</span> <span>Size calculator</span>
          </div>
          <div className="med-eyebrow">Free · 1 minute · working shown</div>
          <h1>Stabilizer size calculator</h1>
          <p className="page-lede" style={{ maxWidth: "62ch" }}>
            Enter what runs at the same time on a hot evening and the lowest voltage you see. We show
            the kVA you need, the right Voltec model, and how we worked it out.
          </p>
        </div>
      </section>

      {r.hasLoad && (
        <section className="section hairline-top" style={{ paddingTop: 32 }}>
          <div className="container">
            <SizingAnswer r={r} from="calculator" />
          </div>
        </section>
      )}

      <section className={`section ${r.hasLoad ? "" : "hairline-top"}`} style={{ background: r.hasLoad ? "var(--paper-2)" : undefined }}>
        <div className="container">
          <h2 className="med-h2">{r.hasLoad ? "Change your load" : "Your load"}</h2>
          <form method="get" action="/stabilizer-size-calculator#answer" className="sz-form">
            <fieldset>
              <legend>Air conditioners</legend>
              <div className="sz-grid">
                {APPLIANCES.filter((a) => a.group === "ac").map((a) => (
                  <label key={a.key} className="sz-field">
                    <span>{a.label}</span>
                    <input type="number" name={a.key} min={0} max={99} inputMode="numeric" placeholder="0" defaultValue={val(input[a.key])} style={cellIn} />
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend>Home and kitchen</legend>
              <div className="sz-grid">
                {APPLIANCES.filter((a) => a.group === "home").map((a) => (
                  <label key={a.key} className="sz-field">
                    <span>{a.label}</span>
                    <input type="number" name={a.key} min={0} max={99} inputMode="numeric" placeholder="0" defaultValue={val(input[a.key])} style={cellIn} />
                  </label>
                ))}
                <label className="sz-field">
                  <span>Anything else (watts)</span>
                  <input type="number" name="extra_w" min={0} inputMode="numeric" placeholder="0" defaultValue={val(input.extraW)} style={cellIn} />
                </label>
              </div>
            </fieldset>

            <fieldset>
              <legend>UPS, solar and your supply</legend>
              <div className="sz-grid">
                <label className="sz-field">
                  <span>Home UPS batteries</span>
                  <select name="ups_batt" defaultValue={val(input.upsBatteries)} style={cellIn}>
                    <option value="">No UPS</option>
                    {[1, 2, 3, 4].map((n) => (
                      <option key={n} value={n}>
                        {n} batter{n === 1 ? "y" : "ies"}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="sz-field">
                  <span>Solar / hybrid inverter</span>
                  <select name="solar_kva" defaultValue={val(input.solarKva)} style={cellIn}>
                    <option value="">No solar inverter</option>
                    {[3, 4, 5, 6, 8, 10, 12, 15, 20].map((n) => (
                      <option key={n} value={n}>
                        {n} kW / kVA
                      </option>
                    ))}
                  </select>
                </label>
                <label className="sz-field">
                  <span>Lowest voltage you see</span>
                  <select name="min_v" defaultValue={val(input.minVoltage)} style={cellIn}>
                    <option value="">Not sure</option>
                    {input.minVoltage > 0 && ![180, 160, 140, 120, 110, 100, 80].includes(input.minVoltage) && (
                      <option value={input.minVoltage}>About {input.minVoltage}V</option>
                    )}
                    <option value="180">Above 170V</option>
                    <option value="160">150–170V</option>
                    <option value="140">About 140V</option>
                    <option value="120">About 120V</option>
                    <option value="110">About 110V</option>
                    <option value="100">About 100V</option>
                    <option value="80">Below 100V</option>
                  </select>
                </label>
                <label className="sz-field">
                  <span>Supply</span>
                  <select name="phase" defaultValue={input.phase === "three" ? "three" : ""} style={cellIn}>
                    <option value="">Single-phase (most homes)</option>
                    <option value="three">Three-phase</option>
                  </select>
                </label>
              </div>
            </fieldset>

            <div className="sz-submit">
              <button type="submit" className="btn btn-primary">
                Calculate my size
              </button>
              {r.hasLoad && (
                <Link href="/stabilizer-size-calculator" className="btn btn-ghost">
                  Start again
                </Link>
              )}
            </div>
          </form>
        </div>
      </section>

      <section className="section hairline-top">
        <div className="container med-narrow">
          <h2 className="med-h2">How the calculator works</h2>
          <ol className="sz-method">
            {METHOD.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ol>
          <p className="med-body" style={{ marginTop: 16 }}>
            These are typical figures for Pakistani homes. If you are not sure, send your appliance
            list and your voltage readings on WhatsApp and our team will size it. Every Voltec
            stabilizer has a 1-year warranty. Prices are quoted on WhatsApp — see{" "}
            <Link href="/voltage-stabilizer-price-in-pakistan">stabilizer prices</Link>.
          </p>
        </div>
      </section>

      <section className="section" style={{ background: "var(--paper-2)" }}>
        <div className="container">
          <h2 className="med-h2">Common sizes, already worked out</h2>
          <ul className="sz-presets">
            {SIZING_PRESETS.map((p) => (
              <li key={p.slug}>
                <Link href={`/stabilizer-size/${p.slug}`}>{p.question}</Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section hairline-top">
        <div className="container med-narrow">
          <h2 className="med-h2">Link a result, or use it from an app</h2>
          <p className="med-body">
            Every result has its own link. Put the load in the address and the page shows the answer,
            for example two 1.5 ton ACs, a fridge, six fans and twelve lights with voltage down to 140V:
          </p>
          <p className="sz-code">
            <Link href={`/stabilizer-size-calculator?${exampleQuery}#answer`}>
              {absUrl(`/stabilizer-size-calculator?${exampleQuery}`)}
            </Link>
          </p>
          <p className="med-body">
            The same answer is available as JSON for AI assistants and developers at{" "}
            <code>{absUrl(`/api/v1/stabilizer-size?${exampleQuery}`)}</code> (described in{" "}
            <a href="/openapi.json">openapi.json</a>). Keys:{" "}
            {APPLIANCES.map((a) => a.key).join(", ")}, extra_w, ups_batt, solar_kva, min_v, phase=three.
          </p>
        </div>
      </section>

      <section className="section" style={{ background: "var(--paper-2)" }}>
        <div className="container">
          <div className="faq-wrap">
            <div className="faq-aside">
              <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "clamp(30px,3.6vw,46px)", lineHeight: 1.02, letterSpacing: "-0.02em", margin: 0 }}>
                Sizing <em>questions</em>.
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
