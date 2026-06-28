// Real cover images for blog posts, keyed by slug, drawn from internal
// brochure/product assets (no stock 3D people). Used for the article hero,
// related-post thumbnails, and the post's social-share (OG) image. Falls back
// to the branded placeholder when a slug isn't mapped.
export const POST_COVER: Record<string, string> = {
  "choose-right-solar-battery": "assets/igbt/home-solar.jpg",
  "kns-kasur-case-study": "assets/igbt/power-stage.jpg",
  "home-stabilizer-guide": "assets/igbt/display.jpg",
  "rack-mount-shops-offices": "assets/prod-lithium.png",
  "signs-battery-dying": "assets/igbt/vp-medical.jpg",
  "gwadar-installation": "assets/igbt/home-solar.jpg",
  "inverter-vs-servo-vs-relay-stabilizer": "assets/igbt/range.jpg",
  "inverter-stabilizer-electricity-bill": "assets/igbt/vp-grid.jpg",
  "what-size-stabilizer-pakistan-home": "assets/igbt/powers-home.jpg",
  "lithium-vs-lead-acid-pakistan": "assets/prod-cylindrical.jpg",
};

export function coverFor(slug: string): string | null {
  return POST_COVER[slug] || null;
}
