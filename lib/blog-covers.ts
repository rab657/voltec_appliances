// Real cover images for blog posts, keyed by slug. Generated with Higgsfield
// (serious, photoreal, on-topic — no stock 3D people). Used for the article
// hero, related-post thumbnails, and the post's social-share (OG) image. Falls
// back to the branded placeholder when a slug isn't mapped.
export const POST_COVER: Record<string, string> = {
  "choose-right-solar-battery": "assets/blog/choose-right-solar-battery.jpg",
  "kns-kasur-case-study": "assets/blog/kns-kasur-case-study.jpg",
  "home-stabilizer-guide": "assets/blog/home-stabilizer-guide.jpg",
  "rack-mount-shops-offices": "assets/blog/rack-mount-shops-offices.jpg",
  "signs-battery-dying": "assets/blog/signs-battery-dying.jpg",
  "gwadar-installation": "assets/blog/gwadar-installation.jpg",
  "inverter-vs-servo-vs-relay-stabilizer": "assets/blog/inverter-vs-servo-vs-relay-stabilizer.jpg",
  "inverter-stabilizer-electricity-bill": "assets/blog/inverter-stabilizer-electricity-bill.jpg",
  "what-size-stabilizer-pakistan-home": "assets/blog/what-size-stabilizer-pakistan-home.jpg",
  "lithium-vs-lead-acid-pakistan": "assets/blog/lithium-vs-lead-acid-pakistan.jpg",
};

export function coverFor(slug: string): string | null {
  return POST_COVER[slug] || null;
}
