import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { ADMIN_COOKIE, isValidSession } from "@/lib/admin-auth";
import { getMediaMap, upsertMedia, deleteVariant, type ProductMedia } from "@/lib/product-media";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function guard() {
  const jar = await cookies();
  return isValidSession(jar.get(ADMIN_COOKIE)?.value);
}

// Renames, new variants and visibility/price changes must surface on the live
// storefront immediately. These pages render the resolved product list.
function revalidateStorefront() {
  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/showcase/[family]", "page");
  revalidatePath("/products/[id]", "page");
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
    const body = (await req.json()) as { productId?: string; media?: Partial<ProductMedia> };
    if (!body.productId || !body.media) {
      return NextResponse.json({ error: "productId and media required" }, { status: 400 });
    }
    await upsertMedia(body.productId, body.media);
    revalidateStorefront();
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// Delete an admin-created variant entirely (code products can only be hidden).
export async function DELETE(req: Request) {
  if (!(await guard())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = (await req.json()) as { productId?: string };
    if (!body.productId) {
      return NextResponse.json({ error: "productId required" }, { status: 400 });
    }
    await deleteVariant(body.productId);
    revalidateStorefront();
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
