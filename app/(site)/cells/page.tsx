import type { Metadata } from "next";
import Link from "next/link";
import CellShowcase from "@/components/CellShowcase";
import WhatsAppButton from "@/components/WhatsAppButton";
import JsonLd from "@/components/JsonLd";
import { absUrl, SITE } from "@/lib/site";
import { getT } from "@/lib/i18n-server";

// EVE LF100LA lithium cell — buyable line (Rs 11,500/cell, min 8). Landing page
// + Google lithium ad destination. Sells the genuine Grade-A / QR-traceable
// story with real photos + video, then a qty picker → WhatsApp order.

const VP: { title: string; desc: string; img: string }[] = [
  { title: "5000+ cycles", desc: "LiFePO4 chemistry rated for 5,000+ charge cycles — years of daily solar and UPS use.", img: "/assets/cells/vp-cycles.jpg" },
  { title: "Capacity-matched", desc: "Every cell is capacity- and IR-tested and matched in Lahore before it ships, so your bank stays balanced.", img: "/assets/cells/vp-matched.jpg" },
  { title: "QR-traceable & genuine", desc: "Each cell is laser-etched with a QR code — genuine Grade-A EVE, verifiable, not seconds or B-grade.", img: "/assets/cells/vp-traceable.jpg" },
  { title: "Full test report", desc: "A capacity test report ships with every batch, so you see exactly what you paid for.", img: "/assets/cells/vp-warranty.jpg" },
];

const FAQS: { q: string; a: string }[] = [
  {
    q: "What is the minimum order, and what is the price?",
    a: "EVE LF100LA Grade-A cells are Rs 11,500 per cell, with a minimum order of 8 cells (one 24V set). 16 cells make a 48V set. Larger and dealer quantities get bulk pricing — message us with your requirement.",
  },
  {
    q: "Are these genuine Grade-A EVE cells?",
    a: "Yes. These are brand-new, Grade-A EVE LF100LA cells (3.2V, 100Ah / 320Wh), imported directly. Each cell is laser-etched with a QR code you can verify, and every batch ships with a full capacity test report — not B-grade or reclaimed cells.",
  },
  {
    q: "How many cells do I need for my system?",
    a: "For a 24V bank you need 8 cells in series; for a 48V bank, 16 cells. Two sets of 8 give 24V with more capacity in parallel. Tell us your inverter voltage and the backup you want and we'll confirm the exact count.",
  },
  {
    q: "Do you deliver, and do you supply BMS and packs?",
    a: "Yes — we deliver across Pakistan (packing and freight confirmed on WhatsApp) and we can supply matching BMS and build complete packs to your spec. Message us your requirement for a quote.",
  },
];

export const metadata: Metadata = {
  title: "EVE LF100LA Grade-A Lithium Cells (3.2V 100Ah) — Price in Pakistan | Voltec",
  description:
    "Genuine Grade-A EVE LF100LA LiFePO4 cells — 3.2V, 100Ah, 5000+ cycles, QR-traceable, full test report. Rs 11,500 per cell (minimum 8). For solar & UPS banks — 8 cells = 24V, 16 = 48V. Delivery across Pakistan. Order on WhatsApp.",
  alternates: { canonical: "/cells" },
  openGraph: {
    type: "website",
    title: "EVE LF100LA Grade-A Lithium Cells — 3.2V 100Ah | Voltec",
    description:
      "Genuine Grade-A EVE LiFePO4 cells, QR-traceable with full test report. Rs 11,500/cell (min 8). Solar & UPS energy storage. Delivery Pakistan-wide.",
    url: absUrl("/cells"),
    images: [{ url: absUrl("/assets/cells/cell-hero.webp"), width: 1080, height: 1080, alt: "EVE LF100LA Grade-A lithium cell — back in stock at Voltec" }],
  },
};

export default async function CellsPage() {
  const t = await getT();

  return (
    <main>
      <JsonLd
        id="ld-cells"
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: "EVE LF100LA Grade-A LiFePO4 Lithium Cell (3.2V 100Ah)",
          image: [absUrl("/assets/cells/cell-hero.webp"), absUrl("/assets/cells/cell-1.webp"), absUrl("/assets/cells/cell-3.webp")],
          description:
            "Genuine Grade-A EVE LF100LA LiFePO4 prismatic cell, 3.2V 100Ah (320Wh), 5000+ cycles, QR-traceable with full capacity test report. For solar and UPS energy storage.",
          brand: { "@type": "Brand", name: "EVE" },
          sku: "EVE-LF100LA",
          offers: {
            "@type": "Offer",
            priceCurrency: "PKR",
            price: 11500,
            availability: "https://schema.org/InStock",
            eligibleQuantity: { "@type": "QuantitativeValue", minValue: 8 },
            url: absUrl("/cells"),
            seller: { "@type": "Organization", name: SITE.name },
          },
        }}
      />
      <JsonLd
        id="ld-cells-faq"
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
        }}
      />

      {/* ===== Hero: gallery + buy panel ===== */}
      <section className="page-head">
        <div className="container">
          <div className="crumbs">
            <Link href="/">{t("nav.home")}</Link> <span>/</span> <Link href="/products?cat=cells">Lithium Cells</Link>{" "}
            <span>/</span> <span>EVE LF100LA</span>
          </div>
          <CellShowcase />
        </div>
      </section>

      {/* ===== Why these cells ===== */}
      <section className="section hairline-top">
        <div className="container">
          <div className="med-narrow" style={{ marginBottom: 28 }}>
            <h2 className="med-h2">Why Voltec EVE cells</h2>
            <p className="med-body">
              Not every &ldquo;Grade-A&rdquo; cell is genuine. Ours are real EVE, tested and matched
              in Lahore, and backed by our service network — since 1995.
            </p>
          </div>
          <div className="cell-vp-grid">
            {VP.map((v) => (
              <div className="cell-vp" key={v.title}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={v.img} alt={v.title} />
                <div className="cell-vp-body">
                  <strong>{v.title}</strong>
                  <p>{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Bulk / dealer strip ===== */}
      <section className="section">
        <div className="container">
          <div style={{ border: "1px solid var(--rule-strong)", borderRadius: 16, padding: "28px 26px", background: "var(--ink)", color: "#fff", display: "flex", flexWrap: "wrap", gap: 20, alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ maxWidth: "54ch" }}>
              <div className="mono" style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--steel-bright, oklch(70% 0.13 245))", marginBottom: 10 }}>
                Dealers, installers &amp; bulk
              </div>
              <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "clamp(24px,3vw,34px)", lineHeight: 1.1, margin: "0 0 10px" }}>
                Building banks in volume?
              </h2>
              <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.6, color: "oklch(90% 0.02 250 / 0.85)" }}>
                We supply solar installers and dealers by the pallet, with matched cells, BMS and
                built-to-spec packs. Message your quantity and voltage for bulk pricing.
              </p>
            </div>
            <WhatsAppButton productName="EVE LF100LA cells — bulk / dealer quote (qty + voltage)" variant="light" lead>
              Get bulk pricing
            </WhatsAppButton>
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="section hairline-top">
        <div className="container">
          <div className="faq-wrap">
            <div className="faq-aside">
              <div className="num" style={{ fontFamily: "var(--font-mono)", fontSize: 12, letterSpacing: "0.14em", color: "var(--ink-3)", textTransform: "uppercase", marginBottom: 14 }}>
                FAQ
              </div>
              <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "clamp(30px,3.6vw,46px)", lineHeight: 1.02, letterSpacing: "-0.02em", margin: 0 }}>
                Cell <em>questions</em>.
              </h2>
            </div>
            <div className="faq-list">
              {FAQS.map((f, i) => (
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
    </main>
  );
}
