import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import { absUrl } from "@/lib/site";
import { getT } from "@/lib/i18n-server";
import { SIZING_ROBOTS, sizeStabilizer } from "@/lib/sizing";
import SizingReviewBanner from "@/components/SizingReviewBanner";
import { PRESET_GROUPS, SIZING_PRESETS } from "@/lib/sizing-presets";

// Hub for the /stabilizer-size/* answer pages: one table, every common
// question with its answer on screen, so a single fetch gives an answer engine
// the whole sizing guide.

const TITLE = "What Size Stabilizer Do I Need? — Sizes for AC, Home & Solar (Pakistan)";
const DESCRIPTION =
  "Stabilizer sizes worked out for Pakistani homes: one AC, 5 marla, 10 marla, 1 kanal, UPS homes, shops and 5–12 kW solar inverters. kVA, model and input range for each, with the working shown.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/stabilizer-size" },
  robots: SIZING_ROBOTS,
  openGraph: { type: "website", title: TITLE, description: DESCRIPTION, url: absUrl("/stabilizer-size") },
};

const cell: React.CSSProperties = { padding: "12px 8px", borderBottom: "1px solid var(--rule)", verticalAlign: "top", textAlign: "left" };
const head: React.CSSProperties = { ...cell, fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-3)", borderBottom: "1px solid var(--rule-strong)" };

export default async function SizingHubPage() {
  const t = await getT();
  const rows = SIZING_PRESETS.map((p) => ({ p, r: sizeStabilizer(p.input) }));

  return (
    <main>
      <SizingReviewBanner />
      <JsonLd
        id="ld-size-hub"
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Stabilizer sizes for Pakistani homes, shops and solar inverters",
          itemListElement: rows.map(({ p }, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: p.question,
            url: absUrl(`/stabilizer-size/${p.slug}`),
          })),
        }}
      />

      <section className="page-head">
        <div className="container">
          <div className="crumbs">
            <Link href="/">{t("nav.home")}</Link> <span>/</span> <span>Stabilizer sizes</span>
          </div>
          <div className="med-eyebrow">Sizing guide · working shown</div>
          <h1>What size stabilizer do I need?</h1>
          <p className="page-lede" style={{ maxWidth: "62ch" }}>
            Find your situation below. Each answer adds the running load, adds 25% for the start-up
            surge, and picks the smallest Voltec model that covers it. For your exact load, use the{" "}
            <Link href="/stabilizer-size-calculator">size calculator</Link>.
          </p>
        </div>
      </section>

      {PRESET_GROUPS.map((g) => {
        const list = rows.filter((x) => x.p.group === g.id);
        return (
          <section key={g.id} className="section hairline-top">
            <div className="container">
              <h2 className="med-h2">{g.label}</h2>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 15 }}>
                <thead>
                  <tr>
                    <th style={head}>Situation</th>
                    <th style={{ ...head, whiteSpace: "nowrap" }}>You need</th>
                    <th style={head}>Voltec model</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map(({ p, r }) => (
                    <tr key={p.slug}>
                      <td style={cell}>
                        <Link href={`/stabilizer-size/${p.slug}`}>{p.label}</Link>
                      </td>
                      <td style={{ ...cell, whiteSpace: "nowrap" }}>{r.requiredKva} kVA</td>
                      <td style={cell}>
                        {r.recommended ? <Link href={r.recommended.path}>{r.recommended.name}</Link> : "Ask on WhatsApp"}
                        <span style={{ display: "block", marginTop: 4, fontSize: 13, color: "var(--ink-3)" }}>{r.inputRange}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}
    </main>
  );
}
