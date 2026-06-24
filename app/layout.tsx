import type { Metadata } from "next";
import { Instrument_Serif, Inter_Tight, JetBrains_Mono } from "next/font/google";
import "../styles/styles.css";
import "./globals.css";
import { cookies } from "next/headers";
import { SITE, VOLTEC_ORG } from "@/lib/site";
import { LOCALE_COOKIE, isLocale, isRtl, DEFAULT_LOCALE } from "@/lib/i18n";
import { I18nProvider } from "@/components/I18nProvider";
import Analytics from "@/components/Analytics";
import JsonLd from "@/components/JsonLd";

const display = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--f-display",
  display: "swap",
});

const ui = Inter_Tight({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--f-ui",
  display: "swap",
});

const mono = JetBrains_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--f-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — Voltage Stabilizers, Lithium Cells & Power Electronics in Pakistan`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: [
    "voltage stabilizer Pakistan",
    "IGBT static stabilizer",
    "SVC servo stabilizer",
    "industrial stabilizer",
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
