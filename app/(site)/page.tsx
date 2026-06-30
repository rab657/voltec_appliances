import Link from "next/link";
import { PRODUCTS } from "@/lib/products";
import { getPublishedPosts } from "@/lib/blog";
import { FAMILIES, membersOf, leadOf, isProductInHiddenFamily } from "@/lib/showcase-data";
import EcomCard from "@/components/EcomCard";
import WhatsAppButton from "@/components/WhatsAppButton";
import JsonLd from "@/components/JsonLd";
import { getT, getContent } from "@/lib/i18n-server";
import { getMediaMap, applyMedia, type MediaMap } from "@/lib/product-media";

const FEATURED_IDS = ["vt-eve-lf100", "vt-eve-lf280k", "vt-ind-200k", "vt-svc-5k"];

// Each card's copy lives in the i18n dictionary (serve.<key>.{t,d,tag}).
const SERVE_KEYS = ["med", "ind", "gov", "home"];

// Brand-level buyer questions — the head queries Voltec should own on AI/search
// answer engines. Rendered on-page AND emitted as FAQPage structured data.
const HOME_FAQS: { q: string; a: string }[] = [
  {
    q: "Which Voltec voltage stabilizer should I buy?",
    a: "It depends on what you're protecting. For one appliance — a fridge, deep freezer or a single AC — choose an AVR relay stabilizer (the Voltec A-series). For a whole home or shop with one to three ACs, choose a servo (SVC) stabilizer: about 5 kVA for one AC, 10 kVA for two, 15 kVA for a full home. For sensitive or precision equipment like laser, CNC, medical or lab machines, choose the inverter (IGBT) stabilizer. For a factory or three-phase load, choose a three-phase SJW-series system, built to order.",
  },
  {
    q: "What lithium cells do I need for my solar system?",
    a: "For a 48 V solar battery you need 16 LFP cells in series (16S), each 3.2 V nominal — use 8 cells for 24 V and 4 for 12 V. For capacity, a common home bank is 16× 280 Ah cells for about 14 kWh, enough to run a home through an evening of load-shedding. Tell us your inverter voltage and backup hours and we'll size it for you.",
  },
  {
    q: "Are Voltec's EVE lithium cells genuine?",
    a: "Yes. We supply genuine Grade-A prismatic LFP cells from EVE, one of the world's top cell makers. Every cell is laser-welded, carries a scannable factory QR code, and is matched for capacity and voltage at our Lahore facility before it ships. Genuine LFP lasts 6,000+ cycles — about 15 years of daily use.",
  },
  {
    q: "Inverter, SCR, servo or relay stabilizer — what's the difference?",
    a: "A relay (AVR) stabilizer is the cheapest and fixes voltage in steps — best for one appliance. A servo (SVC) stabilizer uses a motor to correct voltage smoothly to ±1% — best for a whole home or shop. An SCR (thyristor) stabilizer is solid-state with no moving parts and switches faster than a servo, correcting in steps to ±5% — the cost-effective way to protect tier-1 sensitive equipment like laser machines. An inverter (IGBT) stabilizer is fully electronic and corrects steplessly with a clean pure-sine output — best for your most sensitive, highest-precision equipment.",
  },
  {
    q: "Where is Voltec based, and do you deliver?",
    a: "Voltec Appliances has been making power equipment in Lahore, Pakistan for four decades. We ship Pakistan-wide and supply bulk and export orders to the UAE and China. Message us on WhatsApp at +92 324 400 4778 for stock, pricing and freight.",
  },
  {
    q: "Do you supply businesses, factories and bulk orders?",
    a: "Yes. Alongside home stabilizers and cells, we build three-phase industrial voltage stabilizers (100–500 kVA and up) to order, and supply EVE cells, BMS, PCB relays and LED modules in bulk for installers, manufacturers and exporters. Send us your load list or requirement and our engineers will quote it.",
  },
];

// Single, non-redundant navigation: the real Voltec product lines. The three
// stabilizer series (SVC / AVR / IGBT) plus Industrial, Cells and Accessories.
// Each tile opens that line's showcase, which lists its models.
const norm = (s: string) =>
  s.startsWith("/") || s.startsWith("http") ? s : `/${s}`;

function buildRange(mediaMap: MediaMap) {
  const fam = (slug: string) => FAMILIES.find((f) => f.slug === slug)!;
  const tile = (slug: string) => {
    const f = fam(slug);
    const merged = membersOf(f).map((p) => applyMedia(p, mediaMap));
    const visible = merged.filter((p) => !p.hidden);
    const lead = leadOf(visible.length ? visible : merged);
    const n = visible.length;
    // Admin-uploaded category cover (admin/products → "Homepage images") wins.
    const cover = mediaMap[`homecover-${f.key}`]?.images?.[0];
    return {
      href: `/showcase/${f.slug}`,
      // Priority: admin category cover → curated band art → lead model's admin
      // photo → family fallback. A category gets a bespoke band image without
      // losing the upload-to-update behaviour for those that don't set one.
      img: norm(cover || f.bandImage || lead?.image || f.image),
      // A deliberate cover image (admin upload or curated art) is full-bleed
      // (cover); a product-photo fallback is shown whole, padded (contain).
      art: Boolean(cover || f.bandImage),
      name: f.name,
      blurb: f.blurb,
      meta: `${n} model${n === 1 ? "" : "s"}`,
      tag: f.tag,
      catId: f.categoryId,
    };
  };
  // A line drops out entirely when it's flagged hidden (e.g. not-yet-launched
  // IGBT/SCR) OR when every one of its models is hidden — matching the catalog,
  // so an all-hidden line never shows an empty "0 models" band.
  const hasVisibleModels = (slug: string) =>
    membersOf(fam(slug)).map((p) => applyMedia(p, mediaMap)).some((p) => !p.hidden);
  const famSlugs = [
    "smart-inverter-voltage-stabilizer",
    "cells",
    "industrial",
    "svc",
    "scr",
    "avr",
  ].filter((slug) => !fam(slug).hidden && hasVisibleModels(slug));
  const partsCover = mediaMap["homecover-parts"]?.images?.[0];
  return [
    ...famSlugs.map(tile),
    {
      href: "/products?cat=parts",
      img: partsCover ? norm(partsCover) : "/assets/prod-relay.jpg",
      art: Boolean(partsCover),
      name: "Electric Parts",
      blurb: "Wirell PCB relays (T73 / T90) and 7-segment LED displays (5630 / 4630) — the electronics our engineers keep in stock.",
      meta: "Relays · LED",
      tag: undefined as string | undefined,
      catId: "parts" as const,
    },
  ];
}

export default async function HomePage() {
  const t = await getT();
  const { lc } = await getContent();
  const mediaMap = await getMediaMap();
  const featured = FEATURED_IDS.map((id) => PRODUCTS.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
    .map((p) => applyMedia(p, mediaMap))
    .filter((p) => !p.hidden && !isProductInHiddenFamily(p));
  const posts = (await getPublishedPosts()).slice(0, 3);
  const range = buildRange(mediaMap);
  // Admin-settable hero image (Homepage images → Hero); falls back to the default.
  const heroCover = mediaMap["homecover-hero"]?.images?.[0];
  const heroImg = heroCover ? norm(heroCover) : "/assets/svc-stabilizer.png";

  return (
    <main>
      {/* Hero */}
      <section className="vhero">
        <div className="container vhero-grid">
          <div className="vhero-copy">
            <div className="vhero-eyebrow">
              <span className="live-dot"></span> {t("home.eyebrow")}
            </div>
            <h1 dangerouslySetInnerHTML={{ __html: t("home.h1") }}></h1>
            <p>{t("home.sub")}</p>
            <div className="vhero-cta">
              <Link href="/products" className="btn btn-primary">
                {t("cta.shop")} <span className="arrow">→</span>
              </Link>
              <WhatsAppButton>{t("cta.whatsapp")}</WhatsAppButton>
            </div>
            <div className="vtrust">
              <div className="vtrust-item">
                <strong>40+</strong>
                <span>{t("trust.years")}</span>
              </div>
              <div className="vtrust-item">
                <strong>10,000+</strong>
                <span>{t("trust.customers")}</span>
              </div>
              <div className="vtrust-item">
                <strong>24/7</strong>
                <span>{t("trust.warranty")}</span>
              </div>
            </div>
          </div>
          <div className="vhero-feature">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={heroImg}
              alt="Voltec servo motor (SVC) voltage stabilizer"
              className="vhero-feature-img"
            />
            <div className="vhero-feature-overlay"></div>
            <div className="vhero-feature-badge">
              <span className="ec-tech" data-tech="SVC">
                {t("home.feat.badge")}
              </span>
              <div className="vhero-feature-title">{t("home.feat.title")}</div>
              <div className="vhero-feature-sub">{t("home.feat.sub")}</div>
              <Link href="/showcase/svc" className="vhero-feature-link">
                {t("home.feat.link")} →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="clients-strip">
        <div className="container">
          <div className="clients-inner">
            <div className="eyebrow">{t("home.trustedby")}</div>
            <div className="clients-list">
              {/* eslint-disable @next/next/no-img-element */}
              <img src="/assets/client-kns.png" alt="K&N's" className="client-logo" />
              <img src="/assets/client-chughtai.png" alt="Chughtai Labs" className="client-logo" />
              <img src="/assets/client-fauji.png" alt="Fauji Fertilizer" className="client-logo" />
              <img src="/assets/client-4.png" alt="Client" className="client-logo" />
              <img src="/assets/client-5.png" alt="Client" className="client-logo" />
              {/* eslint-enable @next/next/no-img-element */}
            </div>
          </div>
        </div>
      </section>

      {/* The range — one unified set of entry points, by real product line */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <div className="num">{t("sec.range.k")}</div>
            <h2 dangerouslySetInnerHTML={{ __html: t("sec.range.t") }}></h2>
            <Link href="/products" className="btn-link">
              {t("cta.allproducts")} <span className="arrow">→</span>
            </Link>
          </div>
          <p className="range-intro" dangerouslySetInnerHTML={{ __html: t("home.rangeIntro") }}></p>
          <div className="range-bands">
            {range.map((r, i) => (
              <Link
                key={r.href}
                href={r.href}
                className={`range-band ${i % 2 === 1 ? "is-flip" : ""}`}
                data-cat={r.catId}
              >
                <div className={`range-band-media ${r.art ? "" : "is-contain"}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={r.img} alt={r.name} />
                </div>
                <div className="range-band-body">
                  <div className="range-band-meta">
                    <span className="range-band-count">{r.meta}</span>
                    {r.tag && <span className="range-band-tag">{lc(r.tag)}</span>}
                  </div>
                  <h3>{lc(r.name)}</h3>
                  <p>{lc(r.blurb)}</p>
                  <span className="range-band-cta">
                    {t("cta.explore")} <span className="arrow">→</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Best sellers */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-head">
            <div className="num">{t("sec.popular.k")}</div>
            <h2 dangerouslySetInnerHTML={{ __html: t("sec.popular.t") }}></h2>
            <Link href="/products" className="btn-link">
              {t("cta.shopall")} <span className="arrow">→</span>
            </Link>
          </div>
          <div className="ec-grid">
            {featured.map((p) => (
              <EcomCard key={p.id} p={p} />
            ))}
          </div>
        </div>
      </section>

      {/* Who we serve */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-head">
            <div className="num">{t("sec.serve.k")}</div>
            <h2 dangerouslySetInnerHTML={{ __html: t("sec.serve.t") }}></h2>
            <Link href="/contact" className="btn-link">
              {t("cta.talksales")} <span className="arrow">→</span>
            </Link>
          </div>
          <div className="serve-grid">
            {SERVE_KEYS.map((k) => (
              <div key={k} className="serve-card">
                <span className="serve-tag">{t(`serve.${k}.tag`)}</span>
                <h3>{t(`serve.${k}.t`)}</h3>
                <p>{t(`serve.${k}.d`)}</p>
                {k === "med" && (
                  <Link href="/medical" className="serve-cta">
                    {t("serve.med.cta")} <span className="arrow">→</span>
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className="why-band">
        <div className="container">
          <div className="why-grid">
            <div className="why-intro">
              <div className="eyebrow light">{t("why.k")}</div>
              <h2>{t("why.t")}</h2>
            </div>
            <div className="why-items">
              <div className="why-item">
                <div className="why-num">01</div>
                <h3>{t("why.1t")}</h3>
                <p>{t("why.1d")}</p>
              </div>
              <div className="why-item">
                <div className="why-num">02</div>
                <h3>{t("why.2t")}</h3>
                <p>{t("why.2d")}</p>
              </div>
              <div className="why-item">
                <div className="why-num">03</div>
                <h3>{t("why.3t")}</h3>
                <p>{t("why.3d")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog teaser */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <div className="num">{t("sec.learn.k")}</div>
            <h2 dangerouslySetInnerHTML={{ __html: t("sec.learn.t") }}></h2>
            <Link href="/blog" className="btn-link">
              {t("cta.readall")} <span className="arrow">→</span>
            </Link>
          </div>
          <div className="guide-grid">
            {posts.map((p) => (
              <Link key={p.id} href={`/blog/${p.slug}`} className="guide-card">
                <div className="guide-top">
                  <span className="guide-cat">{lc(p.category)}</span>
                  <span className="guide-time">{p.readTime} {t("blog.min")}</span>
                </div>
                <h3>{lc(p.title)}</h3>
                <p>{lc(p.excerpt)}</p>
                <span className="guide-link">{t("blog.readguide")} →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Brand-level FAQ — head buyer questions, also emitted as FAQPage schema */}
      <section className="section" style={{ paddingTop: 0 }}>
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
                Which Voltec product <em>do I need?</em>
              </h2>
              <p style={{ marginTop: 16, fontSize: 14, color: "var(--ink-2)", lineHeight: 1.6 }}>
                The quick answers buyers ask most. Still unsure?{" "}
                <WhatsAppButton variant="light">Ask our team</WhatsAppButton>
              </p>
            </div>
            <div className="faq-list">
              {HOME_FAQS.map((f, i) => (
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

      <JsonLd
        id="ld-home-faq"
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: HOME_FAQS.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }}
      />
    </main>
  );
}
