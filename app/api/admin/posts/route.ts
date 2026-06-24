import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase";
import { adminListPosts, adminUpsertPost } from "@/lib/blog-admin";
import type { BlogPost } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 501 tells the client to fall back to localStorage mode.
function notConfigured() {
  return NextResponse.json({ error: "SUPABASE_NOT_CONFIGURED" }, { status: 501 });
}

export async function GET() {
  if (!isSupabaseConfigured()) return notConfigured();
  try {
    const posts = await adminListPosts();
    return NextResponse.json({ posts });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!isSupabaseConfigured()) return notConfigured();
  try {
    const post = (await req.json()) as BlogPost;
    const saved = await adminUpsertPost(post);
    return NextResponse.json({ post: saved });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
