"use client";
import { useState } from "react";
import { whatsappLink } from "@/lib/products";
import { SITE } from "@/lib/site";
import { WhatsAppIcon, PhoneIcon, PinIcon, MailIcon, QrIcon } from "./icons";
import { track } from "@/lib/analytics";
import { useI18n } from "./I18nProvider";

// Persistent right-edge contact rail — one tap to reach Voltec by every channel:
// call, WhatsApp, email, visit (directions), and a scan-to-chat QR. Labels slide
// out on hover; on mobile it collapses to a bottom action bar.
export default function ContactRail() {
  const [qr, setQr] = useState(false);
  const { t } = useI18n();

  const tel = `tel:${SITE.phone.replace(/[^+\d]/g, "")}`;
  const wa = whatsappLink();
  const maps = `https://maps.google.com/?q=${encodeURIComponent(SITE.mapsQuery)}`;
  const mail = `mailto:${SITE.email}`;

  const items = [
    {
      key: "call",
      tkey: "rail.call",
      href: tel,
      Icon: PhoneIcon,
      label: "Call us",
      sub: SITE.phoneDisplay,
      onClick: () => track("contact_rail", { method: "call" }),
    },
    {
      key: "wa",
      tkey: "rail.whatsapp",
      href: wa,
      ext: true,
      Icon: WhatsAppIcon,
      label: "WhatsApp",
      sub: "Chat with us now",
      subkey: "rail.wa.sub",
      onClick: () => track("whatsapp_click", { product: "rail" }),
    },
    {
      key: "email",
      tkey: "rail.email",
      href: mail,
      Icon: MailIcon,
      label: "Email us",
      sub: SITE.email,
      onClick: () => track("contact_rail", { method: "email" }),
    },
    {
      key: "visit",
      tkey: "rail.visit",
      href: maps,
      ext: true,
      Icon: PinIcon,
      label: "Visit us",
      sub: "Lahore showroom — get directions",
      subkey: "rail.visit.sub",
      onClick: () => track("contact_rail", { method: "visit" }),
    },
  ];

  return (
    <aside className="crail" aria-label="Contact Voltec">
      <ul className="crail-list">
        {items.map((it) => {
          const Icon = it.Icon;
          return (
            <li key={it.key}>
              <a
                className={`crail-item crail-${it.key}`}
                href={it.href}
                {...(it.ext ? { target: "_blank", rel: "noopener" } : {})}
                onClick={it.onClick}
                aria-label={`${t(it.tkey)} — ${it.subkey ? t(it.subkey) : it.sub}`}
              >
                <span className="crail-ic">
                  <Icon size={22} />
                </span>
                <span className="crail-label">{t(it.tkey)}</span>
                <span className="crail-pop" aria-hidden="true">
                  <strong>{t(it.tkey)}</strong>
                  <span>{it.subkey ? t(it.subkey) : it.sub}</span>
                </span>
              </a>
            </li>
          );
        })}

        {/* Scan-to-chat QR — desktop visitors continue on their phone */}
        <li className="crail-qr-li" onMouseLeave={() => setQr(false)}>
          <button
            type="button"
            className="crail-item crail-qr"
            aria-label={t("rail.scan.t")}
            aria-expanded={qr}
            onMouseEnter={() => setQr(true)}
            onClick={() => {
              setQr(true);
              track("contact_rail", { method: "qr" });
            }}
          >
            <span className="crail-ic">
              <QrIcon size={22} />
            </span>
            <span className="crail-label">{t("rail.scan")}</span>
            <span className="crail-pop" aria-hidden="true">
              <strong>{t("rail.scan.t")}</strong>
              <span>{t("rail.scan.sub")}</span>
            </span>
          </button>
          {qr && (
            <div className="crail-qrcard" role="dialog" aria-label={t("rail.scan.t")}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=170x170&margin=0&qzone=1&data=${encodeURIComponent(wa)}`}
                alt={t("rail.scan.t")}
                width={150}
                height={150}
                loading="lazy"
              />
              <p>{t("rail.qr.p")}</p>
            </div>
          )}
        </li>
      </ul>

      {/* Live-team avatar — friendly nudge straight to WhatsApp */}
      <a
        className="crail-agent"
        href={wa}
        target="_blank"
        rel="noopener"
        aria-label={t("rail.agent.t")}
        onClick={() => track("whatsapp_click", { product: "rail-agent" })}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/engineer.jpg" alt={t("rail.agent.t")} />
        <span className="crail-agent-dot" aria-hidden="true"></span>
        <span className="crail-pop" aria-hidden="true">
          <strong>{t("rail.agent.t")}</strong>
          <span>{t("rail.agent.sub")}</span>
        </span>
      </a>
    </aside>
  );
}
