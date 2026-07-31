import { createHmac, timingSafeEqual } from "node:crypto";
import { ingestWhatsappWebhook, type WaWebhookBody } from "@/lib/whatsapp-leads";

// WhatsApp Cloud API webhook.
//
// GET  = Meta's one-time subscription handshake (hub.challenge echo).
// POST = inbound messages. We store them and, crucially, the `referral.ctwa_clid`
//        that ties a conversation back to the click-to-WhatsApp ad that caused it.
//
// ⚠️ DORMANT UNTIL MIGRATION. The PK number +92 321 1644447 is still on the
// deprecated ON_PREMISE platform with **zero** subscribed apps, so nothing will
// hit this route yet. It is safe to deploy now: it verifies signatures, ignores
// anything unrecognised, and always 200s.
//
// Setup once the number is on Cloud API:
//   1. Set WHATSAPP_VERIFY_TOKEN in Vercel (any long random string you choose).
//   2. App Dashboard → WhatsApp → Configuration → Callback URL
//        https://voltecappliances.com/api/whatsapp/webhook
//      Verify token = the same value. Subscribe to the **messages** field.
//   3. POST /{waba_id}/subscribed_apps  (waba_id 1051206810604714)
//
// Route Handlers are not cached by default, and only GET can opt in — so no
// cache config is needed here.

export const runtime = "nodejs"; // node:crypto for signature verification

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "";
const APP_SECRET = process.env.META_APP_SECRET || "";

/** Meta signs every payload with the app secret. Reject anything that fails. */
function signatureValid(raw: string, header: string | null): boolean {
  if (!APP_SECRET) return false;
  if (!header?.startsWith("sha256=")) return false;
  const expected = createHmac("sha256", APP_SECRET).update(raw, "utf8").digest("hex");
  const got = header.slice("sha256=".length);
  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(got, "hex");
  if (a.length !== b.length || a.length === 0) return false;
  return timingSafeEqual(a, b);
}

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams;
  const mode = q.get("hub.mode");
  const token = q.get("hub.verify_token");
  const challenge = q.get("hub.challenge");

  // Never allow the handshake to pass while unconfigured — an empty env var
  // would otherwise match an empty token and hand the subscription to anyone.
  if (!VERIFY_TOKEN) return new Response("not configured", { status: 503 });
  if (mode === "subscribe" && token === VERIFY_TOKEN && challenge) {
    return new Response(challenge, {
      status: 200,
      headers: { "content-type": "text/plain" },
    });
  }
  return new Response("forbidden", { status: 403 });
}

export async function POST(req: Request) {
  // Read the RAW body first — the signature is over the exact bytes sent.
  const raw = await req.text();

  if (!signatureValid(raw, req.headers.get("x-hub-signature-256"))) {
    return new Response("bad signature", { status: 401 });
  }

  try {
    const body = JSON.parse(raw) as WaWebhookBody;
    if (body.object !== "whatsapp_business_account") {
      return new Response("ignored", { status: 200 });
    }
    const r = await ingestWhatsappWebhook(body);
    // Log counts only — never message bodies or numbers (PII in logs).
    // `stored` is a real count and `error` is surfaced on purpose: a silently
    // failing write would otherwise look identical to success.
    if (r.messages > 0) {
      const line =
        `[whatsapp] ${r.messages} message(s), ${r.withClid} with ctwa_clid, ` +
        `stored=${r.stored}/${r.messages}`;
      if (r.error) console.error(`${line} — DB ERROR: ${r.error}`);
      else console.log(line);
    }
  } catch {
    // Swallow everything: a non-200 makes Meta retry, then disable the webhook.
  }
  return new Response("ok", { status: 200 });
}
