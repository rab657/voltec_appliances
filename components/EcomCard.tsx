"use client";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { whatsappLink } from "@/lib/products";
import { acModel } from "@/lib/ac-products";
import { track } from "@/lib/analytics";
import { WhatsAppIcon } from "./icons";
import { useI18n } from "./I18nProvider";
import Placeholder from "./Placeholder";

export default function EcomCard({ p }: { p: Product }) {
  const { t, lc } = useI18n();
  const upcoming = p.status === "upcoming";
  // Every model has its own page (2026-08-19) — cards always link there.
  const href = `/products/${p.id}`;
  // Priced AC models (R2/R3/R4) carry their checkout price on the card too.
  const rMatch = p.name.match(/\bR[2-9]\b/);
  const price = p.price ?? (rMatch ? acModel(rMatch[0])?.price : undefined);
  const save = price && p.compareAt && p.compareAt > price;
  const keySpecs = p.specs
    .slice(1, 4)
    .map((s) => lc(s[1]))
    .join(" · ");
  return (
    <div className="ec-card" data-cat={p.categoryId}>
      <Link href={href} className="ec-thumb">
        <Placeholder label="" image={p.image} contain={false} />
        {p.tech && (
          <span className="ec-tech" data-tech={p.tech}>
            {p.tech}
          </span>
        )}
        {upcoming && <span className="ec-soon">{t("ec.preorder")}</span>}
      </Link>
      <div className="ec-body">
        <div className="ec-cat">{lc(p.category)}</div>
        <Link href={href} className="ec-name">
          {lc(p.name)}
        </Link>
        <div className="ec-spec">{keySpecs}</div>
        {price ? (
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, margin: "2px 0 0" }}>
            {save && (
              <span style={{ fontSize: 13, color: "var(--ink-3)", textDecoration: "line-through" }}>
                Rs {p.compareAt!.toLocaleString("en-PK")}
              </span>
            )}
            <span style={{ fontFamily: "var(--font-display)", fontSize: 19, color: "var(--ink)" }}>
              Rs {price.toLocaleString("en-PK")}
            </span>
          </div>
        ) : null}
        <div className="ec-foot">
          <span className={`ec-stock ${upcoming ? "soon" : "in"}`}>
            {upcoming ? t("ec.preorder") : t("ec.instock")}
          </span>
          <a
            href={whatsappLink(p.name)}
            target="_blank"
            rel="noopener"
            className="ec-inquire"
            onClick={() => track("whatsapp_click", { product: p.name, from: "card" })}
          >
            <WhatsAppIcon /> {t("ec.inquire")}
          </a>
        </div>
      </div>
    </div>
  );
}
