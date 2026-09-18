"use client";
import Link from "next/link";
import { useI18n } from "./I18nProvider";

// Top-of-page announcement (user, 2026-09-18: "play the IMPORTED card"). The servo
// (SVC), inverter (IGBT) and SCR stabilizers and the EVE cells are imported; the AVR
// relay A-series is Voltec's own, made in Pakistan — the muted second clause says so.
// Roots stay in Lahore (the utility strip below keeps "Lahore · Since 1995").
export default function ImportedBanner() {
  const { t } = useI18n();
  return (
    <div className="impbanner" role="region" aria-label={t("banner.imp.k")}>
      <div className="container impbanner-inner">
        <span className="impbanner-tag">{t("banner.imp.k")}</span>
        <span className="impbanner-text">
          {t("banner.imp.t")} <span className="impbanner-sub">{t("banner.imp.s")}</span>
        </span>
        <Link className="impbanner-cta" href="/products">
          {t("banner.imp.cta")} <span aria-hidden="true">→</span>
        </Link>
      </div>
    </div>
  );
}
