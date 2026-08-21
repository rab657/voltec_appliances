import type { Metadata } from "next";
import Link from "next/link";
import { PRODUCTS, CATEGORIES } from "@/lib/products";
import { FAMILIES, familyBySlug, membersOf, isProductInHiddenFamily } from "@/lib/showcase-data";
import type { CategoryId } from "@/lib/types";
import EcomCard from "@/components/EcomCard";
import WhatsAppButton from "@/components/WhatsAppButton";
import SortSelect from "@/components/SortSelect";
import JsonLd from "@/components/JsonLd";
import { SITE, absUrl } from "@/lib/site";
import { getT, getContent } from "@/lib/i18n-server";
import { getMediaMap, resolveProducts } from "@/lib/product-media";

export async function generateMetadata({
  searchParams,
}: PageProps<"/products">): Promise<Metadata> {
  const sp = await searchParams;
  const slug = typeof sp.range === "string" ? sp.range : undefined;
  const range = slug ? familyBySlug(slug) : undefined;
  if (range && !range.hidden) {
    return {
      title: `${range.name} — all models & prices`,
      description: range.blurb,
      alternates: { canonical: `/products?range=${range.slug}` },
    };
  }
  return {
    title: "Shop Products — Voltage Stabilizers, Lithium Cells & Industrial",
    description:
      "Voltage stabilizers (IGBT, SVC, AVR), genuine EVE lithium cells, and industrial systems to 500kVA — in stock and ready to ship from our China and Pakistan hubs.",
    alternates: { canonical: "/products" },
  };
}

export default async function ProductsPage({
  searchParams,
}: PageProps<"/products">) {
  const sp = await searchParams;
  const t = await getT();
  const { lc } = await getContent();
  const mediaMap = await getMediaMap();
  // Code products + admin-created variants, so family counts include new variants.
  const resolved = resolveProducts(mediaMap);
  const cat = (typeof sp.cat === "string" ? sp.cat : "all") as CategoryId;
  const sort = typeof sp.sort === "string" ? sp.sort : "default";
  // ?range=<family slug> narrows to one product line (e.g. the 4 SVC models).
  // This is where the homepage range bands and the nav now point — a collection
  // of that line's models, each card opening its own product page.
  const rangeSlug = typeof sp.range === "string" ? sp.range : undefined;
  const range = rangeSlug ? familyBySlug(rangeSlug) : undefined;
  const catName = (id: string) => t(`cat.${id}`);

  // Visibility respects admin overrides (product_overrides.hidden) layered over
  // the code default.
  const isHidden = (p: (typeof PRODUCTS)[number]) =>
    isProductInHiddenFamily(p) ||
    (mediaMap[p.id] ? mediaMap[p.id].hidden : Boolean(p.hidden));
  const catCount = (id: string) =>
    resolved.filter((p) => (id === "all" || p.categoryId === id) && !isHidden(p)).length;

  // Every model is its own card → its own /products/[id] page (2026-08-19).
  const productsIn = (cid: CategoryId) =>
    resolved.filter((p) => p.categoryId === cid && !isHidden(p));

  let entries =
    range && !range.hidden
      ? membersOf(range, resolved).filter((p) => !isHidden(p))
      : cat === "all"
        ? ["stabilizers", "industrial", "cells", "parts"].flatMap((c) => productsIn(c as CategoryId))
        : productsIn(cat);
  if (sort === "az") {
    entries = [...entries].sort((a, b) => a.name.localeCompare(b.name));
  }

  const productCount = range ? entries.length : catCount(cat);
  const catLabel = range ? lc(range.name) : catName(cat);
  // Sibling lines within the same category, so a range collection can pivot.
  const siblingRanges = range
    ? FAMILIES.filter(
        (f) =>
          !f.hidden &&
          f.categoryId === range.categoryId &&
          membersOf(f, resolved).some((p) => !isHidden(p)),
      )
    : [];

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: catLabel,
          numberOfItems: entries.length,
          itemListElement: entries.map((p, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: absUrl(`/products/${p.id}`),
            name: p.name,
          })),
        }}
      />
      <main>
        <section className="shop-head">
          <div className="container">
            <div className="crumbs">
              <Link href="/">{t("nav.home")}</Link> <span>/</span>
              {range ? (
                <>
                  <Link href="/products">{t("shop.crumb")}</Link> <span>/</span>{" "}
                  <span>{catLabel}</span>
                </>
              ) : (
                <>
                  <span>{t("shop.crumb")}</span>
                  {cat !== "all" && (
                    <>
                      <span>/</span> <span>{catLabel}</span>
                    </>
                  )}
                </>
              )}
            </div>
            <h1>{range ? catLabel : t("shop.h1")}</h1>
            <p>{range ? lc(range.blurb) : t("shop.intro")}</p>
          </div>
        </section>

        <section className="shop-wrap">
          <div className="container shop-grid">
            <aside className="shop-side">
              {siblingRanges.length > 1 && (
                <div className="shop-side-block">
                  <h4>{t("shop.ranges")}</h4>
                  <ul className="shop-cats">
                    {siblingRanges.map((f) => (
                      <li key={f.slug}>
                        <Link
                          href={`/products?range=${f.slug}`}
                          className={range?.slug === f.slug ? "active" : ""}
                        >
                          <span>{lc(f.name)}</span>
                          <span className="shop-count">
                            {membersOf(f, resolved).filter((p) => !isHidden(p)).length}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="shop-side-block">
                <h4>{t("shop.cats")}</h4>
                <ul className="shop-cats">
                  {CATEGORIES.filter((c) => catCount(c.id) > 0).map((c) => (
                    <li key={c.id}>
                      <Link
                        href={c.id === "all" ? "/products" : `/products?cat=${c.id}`}
                        className={!range && cat === c.id ? "active" : ""}
                      >
                        <span>{catName(c.id)}</span>
                        <span className="shop-count">{catCount(c.id)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="shop-side-block shop-help">
                <h4>{t("shop.help.t")}</h4>
                <p>{t("shop.help.d")}</p>
                <WhatsAppButton>{t("shop.help.btn")}</WhatsAppButton>
              </div>
            </aside>

            <div className="shop-main">
              <div className="shop-toolbar">
                <span className="shop-results">
                  {productCount} {productCount === 1 ? t("shop.product") : t("shop.products")}
                  {cat !== "all" || range ? ` ${t("shop.in")} ${catLabel}` : ""}
                </span>
                <SortSelect value={sort} />
              </div>
              <div className="ec-grid">
                {entries.map((p) => (
                  <EcomCard key={p.id} p={p} />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="b2b-band">
          <div className="container b2b-inner">
            <div>
              <div className="eyebrow light" style={{ marginBottom: 16 }}>
                {t("b2b.k")}
              </div>
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 400,
                  fontSize: "clamp(32px,4vw,52px)",
                  lineHeight: 1.05,
                  letterSpacing: "-0.02em",
                  margin: "0 0 16px",
                }}
              >
                {t("b2b.t")}
              </h2>
              <p
                style={{
                  fontSize: 16,
                  lineHeight: 1.6,
                  color: "oklch(95% 0.01 40 / 0.85)",
                  maxWidth: "52ch",
                  margin: 0,
                }}
              >
                {t("b2b.d")}
              </p>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
                alignItems: "flex-start",
              }}
            >
              <WhatsAppButton variant="light">{t("b2b.btn")}</WhatsAppButton>
              <a
                href={`tel:${SITE.phone.replace(/[^+\d]/g, "")}`}
                className="btn btn-ghost-light"
              >
                {t("cta.call")} {SITE.phoneDisplay}
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
