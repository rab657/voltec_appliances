import "server-only";
import { getSupabaseAdmin } from "./supabase";
import type { WaWebhookBody } from "./whatsapp-leads";

// Auto-reply for click-to-WhatsApp ad chats.
//
// Deliberately narrow: a rule fires only when the inbound message is clearly
// from a specific ad (the prefilled text, or the ad referral headline), and at
// most once per person per 24h. Regular customers and ongoing chats never get a
// bot message — Raheel answers those himself from the phone app.
//
// Replies are customer-initiated service messages (inside the 24h window), so no
// template is needed. Sent via Cloud API; in coexistence mode they also show up
// in the WhatsApp Business app on the phone.
//
// OFF by default. Turn on with WHATSAPP_AUTOREPLY=on in Vercel (plus WHATSAPP_TOKEN).

const TOKEN = process.env.WHATSAPP_TOKEN || "";
const PHONE_ID = process.env.WHATSAPP_PHONE_ID || "1288197314369130"; // +92 321 1644447
const ENABLED = process.env.WHATSAPP_AUTOREPLY === "on";
const GRAPH = "https://graph.facebook.com/v25.0";
const COOLDOWN_MS = 24 * 60 * 60 * 1000;

interface Rule {
  key: string;
  /** Matched against the message text AND the ad referral headline/body, lowercased. */
  match: (s: string) => boolean;
  reply: string;
}

// No prices in these — same rule as ad copy: quote on WhatsApp, by a person.
const RULES: Rule[] = [
  {
    key: "svc-50k-3ph",
    match: (s) => /\b50\s*kva\b/.test(s) && /(3|three)[\s-]*phase/.test(s),
    reply:
      "Assalam o Alaikum! Thank you for contacting Voltec Appliances about the " +
      "50 kVA 3-phase servo stabilizer.\n\n" +
      "Please send:\n" +
      "1. Your city\n" +
      "2. The load you need to run (kVA, or which machines)\n\n" +
      "Our team will send you the price and full details here shortly.",
  },
];

async function sendText(to: string, body: string): Promise<string | null> {
  const res = await fetch(`${GRAPH}/${PHONE_ID}/messages`, {
    method: "POST",
    headers: { authorization: `Bearer ${TOKEN}`, "content-type": "application/json" },
    body: JSON.stringify({ messaging_product: "whatsapp", to, type: "text", text: { body } }),
  });
  const j = (await res.json().catch(() => null)) as
    | { messages?: Array<{ id?: string }>; error?: { code?: number; message?: string } }
    | null;
  if (!res.ok) {
    // Error code + message only — never the recipient or body (PII in logs).
    console.error(`[whatsapp-autoreply] send failed ${res.status} ${j?.error?.code ?? ""} ${j?.error?.message ?? ""}`);
    return null;
  }
  return j?.messages?.[0]?.id ?? null;
}

/** Run after the webhook has stored the inbound messages. Never throws. */
export async function autoReply(body: WaWebhookBody): Promise<number> {
  if (!ENABLED || !TOKEN) return 0;
  const db = getSupabaseAdmin();
  if (!db) return 0;
  let sent = 0;

  for (const entry of body.entry ?? []) {
    for (const change of entry.changes ?? []) {
      for (const m of change.value?.messages ?? []) {
        try {
          const waId = m.from;
          if (!waId || !m.id) continue;
          const hay = [m.type === "text" ? m.text?.body : "", m.referral?.headline, m.referral?.body]
            .filter(Boolean)
            .join(" \n ")
            .toLowerCase();
          const rule = RULES.find((r) => r.match(hay));
          if (!rule) continue;

          // Once per person per 24h, across all rules.
          const since = new Date(Date.now() - COOLDOWN_MS).toISOString();
          const { count } = await db
            .from("whatsapp_messages")
            .select("id", { count: "exact", head: true })
            .eq("wa_id", waId)
            .eq("direction", "out")
            .like("type", "auto:%")
            .gte("created_at", since);
          if ((count ?? 0) > 0) continue;

          // Don't butt into a live chat: unless this came straight off an ad tap,
          // only reply when this is their first message in 24h. (The webhook has
          // already stored this message, so exclude it.)
          if (!m.referral) {
            const { count: recent } = await db
              .from("whatsapp_messages")
              .select("id", { count: "exact", head: true })
              .eq("wa_id", waId)
              .eq("direction", "in")
              .neq("message_id", m.id)
              .gte("created_at", since);
            if ((recent ?? 0) > 0) continue;
          }

          // Claim this inbound message before sending, so a webhook retry that
          // races this one hits the unique message_id and backs off.
          const claimId = `auto:${m.id}`;
          const { error: claimErr } = await db.from("whatsapp_messages").insert({
            lead_id: null, // keep leads.message_count = inbound only
            wa_id: waId,
            message_id: claimId,
            direction: "out",
            type: `auto:${rule.key}`,
            body: rule.reply,
            sent_at: null,
          });
          if (claimErr) continue;

          const wamid = await sendText(waId, rule.reply);
          if (wamid) {
            await db
              .from("whatsapp_messages")
              .update({ sent_at: new Date().toISOString(), raw: { wamid } })
              .eq("message_id", claimId);
            sent += 1;
          } else {
            // Release the claim so the next message from them can retry.
            await db.from("whatsapp_messages").delete().eq("message_id", claimId);
          }
        } catch (e) {
          console.error(`[whatsapp-autoreply] ${e instanceof Error ? e.message : "threw"}`);
        }
      }
    }
  }
  return sent;
}
