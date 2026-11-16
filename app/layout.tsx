import type { Metadata } from "next";
// Fonts are self-hosted (app/fonts/, latin subset from Google Fonts) so the build never
// downloads from Google — Vercel builds failed twice on 2026-11-16 when that fetch failed.
import localFont from "next/font/local";
import "../styles/styles.css";
import "./globals.css";
import { cookies } from "next/headers";
import { SITE, VOLTEC_ORG, VOLTEC_STORE } from "@/lib/site";
import { LOCALE_COOKIE, isLocale, isRtl, DEFAULT_LOCALE } from "@/lib/i18n";
import { I18nProvider } from "@/components/I18nProvider";
import Analytics from "@/components/Analytics";
import JsonLd from "@/components/JsonLd";

const display = localFont({
  src: [
    { path: "./fonts/InstrumentSerif-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/InstrumentSerif-Italic.woff2", weight: "400", style: "italic" },
  ],
  variable: "--f-display",
  display: "swap",
  adjustFontFallback: "Times New Roman",
});

const ui = localFont({
  src: "./fonts/InterTight-Variable.woff2",
  weight: "100 900",
  style: "normal",
  variable: "--f-ui",
  display: "swap",
});

const mono = localFont({
  src: "./fonts/JetBrainsMono-Variable.woff2",
  weight: "100 800",
  style: "normal",
  variable: "--f-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    // Lead with the product terms people search, not the company name — the brand
    // already wins its own query. GSC 2026-09-21: 788 impressions, 37 clicks.
    default: `Voltage Stabilizers & EVE Lithium Cells in Pakistan — Importers Since 1995`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: [
    "voltage stabilizer Pakistan",
    "IGBT static stabilizer",
    "SVC servo stabilizer",
    "industrial stabilizer",
    "lithium battery Pakistan",
    "LiFePO4 battery Pakistan",
    "solar battery Pakistan",
    "lithium battery Lahore",
    "EVE lithium cells",
    "LFP battery Pakistan",
    "Lahore power electronics",
  ],
  authors: [{ name: SITE.name }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE.name,
    locale: "en_PK",
    url: SITE.url,
    title: `${SITE.name} — Power reliability for Pakistan`,
    description: SITE.description,
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true, "max-image-preview": "large" } as Metadata["robots"],
  verification: {
    google: "eudUmDINvCPiefN8NuG9xS1FlPrw_jazEMO1cSSLqyg",
    // Meta Business Manager domain verification (public token, like the Google
    // one above). Gates Business Verification → WhatsApp Cloud API production.
    other: { "facebook-domain-verification": "aejph1k0vkxqp89f6g82gfytlikrks" },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const store = await cookies();
  const raw = store.get(LOCALE_COOKIE)?.value;
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  return (
    <html
      lang={locale}
      dir={isRtl(locale) ? "rtl" : "ltr"}
      className={`${display.variable} ${ui.variable} ${mono.variable}`}
    >
      <body>
        <I18nProvider locale={locale}>
        <JsonLd
          id="ld-org"
          data={{
            "@context": "https://schema.org",
            ...VOLTEC_ORG,
          }}
        />
        {/* Physical showroom: hours, coordinates and the GBP-matching landline.
            Site-wide on purpose — it is how Google builds the local listing that
            the "Lahore Showroom (Calls + Directions)" campaign pays to fill. */}
        <JsonLd
          id="ld-store"
          data={{
            "@context": "https://schema.org",
            ...VOLTEC_STORE,
          }}
        />
        <JsonLd
          id="ld-website"
          data={{
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: SITE.name,
            url: SITE.url,
            inLanguage: SITE.locale,
          }}
        />
          {children}
          <Analytics />
        </I18nProvider>
      </body>
    </html>
  );
}
