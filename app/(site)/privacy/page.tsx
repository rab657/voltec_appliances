import type { Metadata } from "next";
import Link from "next/link";
import { SITE, absUrl } from "@/lib/site";
import { getT } from "@/lib/i18n-server";

// Standard privacy policy. Needed for the Meta app to go Live (Meta requires a
// Privacy Policy URL), and good practice for analytics/cookies disclosure.
export const metadata: Metadata = {
  title: "Privacy Policy | Voltec Appliances",
  description:
    "How Voltec Appliances collects, uses and protects your information — including analytics cookies (Google, Meta) and how to contact us.",
  alternates: { canonical: "/privacy" },
  openGraph: { type: "website", title: "Privacy Policy | Voltec Appliances", url: absUrl("/privacy") },
};

const UPDATED = "30 June 2026";

export default async function PrivacyPage() {
  const t = await getT();
  return (
    <main>
      <section className="page-head">
        <div className="container">
          <div className="crumbs">
            <Link href="/">{t("nav.home")}</Link> <span>/</span> <span>Privacy Policy</span>
          </div>
          <h1>Privacy Policy</h1>
          <p className="page-lede" style={{ maxWidth: "60ch" }}>
            How {SITE.name} collects, uses and protects your information. Last updated {UPDATED}.
          </p>
        </div>
      </section>

      <section className="section hairline-top">
        <div className="container med-narrow legal-body">
          <h2 className="med-h2">Who we are</h2>
          <p>
            {SITE.name} (&ldquo;we&rdquo;, &ldquo;us&rdquo;) manufactures and supplies voltage stabilizers,
            lithium cells, industrial power systems and electrical components, based in Lahore, Pakistan.
            You can reach us any time on WhatsApp, by phone at {SITE.phoneDisplay}, or by email at{" "}
            <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
          </p>

          <h2 className="med-h2">What we collect</h2>
          <ul>
            <li>
              <strong>Information you give us</strong> — when you message us on WhatsApp, call, email or fill
              in an enquiry, we receive your name, contact details and what you tell us about your needs.
            </li>
            <li>
              <strong>Usage &amp; device data</strong> — when you visit our website we automatically collect
              standard analytics: pages viewed, approximate location (from your IP), device and browser type,
              and how you arrived. This is used to understand and improve the site.
            </li>
            <li>
              <strong>Cookies &amp; similar tools</strong> — we use cookies and pixels for analytics and
              advertising measurement (see below).
            </li>
          </ul>
          <p>We do not ask for or store payment card details, passwords, or government ID numbers on this site.</p>

          <h2 className="med-h2">How we use it</h2>
          <ul>
            <li>To answer your enquiries and quote, size and supply the right product.</li>
            <li>To operate, secure and improve our website.</li>
            <li>To measure and improve our advertising so we show useful, relevant ads.</li>
          </ul>

          <h2 className="med-h2">Cookies, analytics &amp; advertising</h2>
          <p>
            We use <strong>Google Analytics</strong> and the <strong>Meta (Facebook) Pixel</strong>, together
            with Meta&apos;s Conversions API, to measure website activity and the performance of our ads. These
            tools may set cookies and receive your IP address, device information and the actions you take on
            the site (such as viewing a product or starting a WhatsApp chat). We share this measurement data
            with Google and Meta as processors so they can report on and optimise our campaigns. We do not sell
            your personal information.
          </p>
          <p>
            You can control cookies in your browser settings, opt out of Google Analytics with Google&apos;s
            browser add-on, and adjust ad preferences in your Google and Meta account settings.
          </p>

          <h2 className="med-h2">Who we share with</h2>
          <p>
            We share data only with service providers that help us run the business — our website host, our
            analytics and advertising platforms (Google, Meta), and messaging tools (WhatsApp) — and where
            required by law. We do not sell your data to third parties.
          </p>

          <h2 className="med-h2">How long we keep it</h2>
          <p>
            We keep enquiry and customer records for as long as needed to serve you and meet legal and
            accounting obligations, and analytics data for a limited period in line with the platforms&apos;
            standard retention.
          </p>

          <h2 className="med-h2">Your choices</h2>
          <p>
            You may ask us to access, correct or delete the personal information we hold about you, or to stop
            contacting you. Message us on WhatsApp or email{" "}
            <a href={`mailto:${SITE.email}`}>{SITE.email}</a> and we&apos;ll help.
          </p>

          <h2 className="med-h2">Changes</h2>
          <p>
            We may update this policy from time to time. The latest version will always be on this page with
            the date it was last updated.
          </p>

          <h2 className="med-h2">Contact</h2>
          <p>
            {SITE.name} · Lahore, Pakistan · {SITE.phoneDisplay} ·{" "}
            <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
          </p>
        </div>
      </section>
    </main>
  );
}
