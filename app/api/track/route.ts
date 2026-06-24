import { NextResponse } from "next/server";
import { recordEvent } from "@/lib/analytics-server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    await recordEvent(req, body);
  } catch {
    // Never surface collector errors to the client beacon.
  }
  return new NextResponse(null, { status: 204 });
}
