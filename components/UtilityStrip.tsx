"use client";
import { SITE } from "@/lib/site";
import { useI18n } from "./I18nProvider";

// Thin utility strip above the nav: how to reach us, when we are open, and the
// one-line credibility claim. Added 2026-07-31 after a competitor teardown
// (a2zsolar.com.pk) — before this, the phone number appeared only inside the
// mobile drawer, so a desktop visitor deciding whether to trust us had nothing
// to call. For a Pakistani trade buyer a visible number and opening hours are a
// conversion element, not decoration.
//
// ⚠️ NUMBER RULE (memory, 2026-07-27): generic call CTAs use the PRIMARY
// +92 321 line. The showroom landline is reserved for location surfaces and
// must stay byte-identical to the Google Business Profile for the local pack —
// so it is deliberately NOT the clickable number here.
export default function UtilityStrip() {
  const { t } = useI18n();
  const tel = SITE.phone.replace(/[^+\d]/g, "");

  return (
    <div className="ustrip">
      <div className="container ustrip-inner">
        <div className="ustrip-group">
          <a className="ustrip-link" href={`tel:${tel}`}>
            <span aria-hidden="true">✆</span> {SITE.phoneDisplay}
          </a>
          <a className="ustrip-link" href={`mailto:${SITE.email}`}>
            <span aria-hidden="true">✉</span> {SITE.email}
          </a>
        </div>
        <div className="ustrip-group ustrip-mid">
          <span className="ustrip-muted">
            {t("strip.showroom")}: Abid Market, Lahore · {t("strip.hours")}
          </span>
        </div>
        <div className="ustrip-group">
          <span className="ustrip-trust">{t("strip.trust")}</span>
        </div>
      </div>
    </div>
  );
}
