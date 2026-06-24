import type { Metadata } from "next";
import Link from "next/link";
import { PRODUCTS, CATEGORIES } from "@/lib/products";
import { FAMILIES } from "@/lib/showcase-data";
import type { CategoryId } from "@/lib/types";
import EcomCard from "@/components/EcomCard";
import FamilyCard from "@/components/FamilyCard";
import WhatsAppButton from "@/components/WhatsAppButton";
import SortSelect from "@/components/SortSelect";
import JsonLd from "@/components/JsonLd";
import { SITE, absUrl } from "@/lib/site";
import { getT } from "@/lib/i18n-server";

export const metadata: Metadata = {
  title: "Shop Products — Voltage Stabilizers, Lithium Cells & Industrial",
  description:
    "Voltage stabilizers (IGBT, SVC, AVR), genuine EVE lithium cells, and industrial systems to 500kVA — in stock and ready to ship from our China and Pakistan hubs.",
  alternates: { canonical: "/products" },
};

export default async function ProductsPage({
  searchParams,
}: PageProps<"/products">) {
  const sp = await searchParams;
  const t = await getT();
  const cat = (typeof sp.cat === "string" ? sp.cat : "all") as CategoryId;
  const sort = typeof sp.sort === "string" ? sp.sort : "default";
  const catName = (id: string) => t(`cat.${id}`);

  // Catalog entries: stabilizers/industrial show as FAMILY cards (→ range page,
  // model picker); cells & parts show as individual product cards (→ own page).
  type Entry = { kind: "family"; slug: string } | { kind: "product"; id: string };
  const stabFamilies = (cid: CategoryId): Entry[] =>
    FAMILIES.filter((f) => f.categoryId === cid).map((f) => ({ kind: "family", slug: f.slug }));
  const productsIn = (cid: CategoryId): Entry[] =>
    PRODUCTS.filter((p) => p.categoryId === cid && !p.hidden).map((p) => ({ kind: "product", id: p.id }));

  let entries: Entry[];
  if (cat === "stabilizers") entries = stabFamilies("stabilizers");
  else if (cat === "industrial") entries = stabFamilies("industrial");
  else if (cat === "cells") entries = productsIn("cells");
  else if (cat === "parts") entries = stabFamilies("parts");
  else
    entries = [
      ...stabFamilies("stabilizers"),
      ...stabFamilies("industrial"),
      ...productsIn("cells"),
      ...stabFamilies("parts"),
    ];
  if (sort === "az" && (cat === "cells" || cat === "parts")) {
    const byName = (id: string) => PRODUCTS.find((p) => p.id === id)?.name || "";
    entries = [...entries].sort((a, b) =>
      a.kind === "product" && b.kind === "product" ? byName(a.id).localeCompare(byName(b.id)) : 0,
    );
  }

  const productCount =
    cat === "all"
      ? PRODUCTS.filter((p) => !p.hidden).length
      : PRODUCTS.filter((p) => p.categoryId === cat && !p.hidden).length;
  const catLabel = catName(cat);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: catLabel,
          numberOfItems: entries.length,
          itemListElement: entries.map((e, i) => {
            const fam = e.kind === "family" ? FAMILIES.find((f) => f.slug === e.slug)! : null;
            const prod = e.kind === "product" ? PRODUCTS.find((p) => p.id === e.id)! : null;
            return {
              "@type": "ListItem",
              position: i + 1,
              url: fam ? absUrl(`/showcase/${fam.slug}`) : absUrl(`/products/${prod!.id}`),
              name: fam ? fam.name : prod!.name,
            };
          }),
        }}
      />
      <main>
        <section className="shop-head">
          <div className="container">
            <div className="crumbs">
              <Link href="/">{t("nav.home")}</Link> <span>/</span> <span>{t("shop.crumb")}</span>
              {cat !== "all" && (
                <>
                  <span>/</span> <span>{catLabel}</span>
                </>
              )}
            </div>
            <h1>{t("shop.h1")}</h1>
            <p>{t("shop.intro")}</p>
          </div>
        </section>

        <section className="shop-wrap">
          <div className="container shop-grid">
            <aside className="shop-side">
              <div className="shop-side-block">
                <h4>{t("shop.cats")}</h4>
                <ul className="shop-cats">
                  {CATEGORIES.map((c) => (
                    <li key={c.id}>
                      <Link
                        href={c.id === "all" ? "/products" : `/products?cat=${c.id}`}
                        className={cat === c.id ? "active" : ""}
                      >
                        <span>{catName(c.id)}</span>
                        <span className="shop-count">{c.count}</span>
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
                  {cat !== "all" ? ` ${t("shop.in")} ${catLabel}` : ""}
                </span>
                <SortSelect value={sort} />
              </div>
              <div className="ec-grid">
                {entries.map((e) =>
                  e.kind === "family" ? (
                    <FamilyCard key={`f-${e.slug}`} family={FAMILIES.find((f) => f.slug === e.slug)!} />
                  ) : (
                    <EcomCard key={e.id} p={PRODUCTS.find((p) => p.id === e.id)!} />
                  ),
                )}
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
