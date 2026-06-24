import "server-only";
import { promises as dns } from "node:dns";
import { getSupabaseAdmin } from "./supabase";

// Server-side event recorder for the "living site" dashboard.
// Best-effort and non-throwing: enriches each event with a reverse-DNS lookup
// (so we can see *where* visitors come from — ISPs, companies, universities,
// cloud providers) and persists to Supabase when configured.

interface IncomingEvent {
  event: string;
  params?: Record<string, unknown>;
  path?: string;
  ref?: string;
  ts?: number;
}

export function clientIp(req: Request): string {
  const h = req.headers;
  const fwd = h.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return h.get("x-real-ip") || h.get("cf-connecting-ip") || "";
}

function isPublicIp(ip: string): boolean {
  if (!ip) return false;
  if (ip === "::1" || ip.startsWith("127.") || ip.startsWith("10.")) return false;
  if (ip.startsWith("192.168.") || ip.startsWith("169.254.")) return false;
  // 172.16.0.0 – 172.31.255.255
  const m = ip.match(/^172\.(\d+)\./);
  if (m && +m[1] >= 16 && +m[1] <= 31) return false;
  return true;
}

// Reverse DNS — turn an IP into a hostname, and infer a rough "org" from it.
async function reverseDns(ip: string): Promise<{ hostname: string | null; org: string | null }> {
  if (!isPublicIp(ip)) return { hostname: null, org: null };
  try {
    const names = await Promise.race([
      dns.reverse(ip),
      new Promise<string[]>((_, rej) => setTimeout(() => rej(new Error("timeout")), 1500)),
    ]);
    const hostname = names && names[0] ? names[0] : null;
    return { hostname, org: orgFromHostname(hostname) };
  } catch {
    return { hostname: null, org: null };
  }
}

// Best-effort org name from a reverse-DNS hostname, e.g.
// "host-12.ptcl.net.pk" -> "ptcl", "ec2-3-1-2-3.compute.amazonaws.com" -> "amazonaws".
function orgFromHostname(hostname: string | null): string | null {
  if (!hostname) return null;
  const parts = hostname.split(".").filter(Boolean);
  if (parts.length < 2) return hostname;
  // Drop common public-suffix tails to find the registrable label.
  const tails = new Set(["com", "net", "org", "pk", "co", "io", "ai", "edu", "gov", "uk", "ae"]);
  let i = parts.length - 1;
  while (i > 0 && tails.has(parts[i])) i--;
  return parts[i] || hostname;
}

export async function recordEvent(req: Request, body: IncomingEvent): Promise<void> {
  const ip = clientIp(req);
  const ua = req.headers.get("user-agent") || "";
  const { hostname, org } = await reverseDns(ip);

  const record = {
    event: body.event,
    path: body.path || "",
    referrer: body.ref || "",
    params: body.params || {},
    ip,
    ua,
    hostname,
    org,
    country: req.headers.get("x-vercel-ip-country") || null,
    city: req.headers.get("x-vercel-ip-city") || null,
  };

  if (process.env.ANALYTICS_DEBUG === "1") {
    // eslint-disable-next-line no-console
    console.log("[track]", JSON.stringify(record));
  }

  const db = getSupabaseAdmin();
  if (db) {
    try {
      await db.from("events").insert(record);
    } catch {
      /* never throw from the collector */
    }
  }
}
