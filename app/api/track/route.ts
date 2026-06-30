import { NextResponse } from "next/server";
import { recordEvent } from "@/lib/analytics-server";
import { sendCapiEvent } from "@/lib/meta-capi";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // First-party collector + Meta Conversions API (server-side), in parallel.
    // Both best-effort; neither blocks the 204 beacon response.
    await Promise.allSettled([recordEvent(req, body), sendCapiEvent(req, body)]);
  } catch {
    // Never surface collector errors to the client beacon.
  }
  return new NextResponse(null, { status: 204 });
}
