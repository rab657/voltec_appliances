import Link from "next/link";
import { SIZING_PUBLIC } from "@/lib/sizing";

// Shown on every sizing page while the review gate is closed (lib/sizing.ts
// SIZING_PUBLIC = false), so testers know the figures are not final and any
// stray visitor is told the same. Renders nothing once the calculator is public.
export default function SizingReviewBanner() {
  if (SIZING_PUBLIC) return null;
  return (
    <div className="sz-review-banner" role="note">
      <div className="container">
        <strong>Test version.</strong> Our engineers are checking these figures before this calculator goes
        public. <Link href="/stabilizer-size/review">See every assumption and answer on one page →</Link>
      </div>
    </div>
  );
}
