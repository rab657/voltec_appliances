import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/components/JsonLd";
import SizingAnswer from "@/components/SizingAnswer";
import { absUrl } from "@/lib/site";
import { getT } from "@/lib/i18n-server";
import { METHOD, SIZING_ROBOTS, sizeStabilizer, toQuery } from "@/lib/sizing";
import SizingReviewBanner from "@/components/SizingReviewBanner";
import { SIZING_PRESETS, getPreset } from "@/lib/sizing-presets";

// One static answer page per common sizing question ("what size stabilizer for
// a 1.5 ton AC?"). These are what answer engines fetch and quote, so the
// answer is in the first screen, stated as a plain sentence, with the working
// and a FAQPage block. The numbers come from lib/sizing.ts, never by hand.

export function generateStaticParams() {
  return SIZING_PRESETS.map((p) => ({ slug: p.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = getPreset(slug);
  if (!p) return {};
  const r = sizeStabilizer(p.input);
  const title = `${p.question.replace(/\?$/, "")} — ${r.requiredKva} kVA`;
  const description = `${r.summary} Working shown, plus the right input range for low voltage. Price on WhatsApp.`;
  return {
    title,
    description,
    alternates: { canonical: `/stabilizer-size/${slug}` },
    robots: SIZING_ROBOTS,
    openGraph: { type: "article", title, description, url: absUrl(`/stabilizer-size/${slug}`) },
  };
}

export default async function SizingPresetPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getPreset(slug);
  if (!p) notFound();
  const t = await getT();
  const r = sizeStabilizer(p.input);
  const q = toQuery(r.input);
  const related = SIZING_PRESETS.filter((x) => x.group === p.group && x.slug !== p.slug).slice(0, 5);

  const faqs = [
    { q: p.question, a: r.summary + (r.inputRange ? ` Input range: ${r.inputRange}.` : "") },
    { q: "How is this worked out?", a: METHOD.join(" ") },
    {
      q: "What if my load is different?",
      a: `Use the free calculator at ${absUrl("/stabilizer-size-calculator")} — enter your own appliances and lowest voltage. Or send your appliance list on WhatsApp and Voltec will size it.`,
    },
  ];

  return (
    <main>
      <SizingReviewBanner />
      <JsonLd
        id="ld-size-faq"
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
        }}
      />
      <JsonLd
        id="ld-size-crumbs"
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: absUrl("/") },
            { "@type": "ListItem", position: 2, name: "Stabilizer sizes", item: absUrl("/stabilizer-size") },
            { "@type": "ListItem", position: 3, name: p.label, item: absUrl(`/stabilizer-size/${p.slug}`) },
          ],
        }}
      />

      <section className="page-head">
        <div className="container">
          <div className="crumbs">
            <Link href="/">{t("nav.home")}</Link> <span>/</span> <Link href="/stabilizer-size">Stabilizer sizes</Link>{" "}
            <span>/</span> <span>{p.label}</span>
          </div>
          <div className="med-eyebrow">Sizing guide · Voltec, Lahore · since 1995</div>
          <h1>{p.question}</h1>
          <p className="page-lede" style={{ maxWidth: "62ch" }}>
            {p.intro}
          </p>
        </div>
      </section>

      <section className="section hairline-top" style={{ paddingTop: 32 }}>
        <div className="container">
          <SizingAnswer r={r} from="sizing-page" />
          <p className="med-body" style={{ marginTop: 20 }}>
            Different load?{" "}
            <Link href={`/stabilizer-size-calculator?${q}#answer`}>Open this in the calculator and change it</Link>.
          </p>
        </div>
      </section>

      <section className="section" style={{ background: "var(--paper-2)" }}>
        <div className="container med-narrow">
          <h2 className="med-h2">How we size a stabilizer</h2>
          <ol className="sz-method">
            {METHOD.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ol>
          <p className="med-body" style={{ marginTop: 16 }}>
            Voltec is a manufacturer and importer of voltage stabilizers. Our servo stabilizers are
            copper-wound and hold 220V ±1%. Every Voltec
            stabilizer has a 1-year warranty and is serviced by our own team in Lahore. We deliver
            across Pakistan; price is quoted on WhatsApp the same day.
          </p>
        </div>
      </section>

      {related.length > 0 && (
        <section className="section hairline-top">
          <div className="container">
            <h2 className="med-h2">Related sizes</h2>
            <ul className="sz-presets">
              {related.map((x) => (
                <li key={x.slug}>
                  <Link href={`/stabilizer-size/${x.slug}`}>{x.question}</Link>
                </li>
              ))}
              <li>
                <Link href="/stabilizer-size">All sizing questions</Link>
              </li>
            </ul>
          </div>
        </section>
      )}
    </main>
  );
}
