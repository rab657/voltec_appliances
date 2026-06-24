import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, isValidSession } from "@/lib/admin-auth";
import { getMediaMap, upsertMedia, type ProductMedia } from "@/lib/product-media";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function guard() {
  const jar = await cookies();
  return isValidSession(jar.get(ADMIN_COOKIE)?.value);
}

export async function GET() {
  if (!(await guard())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    return NextResponse.json({ media: await getMediaMap() });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!(await guard())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = (await req.json()) as { productId?: string; media?: ProductMedia };
    if (!body.productId || !body.media) {
      return NextResponse.json({ error: "productId and media required" }, { status: 400 });
    }
    await upsertMedia(body.productId, body.media);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
