"use client";
import { useState } from "react";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { whatsappLink } from "@/lib/products";
import { track } from "@/lib/analytics";
import type { FamilyMeta } from "@/lib/showcase-data";
import { WhatsAppIcon } from "@/components/icons";
import { useI18n } from "@/components/I18nProvider";
import { Slot } from "./primitives";
import { variantLabel } from "@/lib/variant-label";
import { acModel, fmtPKR } from "@/lib/ac-products";

const spec = (p: Product, re: RegExp) => (p.specs.find((s) => re.test(s[0])) || [])[1];

// Alibaba-style configurator: get to the value fast — image, value prop, a model
// chip picker, key specs for the picked model, and inquiry CTAs. Inquiry pre-fills
// WhatsApp with the exact model selected. Reusable across every family.
export default function ProductConfigurator({
  family,
  members,
  valueProp,
}: {
  family: FamilyMeta;
  members: Product[];
  valueProp: string;
}) {
  const { t, lc } = useI18n();
  // AVR: two use-case tabs (Air Conditioner / Fridge) filter the model chips.
  const isAvr = family.slug === "avr";
  const isFridge = (p: Product) => /fridge|freezer|refriger/i.test(`${p.useFor || ""} ${p.name}`);
  const firstNonUpcoming = Math.max(0, members.findIndex((p) => p.status !== "upcoming"));
  const firstAc = members.findIndex((p) => !isFridge(p));
  // Default AVR to the most-popular AC model (A-100 R3), not the entry A-50.
  const preferredAc = members.findIndex((p) => /\bR3\b/.test(p.name));
  const acDefault = preferredAc >= 0 ? preferredAc : firstAc;
  const [sel, setSel] = useState(isAvr && acDefault >= 0 ? acDefault : firstNonUpcoming);
  const [useCase, setUseCase] = useState<"ac" | "fridge">("ac");
  const [imgIdx, setImgIdx] = useState(0);
  const active = members[sel] || members[0];
  const shown = members
    .map((p, i) => ({ p, i }))
    .filter(({ p }) => (!isAvr ? true : useCase === "fridge" ? isFridge(p) : !isFridge(p)));
  // Buyable if the model maps to a priced checkout entry (AC R2/R3/R4).
  const rMatch = active.name.match(/\bR[2-9]\b/);
  const buyModel = rMatch && acModel(rMatch[0]) ? rMatch[0] : null;
  const toUrl = (s: string) => (s.startsWith("/") || s.startsWith("http") ? s : `/${s}`);
  const imgs = (active.images && active.images.length ? active.images : [active.image]).filter(Boolean);
  const safeIdx = Math.min(imgIdx, Math.max(0, imgs.length - 1));

  const quick: [string, string | undefined][] = [
    [t("cfg.bestfor"), lc(active.useFor || spec(active, /capacity/i) || "")],
    [t("cfg.input"), lc(spec(active, /input/i) || "")],
    [t("cfg.output"), lc(spec(active, /output/i) || "")],
    [t("cfg.efficiency"), lc(spec(active, /efficiency/i) || spec(active, /response|correction/i) || "")],
  ];

  return (
    <div className="cfg-grid">
      <div className="cfg-media-col">
        <div className="cfg-media">
          <div className="slot slot-tech-frame">
            {imgs.length ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="cfg-main-img" src={toUrl(imgs[safeIdx])} alt={lc(active.name)} />
            ) : (
              <Slot src={active.image} label={active.name} />
            )}
          </div>
          {active.tech && <span className="cfg-media-tech" data-tech={active.tech}>{active.tech}</span>}
        </div>
        {imgs.length > 1 && (
          <div className="cfg-thumbs">
            {imgs.map((src, i) => (
              <button
                key={src + i}
                type="button"
                className={`cfg-thumb ${i === safeIdx ? "active" : ""}`}
                onClick={() => setImgIdx(i)}
                aria-label={`${lc(active.name)} image ${i + 1}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={toUrl(src)} alt="" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="cfg-panel">
        <div className="sb-mast-badges">
          {family.tag && <span className="sb-badge is-accent">{family.tag}</span>}
          <span className="sb-badge is-line">{t(family.originTagKey || "cfg.built")}</span>
          <span className="sb-badge">{members.length} {t("cfg.models")}</span>
        </div>
        <h1>{lc(family.name)}</h1>
        {!isAvr && <p className="cfg-lede">{valueProp}</p>}

        {isAvr && (
          <div className="cfg-row">
            <span className="cfg-label">Use for</span>
            <div className="cfg-usecase" role="radiogroup" aria-label="Use for">
              {([["ac", "❄️", "Air Conditioner"], ["fridge", "🧊", "Fridge / Freezer"]] as const).map(([k, ic, label]) => (
                <button
                  key={k}
                  type="button"
                  role="radio"
                  aria-checked={useCase === k}
                  className={`cfg-usecase-btn ${useCase === k ? "is-active" : ""}`}
                  onClick={() => {
                    setUseCase(k);
                    const first = members.findIndex((p) => (k === "fridge" ? isFridge(p) : !isFridge(p)));
                    if (first >= 0) {
                      setSel(first);
                      setImgIdx(0);
                    }
                  }}
                >
                  <span aria-hidden="true" style={{ fontSize: "1.2em" }}>{ic}</span> {label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="cfg-row">
          <span className="cfg-label">{isAvr ? "Model" : t("cfg.capacity")}</span>
          <div className="cfg-chips">
            {shown.map(({ p, i }) => (
              <button
                key={p.id}
                type="button"
                className={`cfg-chip ${i === sel ? "is-active" : ""}`}
                aria-pressed={i === sel}
                onClick={() => {
                  setSel(i);
                  setImgIdx(0);
                  track("configurator_select", { family: family.slug, model: p.id });
                }}
              >
                {variantLabel(p)}
              </button>
            ))}
          </div>
        </div>

        {active.tech !== "AVR" && (
          <div className="cfg-row">
            <span className="cfg-label">{t("cfg.glance")}</span>
            <div className="cfg-specs">
              {quick.filter(([, v]) => v).map(([k, v]) => (
                <div className="cfg-spec" key={k}>
                  <span className="cfg-spec-k">{k}</span>
                  <span className="cfg-spec-v">{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AVR "at a glance" info panel — everything a buyer checks fast */}
        {active.tech === "AVR" && (
          <div className="avr-glance">
            <div className="avr-glance-badges">
              <span className="avr-b avr-b-energy">⚡ Energy Saver</span>
              {/copper/i.test(JSON.stringify(active.specs)) && <span className="avr-b avr-b-copper">100% Copper</span>}
              <span className="avr-b avr-b-warr">1-Year Warranty</span>
            </div>
            <div className="avr-glance-main">
              <div className="avr-watts">{spec(active, /capacity/i)}</div>
              <div className="avr-meta">
                {(spec(active, /input/i) || spec(active, /works from/i)) && (
                  <div>
                    <span className="avr-meta-k">Input</span>
                    <span className="avr-meta-v">{spec(active, /input/i) || spec(active, /works from/i)}</span>
                  </div>
                )}
                {spec(active, /output/i) && (
                  <div>
                    <span className="avr-meta-k">Output</span>
                    <span className="avr-meta-v">{spec(active, /output/i)}</span>
                  </div>
                )}
              </div>
            </div>
            {(active.useFor || spec(active, /best for/i)) && (
              <div className="avr-runs">
                <span className="avr-runs-k">Runs</span>
                <span className="avr-runs-v">{active.useFor || spec(active, /best for/i)}</span>
              </div>
            )}
          </div>
        )}

        {buyModel ? (
          <div className="cfg-price">
            <span className="cfg-price-v">{fmtPKR(acModel(buyModel)!.price)}</span>
            <span className="cfg-price-note">{t("cfg.perunit")}</span>
          </div>
        ) : !isAvr ? (
          <div className="cfg-price">
            {active.price ? (
              <>
                <span className="cfg-price-v">PKR {active.price.toLocaleString()}</span>
                <span className="cfg-price-note">{t("cfg.perunit")}</span>
              </>
            ) : (
              <span className="cfg-price-ask">{t("cfg.reqprice")}</span>
            )}
          </div>
        ) : null}
        <div className="cfg-status">
          {active.status === "upcoming" ? (
            <span className="cfg-soon">{t("cfg.preorder")}</span>
          ) : (
            <span className="cfg-stock">{t("cfg.instock")}</span>
          )}
          <span className="cfg-moq">{t("cfg.moq")}</span>
        </div>

        <div className="cfg-cta">
          {buyModel ? (
            <>
              <Link
                href={`/checkout?model=${buyModel}`}
                className="btn btn-primary cfg-inquiry"
                onClick={() => track("configurator_select", { family: family.slug, model: active.id, action: "buy_now" })}
              >
                Buy now →
              </Link>
              <a
                href={whatsappLink(active.name)}
                target="_blank"
                rel="noopener"
                className="btn btn-wa-light"
                onClick={() => track("whatsapp_click", { product: active.name, from: "configurator" })}
              >
                <WhatsAppIcon /> <span>Ya WhatsApp par poochein</span>
              </a>
            </>
          ) : (
            <a
              href={whatsappLink(active.name)}
              target="_blank"
              rel="noopener"
              className="btn btn-wa cfg-inquiry"
              onClick={() => track("whatsapp_click", { product: active.name, from: "configurator" })}
            >
              <WhatsAppIcon /> <span>{t("cfg.inquiry")} — {variantLabel(active)}</span>
            </a>
          )}
        </div>
        <a href="#spec" className="cfg-speclink">
          {t("cfg.fullspecs")} ↓
        </a>
      </div>
    </div>
  );
}
