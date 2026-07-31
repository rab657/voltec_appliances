import "server-only";
import { getSupabaseAdmin } from "./supabase";

// Storage layer for inbound WhatsApp Cloud API webhooks.
//
// The prize is `referral.ctwa_clid` — the click id Meta attaches to the FIRST
// message of a conversation that started from a click-to-WhatsApp ad. Capturing
// it is what makes lead *quality* feedable back to Meta later (see
// scripts/whatsapp-qualify.py). Everything else here exists so the conversation
// is still readable after the number moves to Cloud API, at which point the
// WhatsApp Business phone app stops working on it.
//
// Best-effort and non-throwing, like the rest of the tracking layer: a webhook
// must always 200 or Meta will retry and eventually disable the subscription.

/** Shape of the bits of the Cloud API webhook payload we actually use. */
interface WaReferral {
  source_id?: string;
  source_type?: string;
  source_url?: string;
  headline?: string;
  body?: string;
  ctwa_clid?: string;
}

interface WaMessage {
  id?: string;
  from?: string;
  timestamp?: string;
  type?: string;
  text?: { body?: string };
  referral?: WaReferral;
}

interface WaContact {
  wa_id?: string;
  profile?: { name?: string };
}

export interface WaWebhookBody {
  object?: string;
  entry?: Array<{
    id?: string;
    changes?: Array<{
      field?: string;
      value?: {
        messaging_product?: string;
        metadata?: { display_phone_number?: string; phone_number_id?: string };
        contacts?: WaContact[];
        messages?: WaMessage[];
        statuses?: unknown[];
      };
    }>;
  }>;
}

export interface IngestResult {
  messages: number;
  withClid: number;
  stored: number;
  /** First database error, if any. supabase-js RETURNS errors, it does not throw —
   *  so this must be checked explicitly or a broken/missing table reports success. */
  error: string | null;
}

function textOf(m: WaMessage): string | null {
  if (m.type === "text") return m.text?.body ?? null;
  return m.type ? `[${m.type}]` : null;
}

/**
 * Persist every inbound message in the payload, upserting one lead row per
 * (person, click). Returns counts so the route can log without leaking PII.
 */
export async function ingestWhatsappWebhook(body: WaWebhookBody): Promise<IngestResult> {
  const out: IngestResult = { messages: 0, withClid: 0, stored: 0, error: null };
  const db = getSupabaseAdmin();
  if (!db) out.error = "supabase not configured";
  const note = (e: { message?: string } | null | undefined) => {
    if (e && !out.error) out.error = e.message ?? "unknown db error";
  };

  for (const entry of body.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const v = change.value;
      if (!v) continue;
      // `statuses` callbacks (delivered/read receipts) carry no messages — skip.
      const messages = v.messages ?? [];
      if (messages.length === 0) continue;

      const nameByWaId = new Map<string, string>();
      for (const c of v.contacts ?? []) {
        if (c.wa_id && c.profile?.name) nameByWaId.set(c.wa_id, c.profile.name);
      }

      for (const m of messages) {
        const waId = m.from;
        if (!waId) continue;
        out.messages += 1;
        const ref = m.referral;
        const clid = ref?.ctwa_clid ?? null;
        if (clid) out.withClid += 1;
        if (!db) continue;

        try {
          // Upsert the lead. onConflict matches the (wa_id, coalesce(ctwa_clid,''))
          // unique index; Supabase needs the literal column list here.
          const { data: lead, error: leadErr } = await db
            .from("whatsapp_leads")
            .upsert(
              {
                wa_id: waId,
                profile_name: nameByWaId.get(waId) ?? null,
                ctwa_clid: clid,
                source_id: ref?.source_id ?? null,
                source_type: ref?.source_type ?? null,
                source_url: ref?.source_url ?? null,
                headline: ref?.headline ?? null,
                body: ref?.body ?? null,
                first_message: textOf(m),
                last_seen_at: new Date().toISOString(),
              },
              { onConflict: "wa_id,ctwa_clid", ignoreDuplicates: false },
            )
            .select("id")
            .maybeSingle();
          note(leadErr);

          let leadId = lead?.id as string | undefined;
          if (!leadId) {
            // Upsert collided on the expression index — fetch the existing row.
            const { data, error } = await db
              .from("whatsapp_leads")
              .select("id")
              .eq("wa_id", waId)
              .order("last_seen_at", { ascending: false })
              .limit(1)
              .maybeSingle();
            note(error);
            leadId = data?.id as string | undefined;
          }

          if (m.id) {
            const { error } = await db.from("whatsapp_messages").upsert(
              {
                lead_id: leadId ?? null,
                wa_id: waId,
                message_id: m.id,
                direction: "in",
                type: m.type ?? null,
                body: textOf(m),
                raw: m as unknown as Record<string, unknown>,
                sent_at: m.timestamp
                  ? new Date(Number(m.timestamp) * 1000).toISOString()
                  : null,
              },
              { onConflict: "message_id", ignoreDuplicates: true },
            );
            note(error);
          }

          if (leadId) {
            // message_count is a running tally; recompute from the log so
            // webhook retries can't inflate it.
            const { count, error } = await db
              .from("whatsapp_messages")
              .select("id", { count: "exact", head: true })
              .eq("lead_id", leadId);
            note(error);
            if (typeof count === "number") {
              const { error: updErr } = await db
                .from("whatsapp_leads")
                .update({ message_count: count })
                .eq("id", leadId);
              note(updErr);
            }
          }
          // Only claim success if a lead row actually came back.
          if (leadId) out.stored += 1;
        } catch (e) {
          // supabase-js normally returns errors rather than throwing; this is
          // the belt-and-braces path. The webhook must still 200 regardless.
          note({ message: e instanceof Error ? e.message : "threw" });
        }
      }
    }
  }
  return out;
}
