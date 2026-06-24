"use client";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { whatsappLink } from "@/lib/products";
import { familySlugOf } from "@/lib/showcase-data";
import { track } from "@/lib/analytics";
import { WhatsAppIcon } from "./icons";
import { useI18n } from "./I18nProvider";
import Placeholder from "./Placeholder";

export default function EcomCard({ p }: { p: Product }) {
  const { t, lc } = useI18n();
  const upcoming = p.status === "upcoming";
  // Cells & electric parts get their own page; stabilizers/industrial route to
  // the family showcase (the model picker lives there — no per-model page).
  const standalone = Boolean(p.cell) || p.categoryId === "parts";
  const famSlug = standalone ? undefined : familySlugOf(p);
  const href = famSlug ? `/showcase/${famSlug}` : `/products/${p.id}`;
  const keySpecs = p.specs
    .slice(1, 4)
    .map((s) => lc(s[1]))
    .join(" · ");
  return (
    <div className="ec-card" data-cat={p.categoryId}>
      <Link href={href} className="ec-thumb">
        <Placeholder label="" image={p.image} />
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
