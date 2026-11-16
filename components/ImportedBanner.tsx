"use client";
import Link from "next/link";
import { useI18n } from "./I18nProvider";

// Top-of-page positioning line (Raheel, 2026-11-16): "Manufacturer & importer of voltage
// stabilizers and lithium cells." Supersedes the 2026-09-18 "IMPORTED" banner.
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
