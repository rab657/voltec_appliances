import "server-only";
import type { BlogPost } from "./types";
import { getSupabaseAdmin } from "./supabase";

// Server-side blog CRUD via the Supabase service-role client.
// All functions throw if Supabase is not configured — callers should check
// isSupabaseConfigured() first and fall back to client-side storage.

function requireDb() {
  const db = getSupabaseAdmin();
  if (!db) throw new Error("SUPABASE_NOT_CONFIGURED");
  return db;
}

export async function adminListPosts(): Promise<BlogPost[]> {
  const db = requireDb();
  const { data, error } = await db.from("posts").select("*").order("date", { ascending: false });
  if (error) throw error;
  return (data || []) as BlogPost[];
}

export async function adminUpsertPost(post: BlogPost): Promise<BlogPost> {
  const db = requireDb();
  const row = { ...post, updated_at: new Date().toISOString() };
  const { data, error } = await db.from("posts").upsert(row).select().single();
  if (error) throw error;
  return data as BlogPost;
}

export async function adminDeletePost(id: string): Promise<void> {
  const db = requireDb();
  const { error } = await db.from("posts").delete().eq("id", id);
  if (error) throw error;
}
