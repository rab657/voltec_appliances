// Unified client-side analytics dispatch.
// Fans every event out to GA4 (gtag), Facebook Pixel (fbq), and our own
// first-party collector (/api/track) used by the "living site" dashboard.

export const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "";
export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID || "";

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
};

export function pageview(url: string) {
  if (typeof window === "undefined") return;
  if (GA_ID && window.gtag) {
    window.gtag("event", "page_view", { page_path: url });
  }
  if (FB_PIXEL_ID && window.fbq) {
    window.fbq("track", "PageView");
  }
  collect("page_view", { path: url });
}

export function track(event: string, params: Params = {}) {
  if (typeof window === "undefined") return;
  if (GA_ID && window.gtag) {
    window.gtag("event", event, params);
  }
  if (FB_PIXEL_ID && window.fbq) {
    const std = FB_STANDARD[event];
    if (std) window.fbq("track", std, params);
    else window.fbq("trackCustom", event, params);
  }
  collect(event, params);
}

// First-party beacon to our own analytics endpoint (never blocks the UI).
function collect(event: string, params: Params) {
  try {
    const payload = JSON.stringify({
      event,
      params,
      path: typeof location !== "undefined" ? location.pathname : "",
      ref: typeof document !== "undefined" ? document.referrer : "",
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
