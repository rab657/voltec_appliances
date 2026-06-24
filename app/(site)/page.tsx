import Link from "next/link";
import { PRODUCTS } from "@/lib/products";
import { getPublishedPosts } from "@/lib/blog";
import { FAMILIES, membersOf, leadOf } from "@/lib/showcase-data";
import EcomCard from "@/components/EcomCard";
import WhatsAppButton from "@/components/WhatsAppButton";
import { getT, getContent } from "@/lib/i18n-server";
import { getMediaMap, applyMedia, type MediaMap } from "@/lib/product-media";

const FEATURED_IDS = ["vt-eve-lf100", "vt-eve-lf280k", "vt-ind-200k", "vt-svc-5k"];

// Each card's copy lives in the i18n dictionary (serve.<key>.{t,d,tag}).
const SERVE_KEYS = ["med", "ind", "gov", "home"];

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
    // Band image follows the lead model's admin-managed photo (falls back to the
    // family asset), so uploading a product image updates the homepage band too.
    const lead = leadOf(visible.length ? visible : merged);
    const n = visible.length;
    return {
      href: `/showcase/${f.slug}`,
      img: norm(lead?.image || f.image),
      name: f.name,
      blurb: f.blurb,
      meta: `${n} model${n === 1 ? "" : "s"}`,
      tag: f.tag,
      catId: f.categoryId,
    };
  };
  return [
    tile("igbt"),
    tile("cells"),
    tile("industrial"),
    tile("svc"),
    tile("avr"),
    {
      href: "/products?cat=parts",
      img: "/assets/prod-relay.jpg",
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
    .filter((p) => !p.hidden);
  const posts = (await getPublishedPosts()).slice(0, 3);
  const range = buildRange(mediaMap);

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
                <strong>30+</strong>
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
              src="/assets/prod-igbt.jpg"
              alt="Voltec inverter (IGBT) voltage stabilizer"
              className="vhero-feature-img"
            />
            <div className="vhero-feature-overlay"></div>
            <div className="vhero-feature-badge">
              <span className="ec-tech" data-tech="IGBT">
                {t("home.feat.badge")}
              </span>
              <div className="vhero-feature-title">{t("home.feat.title")}</div>
              <div className="vhero-feature-sub">{t("home.feat.sub")}</div>
              <Link href="/showcase/igbt" className="vhero-feature-link">
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
                <div className="range-band-media">
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
    </main>
  );
}
