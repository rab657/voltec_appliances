import "server-only";
import { getSupabaseAdmin } from "./supabase";

export interface EventRow {
  id: number;
  event: string;
  path: string | null;
  referrer: string | null;
  params: Record<string, unknown> | null;
  ip: string | null;
  ua: string | null;
  hostname: string | null;
  org: string | null;
  country: string | null;
  city: string | null;
  created_at: string;
}

export interface AnalyticsSummary {
  configured: boolean;
  total: number;
  byEvent: { name: string; count: number }[];
  topPaths: { path: string; count: number }[];
  topProducts: { name: string; count: number }[];
  topOrgs: { org: string; count: number }[];
  topReferrers: { ref: string; count: number }[];
  recent: EventRow[];
}

function tally<T extends string>(items: (T | null | undefined)[], limit = 10) {
  const map = new Map<string, number>();
  for (const it of items) {
    if (!it) continue;
    map.set(it, (map.get(it) || 0) + 1);
  }
  return [...map.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export async function getAnalyticsSummary(days = 30): Promise<AnalyticsSummary> {
  const empty: AnalyticsSummary = {
    configured: false,
    total: 0,
    byEvent: [],
    topPaths: [],
    topProducts: [],
    topOrgs: [],
    topReferrers: [],
    recent: [],
  };
  const db = getSupabaseAdmin();
  if (!db) return empty;

  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await db
    .from("events")
    .select("*")
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(5000);

  if (error || !data) return { ...empty, configured: true };

  const rows = data as EventRow[];
  const productNames = rows
    .filter((r) => r.event === "view_item" || r.event === "whatsapp_click")
    .map((r) => (r.params?.name || r.params?.product) as string | undefined);

  return {
    configured: true,
    total: rows.length,
    byEvent: tally(rows.map((r) => r.event)),
    topPaths: tally(rows.map((r) => r.path)).map((x) => ({ path: x.name, count: x.count })),
    topProducts: tally(productNames).map((x) => ({ name: x.name, count: x.count })),
    topOrgs: tally(rows.map((r) => r.org)).map((x) => ({ org: x.name, count: x.count })),
    topReferrers: tally(
      rows.map((r) => {
        if (!r.referrer) return "Direct / none";
        try {
          return new URL(r.referrer).hostname;
        } catch {
          return r.referrer;
        }
      }),
    ).map((x) => ({ ref: x.name, count: x.count })),
    recent: rows.slice(0, 40),
  };
}
