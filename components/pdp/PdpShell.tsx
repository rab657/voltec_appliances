"use client";
import { useState } from "react";
import Link from "next/link";
import { VOLTEC_WHATSAPP } from "@/lib/products";
import { track } from "@/lib/analytics";
import { useI18n } from "@/components/I18nProvider";
import { WhatsAppIcon } from "@/components/icons";

// Alladin-style product hero, shared by every product surface: media gallery
// with thumbnails on one side; on the other a buy panel with brand row, title,
// trust badges, SKU/type rows, datasheet, was/now price + SAVE badge (or a
// "get today's price" prompt), quantity stepper, a green full-width WhatsApp
// CTA (inquiry-based — no cart) and icon trust rows.
//
// ONE product per page (user decision 2026-08-19): there is no in-page model
// switching. Other models in the range render as LINK chips that navigate to
// each sibling's own /products/[id] page.

export type PdpMedia = { type: "img" | "video"; src: string; poster?: string };
export type TrustIcon = "shield" | "truck" | "bank" | "check" | "store" | "box";
/** Trust rows are i18n keys — the shell translates them client-side. */
export type PdpTrust = { icon: TrustIcon; k: string };
/** A sibling model in the same range — a link to its own page. */
export type PdpSibling = { id: string; label: string; href: string; current?: boolean };

export type PdpModel = {
  id: string;
  /** Localized display name. */
  name: string;
  /** Canonical (English) name used in the WhatsApp message. */
  waName: string;
  sku: string;
  /** Localized category, e.g. "Lithium Cells". */
  type: string;
  price?: number;
  compareAt?: number;
  /** Localized note next to the price, e.g. "per unit". */
  unitNote?: string;
  /** Units per quantity step (8 = carton of 8 cells). Default 1. */
  step?: number;
  media: PdpMedia[];
  status?: "upcoming";
  tech?: string;
  /** Quick "at a glance" specs. */
  glance?: [string, string][];
  /** Checkout link (priced AC models) — renders a dark "Buy it now". */
  buyHref?: string;
  badge?: string;
  /** Fire the Pixel-mapped `lead` event on order (else `whatsapp_click`). */
  lead?: boolean;
};

const ICONS: Record<TrustIcon, React.ReactNode> = {
  shield: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l7 3v5c0 4.5-3 8.1-7 10-4-1.9-7-5.5-7-10V6l7-3z" /><path d="M9 12l2 2 4-4" /></svg>
  ),
  truck: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 8h13v9H1z" /><path d="M14 11h4l3 3v3h-7" /><circle cx="6" cy="18.5" r="1.6" /><circle cx="17.5" cy="18.5" r="1.6" /></svg>
  ),
  bank: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-5 9 5" /><path d="M4 9v9M9 9v9M15 9v9M20 9v9" /><path d="M2 20h20" /></svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M8.5 12.2l2.4 2.4 4.8-4.8" /></svg>
  ),
  store: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10l1-5h14l1 5" /><path d="M4 10a2.5 2.5 0 005 0 2.5 2.5 0 005 0 2.5 2.5 0 005 0" /><path d="M5 12v8h14v-8" /><path d="M9 20v-5h6v5" /></svg>
  ),
  box: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" /><path d="M4 7.5l8 4.5 8-4.5" /><path d="M12 12v9" /></svg>
  ),
};

const fmt = (n: number) => "Rs " + n.toLocaleString("en-PK");
const toUrl = (s: string) => (s.startsWith("/") || s.startsWith("http") ? s : `/${s}`);

export default function PdpShell({
  model,
  h1,
  lede,
  badges = [],
  brand = [],
  datasheet,
  trust = [],
  siblings = [],
  siblingLabelKey = "pp.model",
  familySlug,
  phone,
}: {
  model: PdpModel;
  /** Page H1 — the product name. */
  h1: string;
  lede?: string;
  /** Pill badges under the title (trust markers — no fake stars). */
  badges?: string[];
  /** Brand / partner logos, e.g. the EVE mark on cell pages. */
  brand?: { src: string; alt: string }[];
  datasheet?: string;
  trust?: PdpTrust[];
  /** Other models in this range — link chips to their own pages. */
  siblings?: PdpSibling[];
  siblingLabelKey?: string;
  /** Family slug for tracking sibling navigation. */
  familySlug?: string;
  /** tel: href — renders a ghost "Call us" button under the WhatsApp CTA. */
  phone?: string;
}) {
  const { t } = useI18n();
  const [mi, setMi] = useState(0);
  const [steps, setSteps] = useState(1);
  const active = model;

  const media = active.media.length ? active.media : [];
  const cur = media[Math.min(mi, Math.max(0, media.length - 1))];
  const step = active.step || 1;
  const units = steps * step;
  const total = active.price ? active.price * units : 0;
  const upcoming = active.status === "upcoming";
  const save = active.price && active.compareAt && active.compareAt > active.price
    ? active.compareAt - active.price
    : 0;

  const order = () => {
    const from = familySlug ? "configurator" : "pdp";
    let msg: string;
    if (active.price && step > 1) {
      // Carton order — keep the proven CellBuy message format.
      msg =
        `Hi Voltec! I'd like to order ${active.waName}.\n\n` +
        `Quantity: ${units} cells (${steps} carton${steps > 1 ? "s" : ""} of ${step})\n` +
        `At ${fmt(active.price)}/cell = ${fmt(total)} (before delivery).\n\n` +
        `Please confirm stock, packing and delivery to my city.`;
    } else if (active.price) {
      msg =
        `Hi Voltec! I'd like to order ${active.waName}.\n\n` +
        `Quantity: ${units}\n` +
        `At ${fmt(active.price)}/unit = ${fmt(total)} (before delivery).\n\n` +
        `Please confirm stock and delivery.`;
    } else {
      msg =
        `Hi Voltec! I'm interested in ${active.waName}` +
        (units > 1 ? ` (quantity: ${units})` : "") +
        `. Please share today's price, stock and delivery time.`;
    }
    if (active.lead) {
      track("lead", { product: active.waName, channel: "whatsapp", qty: units, value: total || undefined, from });
    } else {
      track("whatsapp_click", { product: active.waName, from });
    }
    window.open(`https://wa.me/${VOLTEC_WHATSAPP}?text=${encodeURIComponent(msg)}`, "_blank", "noopener");
  };

  return (
    <div className="pp-hero">
      {/* ===== Media ===== */}
      <div className="pp-media-col">
        <div className="pp-media">
          {cur?.type === "video" ? (
            <video key={cur.src} className="pp-main" src={toUrl(cur.src)} poster={cur.poster && toUrl(cur.poster)} controls playsInline />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="pp-main" src={cur ? toUrl(cur.src) : ""} alt={active.name} />
          )}
          {active.tech && <span className="pp-media-tech" data-tech={active.tech}>{active.tech}</span>}
        </div>
        {media.length > 1 && (
          <div className="pp-thumbs">
            {media.map((m, i) => (
              <button
                key={m.src + i}
                type="button"
                className={`pp-thumb ${i === mi ? "is-active" : ""}`}
                onClick={() => setMi(i)}
                aria-label={`${active.name} — ${m.type} ${i + 1}`}
              >
                {m.type === "video" && !m.poster ? (
                  // An admin-uploaded clip has no poster file — let the browser
                  // draw its first frame instead of 404ing an <img>.
                  <video src={toUrl(m.src)} preload="metadata" muted playsInline />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={toUrl(m.type === "video" ? m.poster! : m.src)} alt="" />
                )}
                {m.type === "video" && <span className="pp-thumb-play">▶</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ===== Buy panel ===== */}
      <div className="pp-panel">
        {brand.length > 0 && (
          <div className="pp-brandrow">
            {brand.map((b) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={b.src} src={toUrl(b.src)} alt={b.alt} />
            ))}
          </div>
        )}

        <h1 className="pp-title">{h1}</h1>
        {lede && <p className="pp-lede">{lede}</p>}

        {badges.length > 0 && (
          <div className="pp-badges">
            {badges.map((b) => (
              <span className="pp-badge" key={b}>{b}</span>
            ))}
          </div>
        )}

        <div className="pp-meta">
          <div className="pp-meta-row">
            <span className="pp-meta-k">{t("pp.sku")}:</span>
            <span className="pp-meta-v mono">{active.sku}</span>
          </div>
          <div className="pp-meta-row">
            <span className="pp-meta-k">{t("pp.type")}:</span>
            <span className="pp-meta-v">{active.type}</span>
          </div>
        </div>

        {datasheet && (
          <a className="pp-sheet" href={toUrl(datasheet)} target="_blank" rel="noopener">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2h9l4 4v16H6z" /><path d="M14 2v5h5" /><path d="M9 13h7M9 17h7" /></svg>
            {t("pp.datasheet")}
          </a>
        )}

        {/* Other models in the range — links to their own pages */}
        {siblings.length > 1 && (
          <div className="pp-row">
            <span className="pp-label">{t(siblingLabelKey)}</span>
            <div className="pp-chips">
              {siblings.map((s) =>
                s.current ? (
                  <span key={s.id} className="pp-chip is-active" aria-current="page">
                    {s.label}
                  </span>
                ) : (
                  <Link
                    key={s.id}
                    href={s.href}
                    className="pp-chip"
                    onClick={() => familySlug && track("configurator_select", { family: familySlug, model: s.id })}
                  >
                    {s.label}
                  </Link>
                ),
              )}
            </div>
          </div>
        )}

        {active.glance && active.glance.length > 0 && (
          <div className="pp-glance">
            {active.glance.filter(([, v]) => v).map(([k, v]) => (
              <div className="pp-glance-cell" key={k}>
                <span className="pp-glance-k">{k}</span>
                <span className="pp-glance-v">{v}</span>
              </div>
            ))}
          </div>
        )}

        {/* Price block — was/now + SAVE, or the ask-price prompt */}
        {active.price ? (
          <div className="pp-pricing">
            <div className="pp-price-line">
              {save > 0 && <span className="pp-was">{fmt(active.compareAt!)}</span>}
              <span className="pp-price">{fmt(active.price)}</span>
              {save > 0 && <span className="pp-save">{t("pp.save")} {fmt(save)}</span>}
            </div>
            {active.unitNote && <div className="pp-unit">{active.unitNote}</div>}
            <div className="pp-subtotal">
              <span>
                {t("pp.subtotal")}
                {step > 1 ? ` — ${steps} carton${steps > 1 ? "s" : ""} · ${units} cells` : units > 1 ? ` — ${units} pcs` : ""}
              </span>
              <strong>{fmt(total)}</strong>
            </div>
          </div>
        ) : (
          <div className="pp-pricing is-ask">
            <span className="pp-ask">{t("cfg.reqprice")}</span>
          </div>
        )}

        {/* Quantity + status */}
        <div className="pp-qtyrow">
          <span className="pp-label" style={{ marginBottom: 0 }}>
            {step > 1 ? t("pp.cartons") : t("pp.qty")}
          </span>
          {step > 1 && (
            <div className="pp-qchips">
              {[1, 2, 4].map((c) => (
                <button key={c} type="button" className={`pp-qchip ${steps === c ? "is-active" : ""}`} onClick={() => setSteps(c)}>
                  {c}
                </button>
              ))}
            </div>
          )}
          <div className="pp-stepper">
            <button type="button" onClick={() => setSteps((q) => Math.max(1, q - 1))} aria-label="−">−</button>
            <span>{steps}</span>
            <button type="button" onClick={() => setSteps((q) => Math.min(40, q + 1))} aria-label="+">+</button>
          </div>
          {step > 1 && <span className="pp-qtynote">= {units} cells</span>}
        </div>
        <div className="pp-stock">
          {upcoming ? (
            <span className="is-soon">{t("cfg.preorder")}</span>
          ) : (
            <span className="is-ok">{t("cfg.instock")}</span>
          )}
        </div>

        {/* CTAs — WhatsApp-first, no cart */}
        <div className="pp-ctas">
          <button type="button" className="btn btn-wa pp-wa" onClick={order}>
            <WhatsAppIcon />
            <span>
              {upcoming
                ? t("pdp.preorderwa")
                : active.price
                  ? t("pp.orderwa")
                  : t("pp.askprice")}
            </span>
          </button>
          {active.buyHref && !upcoming && (
            <Link
              href={active.buyHref}
              className="btn pp-buy"
              onClick={() => familySlug && track("configurator_select", { family: familySlug, model: active.id, action: "buy_now" })}
            >
              {t("pp.buynow")}
            </Link>
          )}
          {phone && (
            <a href={phone} className="btn btn-ghost pp-call" onClick={() => track("phone_click", { from: familySlug ? "configurator" : "pdp" })}>
              {t("pdp.callus")}
            </a>
          )}
        </div>

        {/* Trust / policy rows */}
        {trust.length > 0 && (
          <ul className="pp-trust">
            {trust.map((r) => (
              <li key={r.k} className="pp-trust-row">
                <span className="pp-trust-ic">{ICONS[r.icon]}</span>
                <span>{t(r.k)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
