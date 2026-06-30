import "server-only";
import { clientIp } from "./analytics-server";

// Meta Conversions API (server-side events). Mirrors the browser Pixel events
// from the same request, deduped via a shared event_id. Best-effort and
// non-throwing — analytics must never break the app. No-op until configured.

const PIXEL = process.env.META_PIXEL_ID || "";
const TOKEN = process.env.META_CAPI_TOKEN || "";
const VER = process.env.META_GRAPH_VERSION || "v21.0";

// Internal event name → Meta standard event (only mapped events are forwarded).
const FB_STANDARD: Record<string, string> = {
  page_view: "PageView",
  view_item: "ViewContent",
  whatsapp_click: "Contact",
  phone_click: "Contact",
  lead: "Lead",
};

function cookie(req: Request, name: string): string | undefined {
  const c = req.headers.get("cookie");
  if (!c) return undefined;
  const m = c.match(new RegExp("(?:^|; )" + name + "=([^;]+)"));
  return m ? decodeURIComponent(m[1]) : undefined;
}

export interface Beacon {
  event: string;
  params?: Record<string, unknown>;
  path?: string;
  href?: string;
  ref?: string;
  event_id?: string;
}

export async function sendCapiEvent(req: Request, b: Beacon): Promise<void> {
  if (!PIXEL || !TOKEN) return; // not configured — silently skip
  const eventName = FB_STANDARD[b.event];
  if (!eventName) return; // only forward mapped standard events

  try {
    const user_data: Record<string, unknown> = {};
    const ip = clientIp(req);
    const ua = req.headers.get("user-agent") || "";
    if (ip) user_data.client_ip_address = ip;
    if (ua) user_data.client_user_agent = ua;
    const fbp = cookie(req, "_fbp");
    const fbc = cookie(req, "_fbc");
    if (fbp) user_data.fbp = fbp;
    if (fbc) user_data.fbc = fbc;
    if (Object.keys(user_data).length === 0) return; // CAPI needs ≥1 identifier

    // Whitelist custom_data so we never send fields Meta would reject.
    const p = b.params || {};
    const cd: Record<string, unknown> = {};
    const name = p.content_name ?? p.name;
    if (name) cd.content_name = name;
    if (Array.isArray(p.content_ids)) cd.content_ids = p.content_ids;
    else if (p.id) cd.content_ids = [p.id];
    if (p.value != null && !Number.isNaN(Number(p.value))) cd.value = Number(p.value);
    if (p.currency) cd.currency = p.currency;
    const cat = p.content_category ?? p.category;
    if (cat) cd.content_category = cat;

    const event: Record<string, unknown> = {
      event_name: eventName,
      event_time: Math.floor(Date.now() / 1000),
      action_source: "website",
      user_data,
    };
    if (b.href) event.event_source_url = b.href;
    if (b.event_id) event.event_id = b.event_id;
    if (Object.keys(cd).length) event.custom_data = cd;

    await fetch(
      `https://graph.facebook.com/${VER}/${PIXEL}/events?access_token=${encodeURIComponent(TOKEN)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: [event] }),
      },
    );
  } catch {
    /* never throw into the beacon path */
  }
}
