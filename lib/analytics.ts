// Unified client-side analytics dispatch.
// Fans every event out to GA4 (gtag), Facebook Pixel (fbq), and our own
// first-party collector (/api/track) used by the "living site" dashboard.

// Public IDs (not secrets — they ship in the page anyway). Defaulted in code so
// tracking is live in every environment without depending on env config; env
// still overrides if set.
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "G-L04YY2FKCG";
export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID || "1012908876950112";

type Params = Record<string, unknown>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

// Map our internal event names to standard Facebook Pixel events where one fits.
const FB_STANDARD: Record<string, string> = {
  page_view: "PageView",
  view_item: "ViewContent",
  whatsapp_click: "Contact",
  phone_click: "Contact",
  lead: "Lead",
  begin_checkout: "InitiateCheckout",
  purchase: "Purchase",
};

// One id per event, shared between the browser Pixel (eventID) and the
// server-side Conversions API call (event_id) so Meta dedupes the pair.
function genId(): string {
  try {
    if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  } catch {
    /* fall through */
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function pageview(url: string) {
  if (typeof window === "undefined") return;
  const eventId = genId();
  if (GA_ID && window.gtag) {
    window.gtag("event", "page_view", { page_path: url });
  }
  if (FB_PIXEL_ID && window.fbq) {
    window.fbq("track", "PageView", {}, { eventID: eventId });
  }
  collect("page_view", { path: url }, eventId);
}

export function track(event: string, params: Params = {}) {
  if (typeof window === "undefined") return;
  const eventId = genId();
  if (GA_ID && window.gtag) {
    window.gtag("event", event, params);
  }
  if (FB_PIXEL_ID && window.fbq) {
    const std = FB_STANDARD[event];
    if (std) window.fbq("track", std, params, { eventID: eventId });
    else window.fbq("trackCustom", event, params, { eventID: eventId });
  }
  collect(event, params, eventId);
}

// First-party beacon to our own analytics endpoint (never blocks the UI).
// Also carries event_id + full href so the server can mirror to Meta CAPI.
function collect(event: string, params: Params, eventId?: string) {
  try {
    const payload = JSON.stringify({
      event,
      params,
      path: typeof location !== "undefined" ? location.pathname : "",
      href: typeof location !== "undefined" ? location.href : "",
      ref: typeof document !== "undefined" ? document.referrer : "",
      event_id: eventId,
      ts: Date.now(),
    });
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/track", payload);
    } else {
      fetch("/api/track", {
        method: "POST",
        body: payload,
        keepalive: true,
        headers: { "Content-Type": "application/json" },
      }).catch(() => {});
    }
  } catch {
    /* analytics must never throw into the app */
  }
}
