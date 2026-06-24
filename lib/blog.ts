import "server-only";
import type { BlogPost } from "./types";
import { DEFAULT_POSTS } from "./blog-data";
import { getSupabaseAdmin } from "./supabase";

// Data-access layer for blog posts.
// Falls back to the seed content when Supabase is not configured, so the site
// works end-to-end before any backend is connected.

function sortByDateDesc(posts: BlogPost[]): BlogPost[] {
  return [...posts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

export async function getAllPosts(): Promise<BlogPost[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return sortByDateDesc(DEFAULT_POSTS);
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("date", { ascending: false });
  if (error || !data || data.length === 0) return sortByDateDesc(DEFAULT_POSTS);
  return data as BlogPost[];
}

export async function getPublishedPosts(): Promise<BlogPost[]> {
  return (await getAllPosts()).filter((p) => p.published);
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const posts = await getAllPosts();
  return posts.find((p) => p.slug === slug) || null;
}

export async function getPostById(id: string): Promise<BlogPost | null> {
  const posts = await getAllPosts();
  return posts.find((p) => p.id === id) || null;
}
