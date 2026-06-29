"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { whatsappLink } from "@/lib/products";
import { SITE } from "@/lib/site";
import { WhatsAppIcon } from "./icons";
import { useI18n } from "./I18nProvider";
import LanguageSwitcher from "./LanguageSwitcher";

const LEFT = [
  { href: "/", key: "home" },
  { href: "/products", key: "products" },
];
const RIGHT = [
  { href: "/about", key: "about" },
  { href: "/blog", key: "blog" },
  { href: "/contact", key: "contact" },
];
// Solutions is a dropdown of industry verticals (more to come).
const SOLUTIONS = [
  { href: "/solar", key: "solar" },
  { href: "/medical", key: "medical" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export default function TopBar() {
  const pathname = usePathname() || "/";
  const [open, setOpen] = useState(false);
  const [ddOpen, setDdOpen] = useState(false);
  const { t } = useI18n();
  const solutionsActive = SOLUTIONS.some((s) => isActive(pathname, s.href));

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close drawer + dropdown on navigation.
  useEffect(() => {
    setOpen(false);
    setDdOpen(false);
  }, [pathname]);

  return (
    <header className="topbar">
      <div className="container topbar-inner">
        <div className="topbar-left">
          {LEFT.map((l) => (
            <Link
              key={l.key}
              href={l.href}
              className={`nav-link ${isActive(pathname, l.href) ? "active" : ""}`}
            >
              {t(`nav.${l.key}`)}
            </Link>
          ))}
          <div className="nav-dd" onMouseLeave={() => setDdOpen(false)}>
            <button
              type="button"
              className={`nav-link nav-dd-trigger ${solutionsActive ? "active" : ""}`}
              aria-haspopup="true"
              aria-expanded={ddOpen}
              onClick={() => setDdOpen((v) => !v)}
              onMouseEnter={() => setDdOpen(true)}
            >
              {t("nav.solutions")} <span className="nav-dd-caret" aria-hidden="true">▾</span>
            </button>
            <div className={`nav-dd-menu ${ddOpen ? "is-open" : ""}`}>
              {SOLUTIONS.map((s) => (
                <Link key={s.key} href={s.href} className="nav-dd-item">
                  {t(`nav.${s.key}`)}
                </Link>
              ))}
            </div>
          </div>
        </div>
        <Link href="/" className="brand" aria-label="Voltec Appliances — home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/logo.png" alt="Voltec Appliances" className="brand-logo" />
        </Link>
        <div className="topbar-right">
          {RIGHT.map((l) => (
            <Link
              key={l.key}
              href={l.href}
              className={`nav-link ${isActive(pathname, l.href) ? "active" : ""}`}
            >
              {t(`nav.${l.key}`)}
            </Link>
          ))}
          <LanguageSwitcher />
          <span className="pill">
            <span className="dot"></span>
            {t("pill.shipping")}
          </span>
        </div>
        <button
          className="nav-toggle"
          aria-label="Open menu"
          aria-expanded={open}
          onClick={() => setOpen(true)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
      <div className={`nav-drawer ${open ? "is-open" : ""}`} role="dialog" aria-modal="true">
        <div className="nav-drawer-scrim" onClick={() => setOpen(false)}></div>
        <nav className="nav-drawer-panel">
          <div className="nav-drawer-head">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/logo.png" alt="Voltec Appliances" className="brand-logo" style={{ height: 34 }} />
            <button className="nav-close" aria-label="Close menu" onClick={() => setOpen(false)}>
              ✕
            </button>
          </div>
          <div className="nav-drawer-links">
            {LEFT.map((l) => (
              <Link
                key={l.key}
                href={l.href}
                className={`nav-drawer-link ${isActive(pathname, l.href) ? "active" : ""}`}
              >
                {t(`nav.${l.key}`)}
              </Link>
            ))}
            <div className="nav-drawer-group">{t("nav.solutions")}</div>
            {SOLUTIONS.map((s) => (
              <Link
                key={s.key}
                href={s.href}
                className={`nav-drawer-link is-sub ${isActive(pathname, s.href) ? "active" : ""}`}
              >
                {t(`nav.${s.key}`)}
              </Link>
            ))}
            {RIGHT.map((l) => (
              <Link
                key={l.key}
                href={l.href}
                className={`nav-drawer-link ${isActive(pathname, l.href) ? "active" : ""}`}
              >
                {t(`nav.${l.key}`)}
              </Link>
            ))}
            <div style={{ marginTop: 18 }}>
              <LanguageSwitcher />
            </div>
          </div>
          <div className="nav-drawer-foot">
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noopener"
              className="btn btn-wa"
              style={{ width: "100%", justifyContent: "center" }}
            >
              <WhatsAppIcon /> <span>WhatsApp us</span>
            </a>
            <a
              href={`tel:${SITE.phone.replace(/[^+\d]/g, "")}`}
              className="btn btn-ghost"
              style={{ width: "100%", justifyContent: "center", marginTop: 10 }}
            >
              Call {SITE.phoneDisplay}
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}
