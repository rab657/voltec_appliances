import Link from "next/link";
import type { Product } from "@/lib/types";
import { PRODUCTS, whatsappLink } from "@/lib/products";
import { getT, getContent } from "@/lib/i18n-server";
import { WhatsAppIcon } from "@/components/icons";
import CellMedia, { type CellMediaItem } from "@/components/CellMedia";
import CellBuy from "@/components/CellBuy";
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

// EVE-style detail page for a single lithium cell — built on the same design
// system (sb-section / sb-head / sb-spec) as the stabilizer showcase pages so
// the look, colour theme and table style match across the whole site.
export default async function CellDetail({ product }: { product: Product }) {
  const t = await getT();
  const { lc } = await getContent();
  const c = product.cell!;
  const upcoming = product.status === "upcoming";
  const SCALE = [
    t("cell.scale.cell"), t("cell.scale.module"), t("cell.scale.pack"), t("cell.scale.rack"), t("cell.scale.system"),
  ];
  const tiles: [string, string][] = [
    [t("cell.tile.cap"), `${c.capacityAh} Ah`],
    [t("cell.tile.volt"), `${c.voltageV} V`],
    [t("cell.tile.cyc"), c.cycles],
    [t("cell.tile.wt"), c.weight],
    [t("cell.tile.size"), c.size],
    [t("cell.tile.cd"), c.cRate],
  ];
  const others = PRODUCTS.filter((p) => p.categoryId === "cells" && p.id !== product.id).slice(0, 4);

  // Masthead media: product.image first, then any extra gallery photos + videos.
  const heroSrc = product.image.startsWith("/") || product.image.startsWith("http") ? product.image : `/${product.image}`;
  const media: CellMediaItem[] = [
    { type: "img", src: heroSrc, alt: product.name },
    ...(c.gallery || []).map((src) => ({ type: "img" as const, src, alt: product.name })),
    ...(c.videos || []).map((v) => ({ type: "video" as const, src: v.src, poster: v.poster, alt: `${product.name} — video` })),
  ];
  const buyable = Boolean(product.price && c.cartonSize);

  return (
    <main>
      {/* ===== Masthead ===== */}
      <section className="sb-mast">
        <div className="container">
          <div className="sb-crumbs">
            <Link href="/">Home</Link> <span>/</span>
            <Link href="/products">Products</Link> <span>/</span>
            <Link href="/showcase/cells">Lithium Cells</Link> <span>/</span>
            <span>{product.name}</span>
          </div>

          <div className="cellpg-grid">
            <div className="cellpg-media">
              <CellMedia media={media} format={lc(c.format)} />
            </div>

            <div>
              <div className="sb-mast-badges">
                {product.badge && <span className="sb-badge is-accent">{product.badge}</span>}
                <span className="sb-badge is-line">{t("cell.genuine")}</span>
              </div>
              <h1>{lc(product.name)}</h1>
              <p className="sb-mast-lede">{lc(product.description)}</p>

              <div className="sb-mast-stats cellpg-tiles">
                {tiles.map(([k, v]) => (
                  <div className="sb-stat" key={k}>
                    <div className="v">{v}</div>
                    <div className="k">{k}</div>
                  </div>
                ))}
              </div>

              <div className="cellpg-origin">{t("cell.origin")}</div>

              {buyable ? (
                <CellBuy price={product.price!} cartonSize={c.cartonSize!} name={product.name} />
              ) : (
                <div className="sb-mast-cta">
                  <a
                    href={whatsappLink(product.name)}
                    target="_blank"
                    rel="noopener"
                    className="btn btn-wa cellpg-inquiry"
                  >
                    <WhatsAppIcon /> <span>{upcoming ? t("cell.preorder") : `${t("cell.inquiry")} — ${c.capacityAh}Ah`}</span>
                  </a>
                  <Link href="/contact" className="btn btn-ghost">
                    {t("cell.contact")}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ===== Where it's used ===== */}
      <section className="sb-section">
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

      {/* ===== Built to last — key advantages (moved from the cells hub) ===== */}
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

      {/* ===== Why this cell — feature tiles ===== */}
      <section className="sb-section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="sb-head is-center">
            <div className="sb-eyebrow">{t("cell.why.k")}</div>
            <h2 dangerouslySetInnerHTML={{ __html: t("cell.why.t") }}></h2>
          </div>
          <div className="cellpg-feats">
            {c.features.map((f) => (
              <div className="cellpg-feat" key={f}>{lc(f)}</div>
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
      <section className="sb-section" style={{ paddingTop: 0 }}>
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

      {/* ===== Full specs — same sb-spec table as the showcase pages ===== */}
      <section className="sb-section" id="spec" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="sb-head is-center">
            <div className="sb-eyebrow">{t("cell.spec.k")}</div>
            <h2 dangerouslySetInnerHTML={{ __html: t("cell.spec.t") }}></h2>
          </div>
          <div className="sb-spec-wrap">
            <table className="sb-spec">
              <thead>
                <tr>
                  <th className="is-class">{t("tbl.param")}</th>
                  <th>{t("tbl.spec")}</th>
                </tr>
              </thead>
              <tbody>
                {product.specs.map(([k, v]) => (
                  <tr key={k}>
                    <td className="param">{lc(k)}</td>
                    <td className="val">{lc(v)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ===== Other cells ===== */}
      {others.length > 0 && (
        <section className="sb-section" style={{ paddingTop: 0 }}>
          <div className="container">
            <div className="section-head">
              <div className="num"></div>
              <h2 dangerouslySetInnerHTML={{ __html: t("cell.other") }}></h2>
              <Link href="/showcase/cells" className="btn-link">
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
