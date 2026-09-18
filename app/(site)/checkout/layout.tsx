import type { Metadata } from "next";

// /checkout is a form step, not a landing page. Keep it out of Google: it was
// being indexed (GSC showed impressions on /checkout?model=R3, 2026-09-18).
// Mirrors app/admin/layout.tsx — the page itself is a client component, so the
// robots override has to live in a server layout.
export const metadata: Metadata = {
  title: "Checkout — Voltec",
  robots: { index: false, follow: false },
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
