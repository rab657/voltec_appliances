"use client";
import { useLayoutEffect, useRef, useState } from "react";
import { useI18n } from "@/components/I18nProvider";

// Alladin-style description block: a single "Description" tab header, the
// product story, Key Features bullets, the full specification table, and a
// Read more / Read less collapse once the content runs long.

const COLLAPSED = 560; // px shown while collapsed

export default function PdpDetails({
  description,
  features = [],
  specs,
  intro,
}: {
  description?: string;
  features?: string[];
  specs: [string, string][];
  /** Optional short series line shown above the description. */
  intro?: string;
}) {
  const { t } = useI18n();
  const bodyRef = useRef<HTMLDivElement>(null);
  const [collapsible, setCollapsible] = useState(false);
  const [open, setOpen] = useState(false);

  useLayoutEffect(() => {
    const el = bodyRef.current;
    if (el) setCollapsible(el.scrollHeight > COLLAPSED + 120);
  }, []);

  return (
    <section className="pp-details" id="spec">
      <div className="pp-tabbar" role="tablist">
        <span className="pp-tabhead is-active" role="tab" aria-selected="true">
          {t("pp.desc")}
        </span>
      </div>

      <div
        ref={bodyRef}
        className={`pp-details-body ${collapsible && !open ? "is-collapsed" : ""}`}
        style={collapsible && !open ? { maxHeight: COLLAPSED } : undefined}
      >
        {intro && <p className="pp-details-intro">{intro}</p>}
        {description && <p className="pp-details-desc">{description}</p>}

        {features.length > 0 && (
          <>
            <h3 className="pp-details-h">{t("pp.keyfeat")}</h3>
            <ul className="pp-feats">
              {features.map((f) => (
                <li key={f}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 12.5l5 5 10-11" /></svg>
                  {f}
                </li>
              ))}
            </ul>
          </>
        )}

        <h3 className="pp-details-h">{t("pp.specs")}</h3>
        <div className="sb-spec-wrap">
          <table className="sb-spec">
            <thead>
              <tr>
                <th className="is-class">{t("tbl.param")}</th>
                <th>{t("tbl.spec")}</th>
              </tr>
            </thead>
            <tbody>
              {specs.map(([k, v]) => (
                <tr key={k}>
                  <td className="param">{k}</td>
                  <td className="val">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {collapsible && (
        <div className="pp-readmore-row">
          <button type="button" className="pp-readmore" onClick={() => setOpen((o) => !o)}>
            {open ? t("pp.readless") : t("pp.readmore")}
          </button>
        </div>
      )}
    </section>
  );
}
