// Video sources for product galleries. `Product.videos` holds plain strings
// (see lib/types.ts) because the admin UI lets you paste any link, so the work
// of deciding what is safely embeddable happens here.

export type VideoSource = { kind: "iframe" | "file"; src: string };

// Turn an admin-entered video URL (YouTube / Vimeo / direct file) into an
// embeddable source. Returns null for anything we can't safely embed.
export function videoSource(url: string): VideoSource | null {
  if (!url) return null;
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/))([\w-]{6,})/);
  if (yt) return { kind: "iframe", src: `https://www.youtube-nocookie.com/embed/${yt[1]}` };
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) return { kind: "iframe", src: `https://player.vimeo.com/video/${vimeo[1]}` };
  if (/\.(mp4|webm|ogg|mov|m4v)(\?|$)/i.test(url)) {
    return { kind: "file", src: url.startsWith("/") || url.startsWith("http") ? url : `/${url}` };
  }
  return null;
}

/**
 * Poster for a clip we ship ourselves: every video under /assets has a sibling
 * `-poster.webp` (e.g. svc60-demo-range.mp4 → svc60-demo-range-poster.webp).
 * Admin-uploaded videos live on Supabase and have no poster — undefined there,
 * and the gallery falls back to the clip's own first frame.
 */
export function videoPoster(src: string): string | undefined {
  const m = src.match(/^\/assets\/.+?(\.(?:mp4|webm|mov|m4v))$/i);
  return m ? src.slice(0, -m[1].length) + "-poster.webp" : undefined;
}
