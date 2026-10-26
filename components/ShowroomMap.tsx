"use client";
import { useEffect, useState } from "react";
import { SITE } from "@/lib/site";
import { track } from "@/lib/analytics";
import { PhoneIcon, PinIcon } from "./icons";
import WhatsAppButton from "./WhatsAppButton";
import { useI18n } from "./I18nProvider";

// Abid Market showroom block: the Google Maps embed of the verified listing next
// to a knowledge-panel-style card — live open/closed status, address, phone,
// hours and a Directions button. This is what Google Business Profile's "Add
// directions" + "Add a map to your website" suggestions ask for, and it closes
// the walk-in funnel the Lahore Showroom (Calls + Directions) campaign pays for.

const DAY_CODES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as const;
const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

type Status = { open: true; at: string } | { open: false; at: string; day?: string; tomorrow?: boolean };

// Showroom status in Pakistan time, whatever timezone the visitor is in.
function showroomStatus(locale: string, now = new Date()): Status {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Karachi",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value || "";
  const dayIdx = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
  const mins = Number(get("hour")) * 60 + Number(get("minute"));
  const days = SITE.hours.days as readonly string[];
  const opens = toMin(SITE.hours.opens);
  const closes = toMin(SITE.hours.closes);

  // Wrapped in a first-strong isolate so "8 PM" doesn't flip to "PM 8" inside
  // Urdu/Arabic text, while Arabic's own "8 م" keeps its right-to-left order.
  const fmt = (m: number) =>
    "⁨" +
    new Intl.DateTimeFormat(locale, {
      hour: "numeric",
      minute: m % 60 ? "2-digit" : undefined,
      timeZone: "UTC",
    }).format(new Date(Date.UTC(2026, 0, 1, Math.floor(m / 60), m % 60))) +
    "⁩";

  const openToday = days.includes(DAY_CODES[dayIdx]);
  if (openToday && mins >= opens && mins < closes) return { open: true, at: fmt(closes) };
  if (openToday && mins < opens) return { open: false, at: fmt(opens) };

  // Next open day: tomorrow, or a named weekday (Saturday night / Sunday → Monday).
  for (let d = 1; d <= 7; d++) {
    const idx = (dayIdx + d) % 7;
    if (!days.includes(DAY_CODES[idx])) continue;
    if (d === 1) return { open: false, at: fmt(opens), tomorrow: true };
    // 2026-01-04 was a Sunday, so +idx lands on the right weekday.
    const day = new Intl.DateTimeFormat(locale, { weekday: "long", timeZone: "UTC" }).format(
      new Date(Date.UTC(2026, 0, 4 + idx)),
    );
    return { open: false, at: fmt(opens), day };
  }
  return { open: false, at: fmt(opens) };
}

export default function ShowroomMap({ from = "site" }: { from?: string }) {
  const { t, locale } = useI18n();
  // Status depends on the visitor's clock, so it renders after hydration only.
  const [status, setStatus] = useState<Status | null>(null);
  useEffect(() => {
    const tick = () => setStatus(showroomStatus(locale));
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [locale]);

  const telStore = `tel:${SITE.phoneStore.replace(/[^+\d]/g, "")}`;
  const statusLine = !status
    ? null
    : status.open
      ? t("sr.closesAt").replace("{t}", status.at)
      : status.tomorrow
        ? t("sr.opensDay").replace("{d}", t("sr.tomorrow")).replace("{t}", status.at)
        : status.day
          ? t("sr.opensDay").replace("{d}", status.day).replace("{t}", status.at)
          : t("sr.opensAt").replace("{t}", status.at);

  return (
    <section className="section showroom-sec" id="showroom">
      <div className="container">
        <div className="showroom">
          <div className="showroom-map">
            <iframe
              title={`${SITE.name} — ${SITE.addressDisplay}`}
              src={SITE.mapEmbedUrl}
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>

          <div className="showroom-card">
            <div className="showroom-eyebrow">
              <PinIcon size={14} /> {t("sr.eyebrow")}
            </div>
            <h2 className="showroom-title">{t("sr.title")}</h2>
            <p className="showroom-lede">{t("sr.lede")}</p>

            <div className="showroom-status" aria-live="polite">
              {status && (
                <>
                  <span className={`showroom-dot ${status.open ? "is-open" : "is-closed"}`} />
                  <strong className={status.open ? "is-open" : "is-closed"}>
                    {status.open ? t("sr.open") : t("sr.closed")}
                  </strong>
                  <span>· {statusLine}</span>
                </>
              )}
            </div>

            <dl className="showroom-facts">
              <div>
                <dt>{t("sr.address")}</dt>
                <dd>
                  <span dir="ltr">{SITE.addressDisplay}</span>
                  <span className="showroom-near">{t("sr.near")}</span>
                </dd>
              </div>
              <div>
                <dt>{t("sr.phone")}</dt>
                <dd>
                  <a
                    href={telStore}
                    dir="ltr"
                    onClick={() => track("phone_click", { from: `showroom-${from}`, line: "store" })}
                  >
                    {SITE.phoneStoreDisplay}
                  </a>
                </dd>
              </div>
              <div>
                <dt>{t("sr.hours")}</dt>
                <dd>
                  {t("ct.f.hoursv")}
                  <span className="showroom-near">{t("sr.sun")}</span>
                </dd>
              </div>
            </dl>

            <div className="showroom-actions">
              <a
                href={SITE.directionsUrl}
                target="_blank"
                rel="noopener"
                className="btn btn-primary"
                onClick={() => track("directions_click", { from: `showroom-${from}` })}
              >
                <PinIcon size={16} /> {t("sr.dir")}
              </a>
              <a
                href={telStore}
                className="btn btn-ghost"
                onClick={() => track("phone_click", { from: `showroom-${from}`, line: "store" })}
              >
                <PhoneIcon size={16} /> {t("sr.call")}
              </a>
              <WhatsAppButton
                productName="showroom visit"
                message="Hi Voltec! I'd like to visit your Abid Market showroom in Lahore."
                from={`showroom-${from}`}
              >
                {t("sr.wa")}
              </WhatsAppButton>
            </div>

            <a
              href={SITE.mapsPlaceUrl}
              target="_blank"
              rel="noopener"
              className="showroom-maplink"
              onClick={() => track("directions_click", { from: `showroom-${from}`, kind: "listing" })}
            >
              {t("sr.maps")} →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
