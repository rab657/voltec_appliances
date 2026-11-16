import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import WhatsAppButton from "@/components/WhatsAppButton";
import { absUrl } from "@/lib/site";
import { MEDICAL_PAGES, SERVO_STRENGTHS, SOLID_STATE, type MedicalPage } from "@/lib/medical-pages";

// Shared layout for the /medical/[slug] pages. Servo leads (what Voltec sells
// today, as specialists); IGBT/SCR appear as a custom-order option.
export default function MedicalLanding({ page, homeLabel }: { page: MedicalPage; homeLabel: string }) {
  const url = absUrl(`/medical/${page.slug}`);
  const from = `medical-${page.slug}`;
  return (
    <main>
      <JsonLd
        id="ld-medical-page"
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "FAQPage",
              mainEntity: page.faqs.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: absUrl("/") },
                { "@type": "ListItem", position: 2, name: "Medical", item: absUrl("/medical") },
                { "@type": "ListItem", position: 3, name: page.nav, item: url },
              ],
            },
          ],
        }}
      />

      <section className="page-head">
        <div className="container">
          <div className="crumbs">
            <Link href="/">{homeLabel}</Link> <span>/</span> <Link href="/medical">Medical</Link> <span>/</span>{" "}
            <span>{page.nav}</span>
          </div>
          <div className="med-eyebrow">{page.eyebrow}</div>
          <h1>{page.h1}</h1>
          <p className="page-lede" style={{ maxWidth: "62ch" }}>
            {page.lede}
          </p>
          <div className="med-cta">
            <WhatsAppButton lead from={from} message={page.waMessage}>
              Send your machine model on WhatsApp
            </WhatsAppButton>
            {page.slug === "igbt-scr-custom-order" ? (
              <Link href="/pre-order" className="btn btn-ghost">
                Custom order form →
              </Link>
            ) : (
              <Link href="/medical" className="btn btn-ghost">
                All medical equipment →
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="section hairline-top">
        <div className="container">
          <div className="med-narrow" style={{ marginBottom: 24 }}>
            <h2 className="med-h2">What we protect</h2>
          </div>
          <div className="med-grid">
            {page.equipment.map((item) => (
              <div className="med-grid-item" key={item}>
                <span className="med-check" aria-hidden="true">✓</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ background: "var(--paper-2)" }}>
        <div className="container med-narrow">
          <h2 className="med-h2">{page.problemTitle}</h2>
          <p className="med-body">{page.problem}</p>
        </div>
      </section>

      <section className="section hairline-top">
        <div className="container">
          <div className="med-narrow" style={{ marginBottom: 28 }}>
            <h2 className="med-h2">The right setup</h2>
            <p className="med-body">
              Sizing rule: the machine&apos;s rating in kVA (watts ÷ 0.8), plus everything else on the same
              supply, plus 25%. Send us the model and we size it for you.
            </p>
          </div>
          <div className="med-sizes">
            {page.setups.map((s) => (
              <div className="med-vs-card is-win" key={s.title}>
                <div className="med-size-kva">{s.kva}</div>
                <h3 style={{ fontSize: 17, margin: "0 0 12px" }}>{s.title}</h3>
                <ul>
                  {s.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
                {s.href && (
                  <Link href={s.href} className="serve-cta" style={{ marginTop: 16 }}>
                    See the model <span className="arrow">→</span>
                  </Link>
                )}
              </div>
            ))}
          </div>
          {page.notes?.map((n) => (
            <p className="med-scope" key={n}>
              {n}
            </p>
          ))}
        </div>
      </section>

      {page.slug !== "igbt-scr-custom-order" && (
        <section className="section" style={{ background: "var(--paper-2)" }}>
          <div className="container">
            <div className="med-narrow" style={{ marginBottom: 28 }}>
              <h2 className="med-h2">Why clinics choose a Voltec servo motor stabilizer</h2>
            </div>
            <div className="med-grid">
              {SERVO_STRENGTHS.map((s) => (
                <div className="med-grid-item" key={s.t} style={{ flexDirection: "column", gap: 6 }}>
                  <strong>{s.t}</strong>
                  <span style={{ color: "var(--ink-2)" }}>{s.d}</span>
                </div>
              ))}
            </div>
            <p className="med-scope">
              <strong>{SOLID_STATE.title}.</strong> {SOLID_STATE.body}{" "}
              <Link href="/medical/igbt-scr-custom-order">IGBT &amp; SCR custom order →</Link>
            </p>
          </div>
        </section>
      )}

      <section className="section">
        <div className="container">
          <div className="faq-wrap">
            <div className="faq-aside">
              <h2 className="med-h2">Questions we get</h2>
            </div>
            <div className="faq-list">
              {page.faqs.map((f, i) => (
                <details key={f.q} className="faq-item" open={i === 0}>
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

      <section className="section hairline-top">
        <div className="container">
          <h2 className="med-h2" style={{ fontSize: 22 }}>More medical equipment</h2>
          <div className="med-cta">
            {MEDICAL_PAGES.filter((p) => p.slug !== page.slug).map((p) => (
              <Link key={p.slug} href={`/medical/${p.slug}`} className="btn btn-ghost">
                {p.nav}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="why-band">
        <div className="container" style={{ textAlign: "center" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "clamp(28px,4vw,48px)", lineHeight: 1.05, margin: "0 0 14px" }}>
            Tell us the machine. We&apos;ll size the protection.
          </h2>
          <p style={{ maxWidth: "52ch", margin: "0 auto 26px", fontSize: 16, lineHeight: 1.6, color: "oklch(85% 0.02 250 / 0.9)" }}>
            Send the model and your city on WhatsApp. Written recommendation and quote, 1-year warranty, nationwide delivery.
          </p>
          <WhatsAppButton lead from={`${from}-footer`} message={page.waMessage}>
            WhatsApp Voltec
          </WhatsAppButton>
        </div>
      </section>
    </main>
  );
}
