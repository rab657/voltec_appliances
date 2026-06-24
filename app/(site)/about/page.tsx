import type { Metadata } from "next";
import Link from "next/link";
import Placeholder from "@/components/Placeholder";
import { getT } from "@/lib/i18n-server";

export const metadata: Metadata = {
  title: "About — 30 years of steady power",
  description:
    "Voltec was founded in Lahore in 1995 by Riaz Ahmad, one of Pakistan's top voltage stabilizer makers and servo motor specialists. Today we serve Pakistan, the UAE and China.",
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  const t = await getT();
  const TIMELINE: [string, string, string][] = [
    ["1995", t("about.tl1.t"), t("about.tl1.d")],
    ["2000s", t("about.tl2.t"), t("about.tl2.d")],
    ["2010s", t("about.tl3.t"), t("about.tl3.d")],
    ["2020s", t("about.tl4.t"), t("about.tl4.d")],
    [t("about.tl.today"), t("about.tl5.t"), t("about.tl5.d")],
  ];
  const TEAM: [string, string, string][] = [
    ["Riaz Ahmad", t("about.role.chair"), t("about.bio.riaz")],
    ["Raheel Ahmad", t("about.role.md"), t("about.bio.raheel")],
  ];
  return (
    <main>
      <section className="page-head">
        <div className="container">
          <div className="crumbs">
            <Link href="/">{t("nav.home")}</Link> <span>/</span> <span>{t("nav.about")}</span>
          </div>
          <h1 dangerouslySetInnerHTML={{ __html: t("about.h1") }}></h1>
          <p className="page-lede">{t("about.lede")}</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="manifesto-grid" style={{ gridTemplateColumns: "260px 1fr", gap: 80 }}>
            <div className="eyebrow">{t("about.origin.k")}</div>
            <div>
              <p
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(28px, 3vw, 44px)",
                  lineHeight: 1.15,
                  letterSpacing: "-0.015em",
                  margin: "0 0 28px 0",
                }}
              >
                {t("about.origin.1")}
              </p>
              <p style={{ fontSize: 17, color: "var(--ink-2)", lineHeight: 1.7, maxWidth: "62ch", margin: "0 0 20px 0" }}>
                {t("about.origin.2")}
              </p>
              <p style={{ fontSize: 17, color: "var(--ink-2)", lineHeight: 1.7, maxWidth: "62ch", margin: 0 }}>
                {t("about.origin.3")}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section hairline-top hairline-bot">
        <div className="container">
          <div className="section-head">
            <div className="num">{t("about.tl.k")}</div>
            <h2 dangerouslySetInnerHTML={{ __html: t("about.tl.t") }}></h2>
            <div></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 0, borderTop: "1px solid var(--rule)" }}>
            {TIMELINE.map(([y, k, t], i) => (
              <div
                key={y}
                style={{
                  padding: "30px 24px 30px 0",
                  borderRight: i < 4 ? "1px solid var(--rule)" : "0",
                  borderBottom: "1px solid var(--rule)",
                }}
              >
                <div className="mono" style={{ fontSize: 11, letterSpacing: "0.14em", color: "var(--ink-3)", marginBottom: 10, textTransform: "uppercase" }}>
                  {y}
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 28, lineHeight: 1, marginBottom: 12, letterSpacing: "-0.01em" }}>
                  {k}
                </div>
                <p style={{ margin: 0, fontSize: 13, color: "var(--ink-2)", lineHeight: 1.55 }}>{t}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div className="num">{t("about.team.k")}</div>
            <h2 dangerouslySetInnerHTML={{ __html: t("about.team.t") }}></h2>
            <div></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 40, maxWidth: 760 }}>
            {TEAM.map(([n, r, b]) => (
              <div key={n} style={{ borderTop: "1px solid var(--ink)", paddingTop: 16, display: "flex", flexDirection: "column", gap: 14 }}>
                <div
                  style={{
                    aspectRatio: "1",
                    background: "var(--paper-2)",
                    border: "1px solid var(--rule)",
                    position: "relative",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Placeholder label={`PORTRAIT · ${n.split(" ")[0].toUpperCase()}`} />
                </div>
                <div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 28, lineHeight: 1.05, letterSpacing: "-0.01em" }}>{n}</div>
                  <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 4 }}>
                    {r}
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: 14, color: "var(--ink-2)", lineHeight: 1.6 }}>{b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
