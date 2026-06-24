"use client";
import type { BlogPost } from "./types";
import { DEFAULT_POSTS } from "./blog-data";

// Client data layer for the admin. Uses the Supabase-backed API when available,
// and transparently falls back to localStorage when it is not configured.

const LS_KEY = "voltec_cms_v1";
export type AdminMode = "supabase" | "local";

function readLocal(): BlogPost[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.posts)) return parsed.posts as BlogPost[];
    }
  } catch {
    /* ignore */
  }
  return DEFAULT_POSTS;
}

function writeLocal(posts: BlogPost[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify({ posts }));
  } catch {
    /* ignore */
  }
}

export async function loadPosts(): Promise<{ mode: AdminMode; posts: BlogPost[] }> {
  try {
    const res = await fetch("/api/admin/posts", { cache: "no-store" });
    if (res.ok) {
      const { posts } = await res.json();
      return { mode: "supabase", posts: posts as BlogPost[] };
    }
  } catch {
    /* network/none — fall through to local */
  }
  return { mode: "local", posts: readLocal() };
}

export async function savePost(post: BlogPost, mode: AdminMode, all: BlogPost[]): Promise<void> {
  if (mode === "supabase") {
    const res = await fetch("/api/admin/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(post),
    });
    if (!res.ok) throw new Error("Save failed");
    return;
  }
  writeLocal(all.map((p) => (p.id === post.id ? post : p)));
}

export async function deletePostStore(id: string, mode: AdminMode, all: BlogPost[]): Promise<void> {
  if (mode === "supabase") {
    const res = await fetch(`/api/admin/posts/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Delete failed");
    return;
  }
  writeLocal(all.filter((p) => p.id !== id));
}

export function resetLocal(): BlogPost[] {
  try {
    localStorage.removeItem(LS_KEY);
  } catch {
    /* ignore */
  }
  return DEFAULT_POSTS;
}

export async function logout() {
  try {
    await fetch("/api/admin/login", { method: "DELETE" });
  } catch {
    /* ignore */
  }
}
