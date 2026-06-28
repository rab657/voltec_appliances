import type { Metadata } from "next";
import Link from "next/link";
import { getT } from "@/lib/i18n-server";

export const metadata: Metadata = {
  title: "About — Four decades of steady power",
  description:
    "From a one-room Lahore workshop in the 1980s to one of Pakistan's leading power-equipment manufacturers — voltage stabilizers (IGBT, SVC, AVR), three-phase industrial systems and genuine EVE lithium cells, serving Pakistan, the UAE and China.",
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  const t = await getT();
  const TIMELINE: [string, string, string][] = [
    ["1980s", t("about.tl1.t"), t("about.tl1.d")],
    ["1995", t("about.tl2.t"), t("about.tl2.d")],
    ["2000s–10s", t("about.tl3.t"), t("about.tl3.d")],
    ["2020s", t("about.tl4.t"), t("about.tl4.d")],
    [t("about.tl.today"), t("about.tl5.t"), t("about.tl5.d")],
  ];
  const STATS: [string, string][] = [
    ["40+", t("trust.years")],
    ["10,000+", t("trust.customers")],
    ["3", t("about.stat.markets")],
    ["24/7", t("trust.warranty")],
  ];
  const CAPS: [string, string][] = [
    [t("about.cap.1t"), t("about.cap.1d")],
    [t("about.cap.2t"), t("about.cap.2d")],
    [t("about.cap.3t"), t("about.cap.3d")],
    [t("about.cap.4t"), t("about.cap.4d")],
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
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 0, borderTop: "1px solid var(--rule)" }}>
            {TIMELINE.map(([y, k, t], i) => (
              <div
                key={y}
                style={{
                  padding: "44px 32px 52px",
                  borderRight: i < TIMELINE.length - 1 ? "1px solid var(--rule)" : "0",
                  borderBottom: "1px solid var(--rule)",
                }}
              >
                <div className="mono" style={{ fontSize: 11, letterSpacing: "0.14em", color: "var(--accent-deep)", marginBottom: 18, textTransform: "uppercase" }}>
                  {y}
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 26, lineHeight: 1.08, marginBottom: 14, letterSpacing: "-0.01em" }}>
                  {k}
                </div>
                <p style={{ margin: 0, fontSize: 13.5, color: "var(--ink-2)", lineHeight: 1.6 }}>{t}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section hairline-bot" style={{ paddingTop: 0 }}>
        <div className="container">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              border: "1px solid var(--rule)",
              borderRadius: 14,
              overflow: "hidden",
            }}
          >
            {STATS.map(([v, l], i) => (
              <div
                key={l}
                style={{
                  padding: "32px 28px",
                  borderRight: i < STATS.length - 1 ? "1px solid var(--rule)" : "0",
                }}
              >
                <div style={{ fontFamily: "var(--font-display)", fontSize: "clamp(36px,5vw,52px)", lineHeight: 1, color: "var(--accent)", letterSpacing: "-0.02em" }}>
                  {v}
                </div>
                <div className="mono" style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-3)", marginTop: 10 }}>
                  {l}
                </div>
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
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 0, borderTop: "1px solid var(--rule)" }}>
            {CAPS.map(([k, d], i) => (
              <div
                key={k}
                style={{
                  padding: "30px 32px 30px 0",
                  borderBottom: "1px solid var(--rule)",
                  borderRight: i % 2 === 0 ? "1px solid var(--rule)" : "0",
                }}
              >
                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: 26, lineHeight: 1.05, letterSpacing: "-0.01em", margin: "0 0 10px" }}>
                  {k}
                </h3>
                <p style={{ margin: 0, fontSize: 15, color: "var(--ink-2)", lineHeight: 1.6, maxWidth: "46ch" }}>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
