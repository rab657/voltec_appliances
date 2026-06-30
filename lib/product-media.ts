import "server-only";
import { promises as fs } from "fs";
import path from "path";
import type { Product } from "./types";
import { PRODUCTS } from "./products";
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
  videos: string[];
  hidden: boolean;
  price: number | null;
  /** Display-name override (rename a variant's capacity). null = use code name. */
  name: string | null;
  /** Admin-created variants only: the code product id to clone specs/family from. */
  baseId: string | null;
  /** True for admin-created variants (no code counterpart). */
  isVariant: boolean;
}
export type MediaMap = Record<string, ProductMedia>;

const TABLE = "product_overrides";
const LOCAL_FILE = path.join(process.cwd(), ".data", "product-media.json");

// The local-JSON fallback is for localhost only. On a serverless host (Vercel)
// the filesystem is ephemeral, so writing there silently loses data on the next
// deploy/cold start. In production we require Supabase and never touch local FS.
const IS_DEV = process.env.NODE_ENV !== "production";
const NO_STORAGE_MSG =
  "Persistent storage is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the environment (e.g. Vercel → Settings → Environment Variables) so admin changes are saved to Supabase, not the temporary filesystem.";

const cleanList = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((s) => typeof s === "string" && s.trim()) : [];

function normalize(raw: Partial<ProductMedia> | undefined): ProductMedia {
  const name = typeof raw?.name === "string" && raw.name.trim() ? raw.name.trim() : null;
  const baseId = typeof raw?.baseId === "string" && raw.baseId.trim() ? raw.baseId.trim() : null;
  return {
    images: cleanList(raw?.images),
    videos: cleanList(raw?.videos),
    hidden: Boolean(raw?.hidden),
    price: typeof raw?.price === "number" && !Number.isNaN(raw.price) ? raw.price : null,
    name,
    baseId,
    isVariant: Boolean(raw?.isVariant),
  };
}
// An admin-created variant is never "empty" (it must persist even with no media yet),
// so only plain override rows for code products are pruned when cleared.
function isEmpty(m: ProductMedia): boolean {
  return (
    !m.isVariant &&
    m.images.length === 0 &&
    m.videos.length === 0 &&
    !m.hidden &&
    m.price === null &&
    m.name === null
  );
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
  if (!supabase) return IS_DEV ? readLocal() : {};
  try {
    const { data, error } = await supabase.from(TABLE).select("*");
    if (error || !data) return {};
    const map: MediaMap = {};
    for (const row of data as Record<string, unknown>[]) {
      map[row.product_id as string] = normalize({
        images: row.images as string[],
        // `videos`/`name`/`base_id`/`is_variant` columns may not exist yet (added in a
        // later migration); missing → defaults.
        videos: row.videos as string[] | undefined,
        hidden: row.hidden as boolean,
        price: row.price === null || row.price === undefined ? null : Number(row.price),
        name: (row.name as string | undefined) ?? null,
        baseId: (row.base_id as string | undefined) ?? null,
        isVariant: Boolean(row.is_variant),
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
    if (!IS_DEV) throw new Error(NO_STORAGE_MSG);
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
  const row = {
    product_id: id,
    images: clean.images,
    videos: clean.videos,
    hidden: clean.hidden,
    price: clean.price,
    name: clean.name,
    base_id: clean.baseId,
    is_variant: clean.isVariant,
    updated_at: new Date().toISOString(),
  };
  const { error } = await supabase.from(TABLE).upsert(row);
  if (error) {
    // A later-added column (videos/name/base_id/is_variant) may be missing on an
    // older project — surface the one-time migration instead of failing silently.
    const missingCol = /(videos|name|base_id|is_variant)/i.test(error.message) &&
      /column|schema|does not exist/i.test(error.message);
    if (missingCol) {
      throw new Error(
        "Database is missing newer columns. Run this once in Supabase → SQL editor: " +
          "alter table product_overrides " +
          "add column if not exists videos jsonb not null default '[]'::jsonb, " +
          "add column if not exists name text, " +
          "add column if not exists base_id text, " +
          "add column if not exists is_variant boolean not null default false;",
      );
    }
    throw new Error(error.message);
  }
}

// Delete an admin-created variant row entirely (used by the admin "Delete" action).
export async function deleteVariant(id: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    if (!IS_DEV) throw new Error(NO_STORAGE_MSG);
    const map = await readLocal();
    delete map[id];
    await writeLocal(map);
    return;
  }
  const { error } = await supabase.from(TABLE).delete().eq("product_id", id);
  if (error) throw new Error(error.message);
}

// ---- merge onto code product ----------------------------------------------
/** Overlay admin overrides onto a code-defined product. Safe when map is empty. */
export function applyMedia(product: Product, map: MediaMap): Product {
  const m = map[product.id];
  const images = m && m.images.length ? m.images : [product.image];
  const videos = m && m.videos.length ? m.videos : product.videos || [];
  return {
    ...product,
    name: m && m.name ? m.name : product.name,
    image: images[0] || product.image,
    images,
    videos,
    hidden: m ? m.hidden : product.hidden,
    price: m && m.price !== null ? m.price : product.price,
  };
}

/** Merge a list of products, then keep only the visible ones. */
export function visibleMerged(products: Product[], map: MediaMap): Product[] {
  return products.map((p) => applyMedia(p, map)).filter((p) => !p.hidden);
}

/**
 * Build an admin-created variant by cloning its base code product, then overriding
 * id/name/image/price. Specs, tech, category, description and showcase are inherited
 * from the base so the variant slots into its family's picker + showcase.
 */
function buildVariant(id: string, m: ProductMedia): Product | null {
  const base = m.baseId ? PRODUCTS.find((p) => p.id === m.baseId) : undefined;
  if (!base) return null;
  const images = m.images.length ? m.images : [base.image];
  return {
    ...base,
    id,
    name: m.name || base.name,
    image: images[0] || base.image,
    images,
    videos: m.videos.length ? m.videos : [],
    hidden: m.hidden,
    price: m.price !== null ? m.price : undefined,
  };
}

/**
 * The full product list the storefront should render: code products with name/media
 * overrides applied, plus admin-created variants synthesized from override rows.
 * Single merge point — pass the result into membersOf()/getProduct() on read paths.
 */
export function resolveProducts(map: MediaMap): Product[] {
  const fromCode = PRODUCTS.map((p) => applyMedia(p, map));
  const created: Product[] = [];
  for (const [id, m] of Object.entries(map)) {
    if (!m.isVariant) continue;
    const v = buildVariant(id, m);
    if (v) created.push(v);
  }
  return [...fromCode, ...created];
}
