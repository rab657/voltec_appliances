// Shared domain types for Voltec

export type CategoryId =
  | "all"
  | "stabilizers"
  | "industrial"
  | "cells"
  | "parts";

export type Tech = "IGBT" | "SCR" | "SVC" | "AVR" | "LFP" | "BMS" | "Relay" | "LED";

export type Spec = [string, string];

export interface Product {
  id: string;
  name: string;
  category: string;
  categoryId: CategoryId;
  tech: Tech;
  badge?: string;
  /** Slug of a dedicated showcase landing page family, e.g. "stabilizer". */
  showcase?: string;
  tagline: string;
  highlight?: [string, string];
  description: string;
  image: string;
  specs: Spec[];
  status?: "upcoming";
  /** Hide from catalog listings/navigation (kept in data for easy re-enable). */
  hidden?: boolean;
  /** Gallery images (admin-managed). First entry is the primary/cover image. */
  images?: string[];
  /** Product videos (admin-managed): YouTube/Vimeo links or direct video URLs. */
  videos?: string[];
  /** Plain-language "what it runs", e.g. "Small home — 1–2 ACs + basics". */
  useFor?: string;
  /** Price in PKR. Optional — when unset the UI shows "Request price". */
  price?: number;
  /** Packing / logistics info for the packing table. */
  packing?: {
    productSize: string;
    packSize: string;
    nw: string;
    gw: string;
  };
  /** Rich data for lithium CELL detail pages (EVE-style). Each cell is distinct. */
  cell?: {
    format: string; // e.g. "Prismatic LFP", "Cylindrical LFP"
    capacityAh: string; // "102"
    voltageV: string; // "3.2"
    cycles: string; // "6,000+"
    weight: string; // "2.0 kg"
    size: string; // "174 × 72 × 207 mm"
    cRate: string; // "0.5C / 0.5C"
    applications: string[];
    features: string[];
    certifications: string[];
    /** Extra gallery images (beyond product.image) for the cell masthead. */
    gallery?: string[];
    /** Product videos {src, poster} shown in the gallery. */
    videos?: { src: string; poster: string }[];
    /** Cells ship in cartons of this size; sold only in whole cartons. */
    cartonSize?: number;
  };
}

export interface Category {
  id: CategoryId;
  label: string;
  count: number;
}

export interface Faq {
  q: string;
  a: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  cover: string;
  author: string;
  authorRole: string;
  readTime: number;
  date: string;
  published: boolean;
  body: string;
  // Optional per-post SEO/AEO overrides
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  takeaways?: string[];
  faqs?: Faq[];
}

export interface PostSeo {
  keywords: string[];
  takeaways: string[];
  faqs: Faq[];
}
