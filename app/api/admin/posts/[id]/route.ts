import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase";
import { adminDeletePost } from "@/lib/blog-admin";

export const runtime = "nodejs";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "SUPABASE_NOT_CONFIGURED" }, { status: 501 });
  }
  try {
    const { id } = await params;
    await adminDeletePost(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
