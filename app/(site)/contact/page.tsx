import type { Metadata } from "next";
import { whatsappLink } from "@/lib/products";
import { SITE } from "@/lib/site";
import WhatsAppButton from "@/components/WhatsAppButton";
import { WhatsAppIcon } from "@/components/icons";
import JsonLd from "@/components/JsonLd";
import { VOLTEC_ORG } from "@/lib/site";
import { getT } from "@/lib/i18n-server";

export const metadata: Metadata = {
  title: "Contact — WhatsApp, Call or Visit Us in Lahore",
  description:
    "Reach Voltec's Lahore team on WhatsApp, by phone, or email for product selection, bulk pricing, and free factory site surveys across Pakistan.",
  alternates: { canonical: "/contact" },
};

const tel = `tel:${SITE.phone.replace(/[^+\d]/g, "")}`;

export default async function ContactPage() {
  const t = await getT();
  const channels = [
    { icon: "wa", label: t("ct.wa.l"), value: SITE.phoneDisplay, note: t("ct.wa.n"), href: whatsappLink("a question"), primary: true },
    { icon: "call", label: t("ct.call.l"), value: SITE.phoneDisplay, note: t("ct.call.n"), href: tel },
    { icon: "mail", label: t("ct.mail.l"), value: SITE.email, note: t("ct.mail.n"), href: `mailto:${SITE.email}` },
    { icon: "pin", label: t("ct.pin.l"), value: t("ct.pin.v"), note: t("ct.pin.n"), href: `https://maps.google.com/?q=${encodeURIComponent(SITE.mapsQuery)}` },
  ];
  return (
    <main>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ContactPage",
          mainEntity: VOLTEC_ORG,
        }}
      />
      <section className="contact-hero">
        <div className="container">
          <div className="contact-hero-inner">
            <div className="vhero-eyebrow">
              <span className="live-dot"></span> {t("ct.eyebrow")}
            </div>
            <h1 dangerouslySetInnerHTML={{ __html: t("ct.h1") }}></h1>
            <p>{t("ct.lede")}</p>
            <div className="contact-hero-cta">
              <WhatsAppButton>{t("ct.cta.wa")}</WhatsAppButton>
              <a href={tel} className="btn btn-ghost">
                {t("ct.cta.call")}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 56 }}>
        <div className="container">
          <div className="contact-cards">
            {channels.map((c) => (
              <a
                key={c.label}
                href={c.href}
                target={c.icon === "call" || c.icon === "mail" ? undefined : "_blank"}
                rel="noopener"
                className={`contact-card ${c.primary ? "is-primary" : ""}`}
              >
                <span className="contact-ic" aria-hidden="true">
                  {c.icon === "wa" && <WhatsAppIcon size={22} />}
                  {c.icon === "call" && (
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  )}
                  {c.icon === "mail" && (
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="m22 7-10 6L2 7" />
                    </svg>
                  )}
                  {c.icon === "pin" && (
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  )}
                </span>
                <div className="contact-card-body">
                  <div className="contact-card-label">{c.label}</div>
                  <div className="contact-card-value">{c.value}</div>
                  <div className="contact-card-note">{c.note}</div>
                </div>
                <span className="contact-card-arrow">→</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="contact-split">
            <div className="contact-help-card">
              <h2>{t("ct.help.t")}</h2>
              <p>{t("ct.help.d")}</p>
              <ul className="contact-list">
                <li>{t("ct.li1")}</li>
                <li>{t("ct.li2")}</li>
                <li>{t("ct.li3")}</li>
                <li>{t("ct.li4")}</li>
              </ul>
              <WhatsAppButton>{t("ct.help.btn")}</WhatsAppButton>
            </div>
            <div className="contact-hours-card">
              <div className="eyebrow" style={{ marginBottom: 18 }}>
                {t("ct.glance")}
              </div>
              <div className="contact-fact">
                <span>{t("ct.f.hours")}</span>
                <strong>{t("ct.f.hoursv")}</strong>
              </div>
              <div className="contact-fact">
                <span>{t("ct.f.showroom")}</span>
                <strong>{t("ct.f.showroomv")}</strong>
              </div>
              <div className="contact-fact">
                <span>{t("ct.f.also")}</span>
                <strong>UAE {SITE.phoneUae} · WeChat {SITE.wechat}</strong>
              </div>
              <div className="contact-fact">
                <span>{t("ct.f.langs")}</span>
                <strong>English · Urdu · 普通话</strong>
              </div>
              <div className="contact-fact">
                <span>{t("ct.f.serving")}</span>
                <strong>{t("ct.f.servingv")}</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Embedded map — the walk-in funnel ends here: see the shop, tap directions. */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "clamp(24px,3vw,34px)", margin: 0 }}>
              {t("ct.pin.l")}
            </h2>
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(SITE.mapsQuery)}`}
              target="_blank"
              rel="noopener"
              className="btn btn-ghost"
            >
              {t("ct.pin.n")} →
            </a>
          </div>
          <iframe
            title="Voltec Appliances — Abid Market, Temple Road, Lahore"
            src={`https://www.google.com/maps/embed?origin=mfe&pb=!1m3!2m1!1s${encodeURIComponent(SITE.mapsQuery)}!6i15`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            style={{ width: "100%", height: 380, border: 0, borderRadius: 16, display: "block" }}
          />
        </div>
      </section>
    </main>
  );
}
