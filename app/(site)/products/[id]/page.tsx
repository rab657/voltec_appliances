import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PRODUCTS, getProduct, relatedProducts } from "@/lib/products";
import { familySlugOf, familyBySlug } from "@/lib/showcase-data";
import EcomCard from "@/components/EcomCard";
import WhatsAppButton from "@/components/WhatsAppButton";
import PdpGallery from "@/components/PdpGallery";
import JsonLd from "@/components/JsonLd";
import ViewItemTracker from "@/components/ViewItemTracker";
import CellDetail from "@/components/CellDetail";
import "@/styles/stabilizer.css";
import { SITE, absUrl, VOLTEC_ORG } from "@/lib/site";
import { getT, getContent } from "@/lib/i18n-server";
import { getMediaMap, applyMedia } from "@/lib/product-media";

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ id: p.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/products/[id]">): Promise<Metadata> {
  const { id } = await params;
  const product = getProduct(id);
  if (!product) return { title: "Product not found" };
  return {
    title: `${product.name} — ${product.category}`,
    description: product.tagline + " " + product.description.slice(0, 120),
    alternates: { canonical: `/products/${product.id}` },
    openGraph: {
      type: "website",
      title: `${product.name} | ${SITE.name}`,
      description: product.tagline,
      url: absUrl(`/products/${product.id}`),
      images: [{ url: absUrl(`/${product.image}`) }],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: PageProps<"/products/[id]">) {
  const { id } = await params;
  const product = getProduct(id);
  if (!product) notFound();
  // Stabilizers & industrial have no standalone per-model page — the family
  // showcase + model picker is the product page. Redirect there.
  if (product.categoryId === "stabilizers" || product.categoryId === "industrial") {
    const fam = familySlugOf(product);
    if (fam) redirect(`/showcase/${fam}`);
  }
  const related = relatedProducts(product, 3);
  const phoneHref = `tel:${SITE.phone.replace(/[^+\d]/g, "")}`;
  const famSlug = familySlugOf(product);
  const family = famSlug ? familyBySlug(famSlug) : undefined;
  const t = await getT();
  const { lc } = await getContent();
  const familyName = family ? lc(family.name) : "";
  const merged = applyMedia(product, await getMediaMap());
  const gallery = merged.images && merged.images.length ? merged.images : [product.image];

  return (
    <>
      <ViewItemTracker
        id={product.id}
        name={product.name}
        category={product.category}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          description: product.description,
          category: product.category,
          sku: product.id.toUpperCase(),
          brand: { "@type": "Brand", name: SITE.shortName },
          image: absUrl(`/${product.image}`),
          manufacturer: VOLTEC_ORG,
          additionalProperty: product.specs.map(([k, v]) => ({
            "@type": "PropertyValue",
            name: k,
            value: v,
          })),
          offers: {
            "@type": "Offer",
            availability:
              product.status === "upcoming"
                ? "https://schema.org/PreOrder"
                : "https://schema.org/InStock",
            priceCurrency: "PKR",
            url: absUrl(`/products/${product.id}`),
            seller: VOLTEC_ORG,
          },
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: absUrl("/") },
            { "@type": "ListItem", position: 2, name: "Products", item: absUrl("/products") },
            {
              "@type": "ListItem",
              position: 3,
              name: product.category,
              item: absUrl(`/products?cat=${product.categoryId}`),
            },
            { "@type": "ListItem", position: 4, name: product.name },
          ],
        }}
      />
      {product.cell ? (
        <CellDetail product={{ ...product, image: gallery[0], images: gallery, price: merged.price }} />
      ) : (
      <main>
        <section style={{ padding: "28px 0 0" }}>
          <div className="container">
            <div
              className="crumbs"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                letterSpacing: "0.14em",
                color: "var(--ink-3)",
                textTransform: "uppercase",
                display: "flex",
                gap: 10,
              }}
            >
              <Link href="/">{t("nav.home")}</Link> <span>/</span>
              <Link href="/products">{t("nav.products")}</Link> <span>/</span>
              <Link href={`/products?cat=${product.categoryId}`}>{lc(product.category)}</Link>{" "}
              <span>/</span>
              <span>{lc(product.name)}</span>
            </div>
          </div>
        </section>

        <section>
          <div className="container">
            <div className="pdp-hero">
              <PdpGallery image={gallery[0]} images={gallery} category={product.category} />

              <div className="pdp-info">
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    alignItems: "center",
                    marginBottom: 6,
                    flexWrap: "wrap",
                  }}
                >
                  {product.tech && (
                    <span className="tech-chip" data-tech={product.tech}>
                      {product.tech}
                    </span>
                  )}
                  <span
                    className="mono"
                    style={{
                      color: "var(--ink-3)",
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      fontSize: 11,
                    }}
                  >
                    {lc(product.category)}
                  </span>
                  <span className="mono" style={{ color: "var(--ink-4)", fontSize: 11 }}>
                    ·
                  </span>
                  <span className="mono" style={{ color: "var(--ink-3)", fontSize: 11 }}>
                    SKU {product.id.toUpperCase()}
                  </span>
                </div>
                <h1>{lc(product.name)}</h1>
                <p
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 22,
                    fontStyle: "italic",
                    color: "var(--ink-2)",
                    lineHeight: 1.35,
                    margin: "0 0 24px 0",
                    maxWidth: "44ch",
                  }}
                >
                  {lc(product.tagline)}
                </p>

                {family && (
                  <Link
                    href={`/showcase/${family.slug}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 16,
                      padding: "16px 20px",
                      marginBottom: 24,
                      borderRadius: 12,
                      background: "var(--ink)",
                      color: "#fff",
                      textDecoration: "none",
                    }}
                  >
                    <span style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                      <span
                        className="mono"
                        style={{
                          fontSize: 10,
                          letterSpacing: "0.14em",
                          textTransform: "uppercase",
                          color: "var(--steel-bright, oklch(68% 0.14 245))",
                        }}
                      >
                        {familyName} · {t("pdp.allmodels")}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: 20,
                          lineHeight: 1.1,
                        }}
                      >
                        {t("pdp.explore").replace("{n}", familyName)}
                      </span>
                    </span>
                    <span className="arrow" style={{ fontSize: 20 }}>
                      →
                    </span>
                  </Link>
                )}

                <div className="pdp-tags">
                  {product.status === "upcoming" ? (
                    <>
                      <span
                        className="tag"
                        style={{ borderColor: "var(--sun-deep)", color: "var(--sun-deep)" }}
                      >
                        {t("pdp.preorderopen")}
                      </span>
                      <span className="tag">{t("pdp.reserve")}</span>
                    </>
                  ) : (
                    <>
                      <span className="tag">{t("pdp.instock")}</span>
                      <span className="tag">{t("pdp.ships")}</span>
                      <span className="tag">{t("pdp.custom")}</span>
                    </>
                  )}
                </div>

                {merged.price ? (
                  <div style={{ margin: "0 0 24px", display: "flex", alignItems: "baseline", gap: 10 }}>
                    <span style={{ fontFamily: "var(--font-display)", fontSize: 30, letterSpacing: "-0.01em", color: "var(--ink)" }}>
                      PKR {merged.price.toLocaleString()}
                    </span>
                    <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>{t("cfg.perunit")}</span>
                  </div>
                ) : null}

                <table className="spec-table">
                  <tbody>
                    {product.specs.map(([k, v], i) => (
                      <tr key={i}>
                        <td>{lc(k)}</td>
                        <td>{lc(v)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {product.description && (
                  <div
                    style={{ marginTop: 24, padding: "24px 0", borderTop: "1px solid var(--rule)" }}
                  >
                    <div
                      className="mono"
                      style={{
                        fontSize: 10,
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        color: "var(--accent-deep)",
                        marginBottom: 12,
                      }}
                    >
                      {t("pdp.why")}
                    </div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 15.5,
                        lineHeight: 1.65,
                        color: "var(--ink)",
                        textWrap: "pretty",
                      }}
                    >
                      {lc(product.description)}
                    </p>
                  </div>
                )}

                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    flexWrap: "wrap",
                    marginTop: 24,
                    paddingTop: 24,
                    borderTop: "1px solid var(--ink)",
                  }}
                >
                  <WhatsAppButton productName={product.name}>
                    {product.status === "upcoming"
                      ? t("pdp.preorderwa")
                      : t("pdp.inquirewa")}{" "}
                    <span className="arrow" style={{ marginLeft: 4 }}>
                      →
                    </span>
                  </WhatsAppButton>
                  <a href={phoneHref} className="btn btn-ghost">
                    {t("pdp.callus")}
                  </a>
                </div>

                <div
                  style={{
                    marginTop: 24,
                    padding: 24,
                    background: "var(--accent-soft)",
                    border: "1px solid var(--accent)",
                    borderRadius: 8,
                  }}
                >
                  <div
                    className="mono"
                    style={{
                      fontSize: 10,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      color: "var(--accent-deep)",
                      marginBottom: 10,
                    }}
                  >
                    {t("pdp.note.k")}
                  </div>
                  <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "var(--ink)" }}>
                    {t("pdp.note.d")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {related.length > 0 && (
          <section className="section">
            <div className="container">
              <div className="section-head">
                <div className="num">{t("pdp.related.n")}</div>
                <h2 dangerouslySetInnerHTML={{ __html: t("pdp.related.t") }} />
                <Link href={`/products?cat=${product.categoryId}`} className="btn-link">
                  {t("pdp.seeall")} <span className="arrow">→</span>
                </Link>
              </div>
              <div className="ec-grid">
                {related.map((p) => (
                  <EcomCard key={p.id} p={p} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      )}
    </>
  );
}
