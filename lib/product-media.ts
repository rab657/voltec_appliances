import "server-only";
import { promises as fs } from "fs";
import path from "path";
import type { Product } from "./types";
import { getSupabaseAdmin } from "./supabase";

// Admin-managed overrides for products. Base product data lives in code
// (lib/products.ts); this layer overlays what an editor controls from the admin
// portal (/admin/products): gallery images, visibility (show/hide), and price.
//
// Storage: Supabase table `product_overrides` when configured (prod), otherwise
// a local JSON file under .data/ so the portal works on localhost with zero
// setup. Read/merge API is identical in both modes.

export interface ProductMedia {
  images: string[];
  hidden: boolean;
  price: number | null;
}
export type MediaMap = Record<string, ProductMedia>;

const TABLE = "product_overrides";
const LOCAL_FILE = path.join(process.cwd(), ".data", "product-media.json");

function normalize(raw: Partial<ProductMedia> | undefined): ProductMedia {
  return {
    images: Array.isArray(raw?.images) ? raw!.images.filter((s) => typeof s === "string" && s.trim()) : [],
    hidden: Boolean(raw?.hidden),
    price: typeof raw?.price === "number" && !Number.isNaN(raw.price) ? raw.price : null,
  };
}
function isEmpty(m: ProductMedia): boolean {
  return m.images.length === 0 && !m.hidden && m.price === null;
}

// ---- local JSON fallback (dev) --------------------------------------------
async function readLocal(): Promise<MediaMap> {
  try {
    const parsed = JSON.parse(await fs.readFile(LOCAL_FILE, "utf8"));
    const map: MediaMap = {};
    for (const [k, v] of Object.entries(parsed || {})) map[k] = normalize(v as ProductMedia);
    return map;
  } catch {
    return {};
  }
}
async function writeLocal(map: MediaMap): Promise<void> {
  await fs.mkdir(path.dirname(LOCAL_FILE), { recursive: true });
  await fs.writeFile(LOCAL_FILE, JSON.stringify(map, null, 2), "utf8");
}

// ---- read ------------------------------------------------------------------
export async function getMediaMap(): Promise<MediaMap> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return readLocal();
  try {
    const { data, error } = await supabase.from(TABLE).select("*");
    if (error || !data) return {};
    const map: MediaMap = {};
    for (const row of data as Record<string, unknown>[]) {
      map[row.product_id as string] = normalize({
        images: row.images as string[],
        hidden: row.hidden as boolean,
        price: row.price === null || row.price === undefined ? null : Number(row.price),
      });
    }
    return map;
  } catch {
    return {};
  }
}

export async function getMediaFor(id: string): Promise<ProductMedia | null> {
  return (await getMediaMap())[id] || null;
}

// ---- write -----------------------------------------------------------------
export async function upsertMedia(id: string, media: Partial<ProductMedia>): Promise<void> {
  const clean = normalize(media);
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    const map = await readLocal();
    if (isEmpty(clean)) delete map[id];
    else map[id] = clean;
    await writeLocal(map);
    return;
  }
  if (isEmpty(clean)) {
    const { error } = await supabase.from(TABLE).delete().eq("product_id", id);
    if (error) throw new Error(error.message);
    return;
  }
  const { error } = await supabase.from(TABLE).upsert({
    product_id: id,
    images: clean.images,
    hidden: clean.hidden,
    price: clean.price,
    updated_at: new Date().toISOString(),
  });
  if (error) throw new Error(error.message);
}

// ---- merge onto code product ----------------------------------------------
/** Overlay admin overrides onto a code-defined product. Safe when map is empty. */
export function applyMedia(product: Product, map: MediaMap): Product {
  const m = map[product.id];
  const images = m && m.images.length ? m.images : [product.image];
  return {
    ...product,
    image: images[0] || product.image,
    images,
    hidden: m ? m.hidden : product.hidden,
    price: m && m.price !== null ? m.price : product.price,
  };
}

/** Merge a list of products, then keep only the visible ones. */
export function visibleMerged(products: Product[], map: MediaMap): Product[] {
  return products.map((p) => applyMedia(p, map)).filter((p) => !p.hidden);
}
