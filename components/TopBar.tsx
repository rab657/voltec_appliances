"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { whatsappLink } from "@/lib/products";
import { SITE } from "@/lib/site";
import { WhatsAppIcon } from "./icons";
import { useI18n } from "./I18nProvider";
import LanguageSwitcher from "./LanguageSwitcher";

// Nav is CATEGORY-led (2026-07-31, user request after a competitor teardown):
// a trade buyer thinks "lithium cells", not "solutions". Use cases are kept,
// grouped under Solutions along with Industrial (a segment, not a product).
//
// ⚠️ Every href here is verified to return 200. The `smart-inverter-voltage-stabilizer`
// and `scr` showcase families are HIDDEN and 404 — do not link them. Category
// listings take `?cat=<CategoryId>` (the param is `cat`, not `category`).
//
// Label keys: a dotted key is passed to t() as-is ("cat.cells"); a bare key is
// prefixed with "nav." ("about" -> nav.about).

interface NavItem {
  href: string;
  key?: string;
  label?: string;
}
interface Menu {
  titleKey: string;
  match: string[];
  items: NavItem[];
}

const HOME: NavItem = { href: "/", key: "home" };

const MENUS: Menu[] = [
  {
    titleKey: "nav.lithium",
    match: ["/showcase/cells", "/products"],
    // Labels must not repeat the menu title — "Lithium & Cells > Lithium & Cells"
    // reads as a duplicate. First item is always the full category listing.
    // "Genuine Cells" is deliberately absent here: it is promoted to a top-level
    // item on the right, so repeating it in the menu is noise.
    items: [
      { href: "/products?cat=cells", key: "nav.shopAll" },
      { href: "/showcase/cells", label: "EVE LF100LA" },
      { href: "/blog/eve-lithium-cells-pakistan", key: "nav.guide" },
    ],
  },
  {
    titleKey: "cat.stabilizers",
    match: ["/showcase/svc", "/showcase/avr", "/showcase/relay", "/showcase/led"],
    items: [
      { href: "/products?cat=stabilizers", key: "nav.shopAll" },
      { href: "/showcase/svc", label: "Servo (SVC)" },
      { href: "/showcase/avr", label: "Relay (AVR)" },
      { href: "/products?cat=parts", key: "cat.parts" },
    ],
  },
  {
    titleKey: "nav.solutions",
    match: ["/ac", "/solar", "/medical", "/industrial"],
    items: [
      { href: "/ac", key: "ac" },
      { href: "/solar", key: "solar" },
      { href: "/medical", key: "medical" },
      { href: "/industrial", key: "cat.industrial" },
    ],
  },
];

const RIGHT: NavItem[] = [
  { href: "/blog/genuine-eve-cells-check-pakistan", key: "genuine" },
  { href: "/about", key: "about" },
  { href: "/blog", key: "blog" },
  { href: "/contact", key: "contact" },
];

function isActive(pathname: string, href: string) {
  const path = href.split("?")[0];
  if (path === "/") return pathname === "/";
  return pathname === path || pathname.startsWith(path + "/");
}

export default function TopBar() {
  const pathname = usePathname() || "/";
  const [open, setOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const { t } = useI18n();

  const label = (it: NavItem) =>
    it.label ?? (it.key!.includes(".") ? t(it.key!) : t(`nav.${it.key}`));

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close drawer + any open dropdown on navigation.
  useEffect(() => {
    setOpen(false);
    setOpenMenu(null);
  }, [pathname]);

  return (
    <>
      <header className="topbar">
        <div className="container topbar-inner">
          <div className="topbar-left">
            <Link
              href={HOME.href}
              className={`nav-link ${isActive(pathname, HOME.href) ? "active" : ""}`}
            >
              {label(HOME)}
            </Link>
            {MENUS.map((m) => {
              const active = m.match.some((p) => isActive(pathname, p));
              const isOpen = openMenu === m.titleKey;
              return (
                <div
                  key={m.titleKey}
                  className="nav-dd"
                  onMouseLeave={() => setOpenMenu((v) => (v === m.titleKey ? null : v))}
                >
                  <button
                    type="button"
                    className={`nav-link nav-dd-trigger ${active ? "active" : ""}`}
                    aria-haspopup="true"
                    aria-expanded={isOpen}
                    onClick={() => setOpenMenu((v) => (v === m.titleKey ? null : m.titleKey))}
                    onMouseEnter={() => setOpenMenu(m.titleKey)}
                  >
                    {t(m.titleKey)}{" "}
                    <span className="nav-dd-caret" aria-hidden="true">
                      ▾
                    </span>
                  </button>
                  <div className={`nav-dd-menu ${isOpen ? "is-open" : ""}`}>
                    {m.items.map((it) => (
                      <Link key={it.href} href={it.href} className="nav-dd-item">
                        {label(it)}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <Link href="/" className="brand" aria-label="Voltec Appliances — home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/logo.png" alt="Voltec Appliances" className="brand-logo" />
          </Link>
          <div className="topbar-right">
            {RIGHT.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`nav-link ${isActive(pathname, l.href) ? "active" : ""}`}
              >
                {label(l)}
              </Link>
            ))}
            <LanguageSwitcher />
            {/* The old "SHIPPING" pill lived here. Removed 2026-07-31 — the new
                UtilityStrip above carries the trust line, and this was crowding
                a nav that now has three dropdowns. */}
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
      </header>
      <div className={`nav-drawer ${open ? "is-open" : ""}`} role="dialog" aria-modal="true">
        <div className="nav-drawer-scrim" onClick={() => setOpen(false)}></div>
        <nav className="nav-drawer-panel">
          <div className="nav-drawer-head">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/logo.png"
              alt="Voltec Appliances"
              className="brand-logo"
              style={{ height: 34 }}
            />
            <button className="nav-close" aria-label="Close menu" onClick={() => setOpen(false)}>
              ✕
            </button>
          </div>
          <div className="nav-drawer-links">
            <Link
              href={HOME.href}
              className={`nav-drawer-link ${isActive(pathname, HOME.href) ? "active" : ""}`}
            >
              {label(HOME)}
            </Link>
            {MENUS.map((m) => (
              <div key={m.titleKey}>
                <div className="nav-drawer-group">{t(m.titleKey)}</div>
                {m.items.map((it) => (
                  <Link
                    key={it.href}
                    href={it.href}
                    className={`nav-drawer-link is-sub ${
                      isActive(pathname, it.href) ? "active" : ""
                    }`}
                  >
                    {label(it)}
                  </Link>
                ))}
              </div>
            ))}
            {RIGHT.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`nav-drawer-link ${isActive(pathname, l.href) ? "active" : ""}`}
              >
                {label(l)}
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
    </>
  );
}
