import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PRODUCTS, getProduct } from "@/lib/products";
import { familySlugOf, familyBySlug, membersOf, isProductInHiddenFamily } from "@/lib/showcase-data";
import { acModel } from "@/lib/ac-products";
import EcomCard from "@/components/EcomCard";
import JsonLd from "@/components/JsonLd";
import ViewItemTracker from "@/components/ViewItemTracker";
import CellDetail from "@/components/CellDetail";
import PdpShell, { type PdpMedia, type PdpModel, type PdpTrust } from "@/components/pdp/PdpShell";
import PdpDetails from "@/components/pdp/PdpDetails";
import "@/styles/stabilizer.css";
import "@/styles/pdp.css";
import { SITE, absUrl, VOLTEC_ORG } from "@/lib/site";
import { productOffer } from "@/lib/product-offer";
import { getT, getContent } from "@/lib/i18n-server";
import { getMediaMap, resolveProducts } from "@/lib/product-media";
import { videoPoster, videoSource } from "@/lib/video";

export function generateStaticParams() {
  return PRODUCTS.filter((p) => !isProductInHiddenFamily(p)).map((p) => ({ id: p.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/products/[id]">): Promise<Metadata> {
  const { id } = await params;
  const product = getProduct(id);
  if (!product || isProductInHiddenFamily(product)) return { title: "Product not found" };
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
  const mediaMap = await getMediaMap();
  // Resolve includes admin-created variants (and applies name/media overrides).
  const resolved = resolveProducts(mediaMap);
  const merged = resolved.find((p) => p.id === id);
  if (!merged || isProductInHiddenFamily(merged)) notFound();
  // Every model gets its OWN page (user decision 2026-08-19) — no redirect to
  // the family showcase, no in-page model switching. Range navigation happens
  // via sibling link chips in the buy panel.
  const product = merged;
  const phoneHref = `tel:${SITE.phone.replace(/[^+\d]/g, "")}`;
  const famSlug = familySlugOf(product);
  const family = famSlug ? familyBySlug(famSlug) : undefined;
  const t = await getT();
  const { lc } = await getContent();
  const familyName = family ? lc(family.name) : "";
  const gallery = merged.images && merged.images.length ? merged.images : [product.image];
  // Photos first, then any clips — the gallery only plays self-hosted files, so
  // a YouTube/Vimeo link (which the admin UI allows) is skipped rather than
  // rendered as a dead <video>.
  const media: PdpMedia[] = [
    ...gallery.map((src) => ({ type: "img" as const, src })),
    ...(merged.videos || []).flatMap((url) => {
      const v = videoSource(url);
      return v && v.kind === "file"
        ? [{ type: "video" as const, src: v.src, poster: videoPoster(v.src) }]
        : [];
    }),
  ];

  // Related products, Alladin-style: the OTHER capacities/models of this range
  // come first (the buy panel stays purely single-product — user decision
  // 2026-08-19), then other visible products from the same category.
  const famMembers = family ? membersOf(family, resolved).filter((p) => !p.hidden) : [];
  const siblings = famMembers.filter((p) => p.id !== product.id);
  const sameCat = resolved.filter(
    (x) =>
      x.id !== product.id &&
      x.categoryId === product.categoryId &&
      !x.hidden &&
      !isProductInHiddenFamily(x) &&
      !siblings.some((s) => s.id === x.id),
  );
  const related = [...siblings, ...sameCat].slice(0, 4);

  // Priced AC models (R2/R3/R4) map to the bank-transfer checkout.
  const rMatch = product.name.match(/\bR[2-9]\b/);
  const ac = rMatch ? acModel(rMatch[0]) : undefined;
  const price = merged.price ?? ac?.price;
  const isStab = product.categoryId === "stabilizers" || product.categoryId === "industrial";
  const spec = (re: RegExp) => (product.specs.find((s) => re.test(s[0])) || [])[1];
  const glance: [string, string][] | undefined = isStab
    ? ([
        [t("cfg.bestfor"), lc(product.useFor || spec(/capacity/i) || "")],
        [t("cfg.input"), lc(spec(/input/i) || spec(/works from/i) || "")],
        [t("cfg.output"), lc(spec(/output/i) || "")],
        [t("cfg.efficiency"), lc(spec(/efficiency/i) || spec(/response|correction/i) || "")],
      ] as [string, string][])
    : undefined;
  const trust: PdpTrust[] =
    product.tech === "AVR"
      ? [
          { icon: "shield", k: "pp.trust.wty1" },
          { icon: "store", k: "cfg.moq" },
          { icon: "truck", k: "pp.trust.deliv" },
          { icon: "bank", k: "pp.trust.pay" },
        ]
      : isStab
        ? [
            { icon: "check", k: "pp.trust.cert" },
            { icon: "box", k: "pp.trust.custom" },
            { icon: "truck", k: "pp.trust.deliv" },
            { icon: "bank", k: "pp.trust.pay" },
          ]
        : [
            { icon: "truck", k: "pp.trust.deliv" },
            { icon: "bank", k: "pp.trust.pay" },
            { icon: "store", k: "cfg.moq" },
          ];

  return (
    <>
      <ViewItemTracker
        id={product.id}
        name={product.name}
        category={product.category}
      />
      {/* Product markup must carry offers/review/aggregateRating or Search
          Console flags it critical — inquiry-only products get no Product
          schema at all (breadcrumbs + org markup still describe the page). */}
      {productOffer(product) && (
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
            offers: productOffer(product),
          }}
        />
      )}
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
            <PdpShell
              h1={lc(product.name)}
              lede={lc(product.tagline)}
              model={
                {
                  id: product.id,
                  name: lc(product.name),
                  waName: product.name,
                  sku: product.id.toUpperCase(),
                  type: lc(product.category),
                  price,
                  compareAt: merged.compareAt,
                  unitNote: price ? t("cfg.perunit") : undefined,
                  media,
                  status: product.status,
                  tech: product.tech,
                  badge: product.badge,
                  glance,
                  buyHref: ac ? `/checkout?model=${ac.code}` : undefined,
                } satisfies PdpModel
              }
              familySlug={famSlug}
              badges={
                product.status === "upcoming"
                  ? [t("pdp.preorderopen"), t("pp.since")]
                  : [t("pp.since"), ...(product.badge ? [lc(product.badge)] : [])]
              }
              datasheet={product.datasheet}
              trust={trust}
              phone={phoneHref}
            />

            {family && siblings.length > 0 && (
              <Link
                href={`/products?range=${family.slug}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 16,
                  padding: "16px 20px",
                  margin: "0 auto 8px",
                  maxWidth: 900,
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
                    {t("pdp.seerange").replace("{n}", String(famMembers.length))}
                  </span>
                </span>
                <span className="arrow" style={{ fontSize: 20 }}>
                  →
                </span>
              </Link>
            )}

            <PdpDetails
              description={lc(product.description)}
              features={(product.features || []).map((f) => lc(f))}
              specs={product.specs.map(([k, v]) => [lc(k), lc(v)] as [string, string])}
            />

            <div
              style={{
                margin: "0 auto 40px",
                maxWidth: 900,
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
