// Real cover images for blog posts, keyed by slug. Generated with Higgsfield
// (serious, photoreal, on-topic — no stock 3D people). The solid-state cluster
// (Oct 2026) uses 1200×630 crops of the SCR/IGBT/SVC product imagery. Used for the article
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
  "solid-state-voltage-stabilizer": "assets/blog/solid-state-voltage-stabilizer.jpg",
  "scr-vs-servo-stabilizer": "assets/blog/scr-vs-servo-stabilizer.jpg",
  "igbt-vs-servo-stabilizer": "assets/blog/igbt-vs-servo-stabilizer.jpg",
  "scr-vs-igbt-stabilizer": "assets/blog/scr-vs-igbt-stabilizer.jpg",
  "what-is-scr-thyristor-stabilizer": "assets/blog/what-is-scr-thyristor-stabilizer.jpg",
  "what-is-igbt-inverter-stabilizer": "assets/blog/what-is-igbt-inverter-stabilizer.jpg",
  "servo-stabilizer-problems": "assets/blog/servo-stabilizer-problems.jpg",
  "stabilizer-for-laser-cnc-medical-equipment": "assets/blog/stabilizer-for-laser-cnc-medical-equipment.jpg",
  "servo-stabilizer-maintenance": "assets/blog/servo-stabilizer-maintenance.jpg",
};

export function coverFor(slug: string): string | null {
  return POST_COVER[slug] || null;
}
