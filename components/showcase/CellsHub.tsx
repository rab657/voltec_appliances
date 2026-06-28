import Link from "next/link";
import type { Product } from "@/lib/types";
import { siblingFamilies, showcaseFor, type FamilyMeta } from "@/lib/showcase-data";
import { getT, getContent } from "@/lib/i18n-server";
import EcomCard from "@/components/EcomCard";
import WhatsAppButton from "@/components/WhatsAppButton";

// Cells are distinct products (not variants of one), so their category page is a
// HUB: pick your cell, grouped by format, each card → its own detail page.
export default async function CellsHub({
  family,
  members,
}: {
  family: FamilyMeta;
  members: Product[];
}) {
  const t = await getT();
  const { lc } = await getContent();
  const groups = [
    { id: "prismatic", k: t("ch.prismatic.k"), title: t("ch.prismatic.t"), match: /prismatic/i },
    { id: "cyl", k: t("ch.cyl.k"), title: t("ch.cyl.t"), match: /cylindrical/i },
  ]
    .map((g) => ({ ...g, items: members.filter((m) => g.match.test(m.cell?.format || "")) }))
    .filter((g) => g.items.length > 0);
  const faqs = showcaseFor(members[0]).faqs;
  const related = siblingFamilies(family);

  return (
    <main>
      <section className="sb-mast">
        <div className="container">
          <div className="sb-crumbs">
            <Link href="/">{t("nav.home")}</Link> <span>/</span>
            <Link href="/products">{t("nav.products")}</Link> <span>/</span>
            <span>{lc(family.name)}</span>
          </div>
          <div className="sb-mast-grid">
            <div>
              <div className="sb-mast-badges">
                <span className="sb-badge is-accent">{t("cell.genuine")}</span>
                <span className="sb-badge is-line">{t("ch.gradeA")}</span>
              </div>
              <h1>{lc(family.name)}</h1>
              <p className="sb-mast-lede">{t("ch.lede")}</p>
              <div className="sb-mast-cta">
                <a href="#cells" className="btn btn-primary">
                  {t("ch.browse")} <span className="arrow" style={{ marginLeft: 4 }}>↓</span>
                </a>
                <WhatsAppButton productName={family.name}>{t("ch.ask")}</WhatsAppButton>
              </div>
            </div>
            <div className="sb-mast-card">
              <div className="slot slot-tech-frame">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/${family.image}`} alt={family.name} style={{ width: "100%", height: "100%", objectFit: "contain", padding: "8%" }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="sb-section" id="cells">
        <div className="container">
          {groups.map((g, gi) => (
            <div key={g.id} style={{ marginBottom: gi < groups.length - 1 ? 56 : 0 }}>
              <div className="sb-head is-center">
                <div className="sb-eyebrow">{g.k}</div>
                <h2 dangerouslySetInnerHTML={{ __html: g.title }}></h2>
              </div>
              <div className="ec-grid">
                {g.items.map((p) => (
                  <EcomCard key={p.id} p={p} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {faqs && faqs.length > 0 && (
        <section className="sb-section" id="faq" style={{ paddingTop: 0 }}>
          <div className="container">
            <div className="sb-head is-center">
              <div className="sb-eyebrow">{t("sh.faq.k")}</div>
              <h2 dangerouslySetInnerHTML={{ __html: t("sh.faq.t") }}></h2>
            </div>
            <div className="sb-faq">
              {faqs.map((f, i) => (
                <details className="sb-faq-item" key={i} open={i === 0}>
                  <summary>{lc(f.q)}</summary>
                  <div className="sb-faq-a">{lc(f.a)}</div>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="sb-section" style={{ paddingTop: 0 }}>
          <div className="container">
            <div className="section-head">
              <div className="num"></div>
              <h2 dangerouslySetInnerHTML={{ __html: t("sh.other.t") }}></h2>
              <Link href="/products" className="btn-link">
                {t("cta.allproducts")} <span className="arrow">→</span>
              </Link>
            </div>
            <div className="home-cat-grid">
              {related.map((f) => (
                <Link key={f.slug} href={`/showcase/${f.slug}`} className="cat-tile" data-cat={f.categoryId}>
                  <div className="cat-tile-img">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`/${f.image}`} alt={f.name} />
                  </div>
                  <div className="cat-tile-overlay"></div>
                  <div className="cat-tile-text">
                    <div className="cat-tile-sub">{lc(f.category)}</div>
                    <div className="cat-tile-label">{lc(f.name)}</div>
                    <div className="cat-tile-cta">{t("cta.viewrange")} →</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
