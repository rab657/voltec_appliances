import Link from "next/link";
import type { Product } from "@/lib/types";
import { PRODUCTS } from "@/lib/products";
import { SITE } from "@/lib/site";
import { getT, getContent } from "@/lib/i18n-server";
import PdpShell, { type PdpMedia, type PdpTrust } from "@/components/pdp/PdpShell";
import PdpDetails from "@/components/pdp/PdpDetails";
import { Slot } from "@/components/showcase/primitives";

// "Built to last" advantages — moved here from the cells hub; lives on the
// product page. Reconciled to 5,000+ cycles / Grade-A.
const BENEFITS: { n: string; title: string; desc: string; img: string }[] = [
  { n: "01", title: "5,000+ cycles", desc: "Over a decade of daily use at 80% depth of discharge.", img: "assets/cells/vp-cycles.jpg" },
  { n: "02", title: "Thermal stability", desc: "LFP stays safe in Pakistan's hot rooms with no AC.", img: "assets/cells/vp-thermal.jpg" },
  { n: "03", title: "Genuine & traceable", desc: "A scannable QR code checks every Grade-A cell.", img: "assets/cells/vp-traceable.jpg" },
  { n: "04", title: "Capacity matched", desc: "Capacity and voltage matched in Lahore so your pack balances evenly.", img: "assets/cells/vp-matched.jpg" },
  { n: "05", title: "Wide temperature", desc: "Works from -20 °C to +55 °C.", img: "assets/cells/vp-temperature.jpg" },
  { n: "06", title: "5-year warranty", desc: "Prorated cover, backed from Lahore.", img: "assets/cells/vp-warranty.jpg" },
];

// Cell product page on the shared Alladin-style PDP shell (gallery + buy
// panel + trust rows), followed by the cell-specific storytelling sections.
export default async function CellDetail({ product }: { product: Product }) {
  const t = await getT();
  const { lc } = await getContent();
  const c = product.cell!;
  const SCALE = [
    t("cell.scale.cell"), t("cell.scale.module"), t("cell.scale.pack"), t("cell.scale.rack"), t("cell.scale.system"),
  ];
  const others = PRODUCTS.filter((p) => p.categoryId === "cells" && p.id !== product.id).slice(0, 4);
  const phoneHref = `tel:${SITE.phone.replace(/[^+\d]/g, "")}`;

  // Gallery: product.image first, then extra photos + videos.
  const heroSrc = product.image.startsWith("/") || product.image.startsWith("http") ? product.image : `/${product.image}`;
  const media: PdpMedia[] = [
    { type: "img", src: heroSrc },
    ...(c.gallery || []).map((src) => ({ type: "img" as const, src })),
    ...(c.videos || []).map((v) => ({ type: "video" as const, src: v.src, poster: v.poster })),
  ];
  const buyable = Boolean(product.price && c.cartonSize);

  return (
    <main>
      {/* ===== Masthead — shared PDP shell ===== */}
      <section className="sb-mast" style={{ paddingBottom: 0, borderBottom: 0 }}>
        <div className="container">
          <div className="sb-crumbs">
            <Link href="/">Home</Link> <span>/</span>
            <Link href="/products">Products</Link> <span>/</span>
            <Link href="/products?cat=cells">Lithium Cells</Link> <span>/</span>
            <span>{lc(product.name)}</span>
          </div>

          <PdpShell
            h1={lc(product.name)}
            lede={lc(product.description)}
            model={{
              id: product.id,
              name: lc(product.name),
              waName: product.name,
              sku: product.id.toUpperCase(),
              type: lc(product.category),
              price: product.price,
              compareAt: product.compareAt,
              unitNote: buyable ? t("pp.unit.cell") : undefined,
              step: buyable ? c.cartonSize : 1,
              media,
              status: product.status,
              tech: product.tech,
              badge: product.badge,
              glance: [
                [t("cell.tile.cap"), `${c.capacityAh} Ah`],
                [t("cell.tile.volt"), `${c.voltageV} V`],
                [t("cell.tile.cyc"), c.cycles],
                [t("cell.tile.cd"), c.cRate],
              ],
              lead: true,
            }}
            badges={[
              ...(product.badge ? [lc(product.badge)] : []),
              t("cell.genuine"),
              t("pp.evedist"),
            ]}
            brand={[{ src: "assets/partners/eve-logo.png", alt: "EVE Energy — authorized distributor" }]}
            datasheet={product.datasheet}
            trust={
              [
                { icon: "shield", k: "pp.trust.wty5" },
                { icon: "check", k: "pp.trust.genuine" },
                ...(buyable ? ([{ icon: "box", k: "pp.trust.carton" }] as PdpTrust[]) : []),
                { icon: "truck", k: "pp.trust.deliv" },
                { icon: "bank", k: "pp.trust.pay" },
              ] satisfies PdpTrust[]
            }
            phone={phoneHref}
          />
        </div>
      </section>

      {/* ===== Where it's used ===== */}
      <section className="sb-section" style={{ paddingTop: 24 }}>
        <div className="container">
          <div className="sb-head is-center">
            <div className="sb-eyebrow">{t("cell.app.k")}</div>
            <h2 dangerouslySetInnerHTML={{ __html: t("cell.app.t") }}></h2>
          </div>
          <div className="cellpg-apps">
            {c.applications.map((a) => (
              <span className="cellpg-app" key={a}>{lc(a)}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Description + key features + full specs ===== */}
      <section className="sb-section" style={{ paddingTop: 0, paddingBottom: 0 }}>
        <div className="container">
          <PdpDetails
            features={c.features.map((f) => lc(f))}
            specs={product.specs.map(([k, v]) => [lc(k), lc(v)] as [string, string])}
          />
        </div>
      </section>

      {/* ===== Built to last — key advantages ===== */}
      <section className="sb-section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="sb-head is-center">
            <div className="sb-eyebrow">Key advantages</div>
            <h2>Built to <em>last</em>.</h2>
          </div>
          <div className="sb-adv-grid">
            {BENEFITS.map((a) => (
              <div className="sb-adv" key={a.n}>
                <Slot src={a.img} label={a.title} cover />
                <div className="sb-adv-band">
                  <div className="n">{a.n}</div>
                  <h4>{a.title}</h4>
                  <p>{a.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Cell → system scale ===== */}
      <section className="sb-section sb-dark">
        <div className="container">
          <div className="sb-head is-center">
            <div className="sb-eyebrow">{t("cell.scale.k")}</div>
            <h2 dangerouslySetInnerHTML={{ __html: t("cell.scale.t") }}></h2>
            <p>{t("cell.scale.d")}</p>
          </div>
          <div className="cellpg-scale">
            {SCALE.map((s, i) => (
              <span key={s} style={{ display: "contents" }}>
                {i > 0 && <span className="cellpg-scale-arr">→</span>}
                <div className="cellpg-scale-step">{s}</div>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Certifications ===== */}
      <section className="sb-section" style={{ paddingBottom: 0 }}>
        <div className="container">
          <div className="sb-head is-center">
            <div className="sb-eyebrow">{t("cell.cert.k")}</div>
            <h2 dangerouslySetInnerHTML={{ __html: t("cell.cert.t") }}></h2>
          </div>
          <div className="cellpg-certs">
            {c.certifications.map((cert) => (
              <span className="cellpg-cert" key={cert}>{cert}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Other cells ===== */}
      {others.length > 0 && (
        <section className="sb-section">
          <div className="container">
            <div className="section-head">
              <div className="num"></div>
              <h2 dangerouslySetInnerHTML={{ __html: t("cell.other") }}></h2>
              <Link href="/products?cat=cells" className="btn-link">
                {t("sh.seeall")} <span className="arrow">→</span>
              </Link>
            </div>
            <div className="cellpg-others">
              {others.map((p) => (
                <Link key={p.id} href={`/products/${p.id}`} className="cellpg-other">
                  <span className="cellpg-other-cap">{p.cell?.capacityAh}Ah</span>
                  <span className="cellpg-other-name">{lc(p.name).replace(/^EVE\s+/, "")}</span>
                  <span className="cellpg-other-fmt">{lc(p.cell?.format || "")}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
