// Central site configuration & structured-data org block.

export const SITE = {
  name: "Voltec Appliances",
  shortName: "Voltec",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://voltecappliances.com",
  description:
    "Authorised EVE distributor and direct importer of genuine EVE lithium batteries and LiFePO4 cells for solar energy storage, and manufacturer of voltage stabilizers (IGBT, SVC, AVR) and industrial systems. Established as Voltec in 1995, with roots in a 1980s Lahore workshop. Serving Pakistan, the UAE and China.",
  locale: "en-PK",
  // Primary line — Pakistan sales + WhatsApp. Every PK-facing CTA uses this.
  phone: "+92-321-1644447",
  phoneDisplay: "+92 321 1644447",
  // Secondary — Dubai office, for international / export enquiries only.
  phoneUae: "+971 525 414 894",
  // Abid Market retail store landline. Must stay identical to the Google
  // Business Profile / Facebook Page listing — (042) 36368601 — or the local
  // listing loses NAP consistency.
  phoneStore: "+92-42-3636-8601",
  phoneStoreDisplay: "+92 42 3636 8601",
  email: "voltecappliances@hotmail.com",
  wechat: "rab657",
  whatsapp: "923211644447",
  established: 1995,
  founder: "Riaz Ahmad",
  chairman: "Riaz Ahmad",
  md: "Raheel Ahmad",
  markets: ["Pakistan", "UAE", "China"],
  cities: ["Lahore", "Dubai", "Shenzhen"],
  mapsQuery: "Voltec Appliances Lahore",
  // Showroom trading hours, confirmed by the user 2026-07-31: Mon–Sat, Sunday closed.
  // ⚠️ Must stay identical to the Google Business Profile and the Facebook Page —
  // mismatched hours undermine the local pack the same way a mismatched phone does.
  hours: { opens: "10:00", closes: "20:00", days: ["Mo", "Tu", "We", "Th", "Fr", "Sa"] },
  hoursDisplay: "Mon–Sat · 10am–8pm PKT",
  // Showroom coordinates — same point the Lahore Showroom Google campaign uses
  // for its 15km proximity radius.
  geo: { lat: 31.550733, lng: 74.316244 },
  // Bank-transfer checkout details — shown publicly on the order confirmation page.
  bank: {
    bankName: "United Bank Limited (UBL)",
    branch: "Abid Market Branch",
    accountTitle: "Voltec Appliances",
    accountNumber: "0859203486113",
    iban: "PK17UNIL0109000203486113",
  },
} as const;

export const VOLTEC_ORG = {
  "@type": "Organization",
  "@id": `${SITE.url}/#organization`,
  name: SITE.name,
  legalName: SITE.name,
  alternateName: SITE.shortName,
  url: SITE.url,
  logo: `${SITE.url}/assets/logo.png`,
  image: `${SITE.url}/assets/logo.png`,
  description: SITE.description,
  slogan: "Power you can rely on. Power that never quits.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Abid Market, 26/8 Temple Rd, Mozang Chungi",
    addressLocality: "Lahore",
    addressRegion: "Punjab",
    addressCountry: "PK",
  },
  telephone: SITE.phone,
  email: SITE.email,
  foundingDate: "1995",
  founder: { "@type": "Person", name: SITE.founder },
  areaServed: SITE.markets.map((m) => ({ "@type": "Country", name: m })),
  contactPoint: [
    {
      "@type": "ContactPoint",
      telephone: SITE.phone,
      contactType: "sales",
      areaServed: "PK",
      availableLanguage: ["English", "Urdu"],
    },
    {
      "@type": "ContactPoint",
      telephone: SITE.phoneStore.replace(/\s/g, ""),
      contactType: "customer service",
      areaServed: "PK",
      availableLanguage: ["English", "Urdu"],
    },
    {
      "@type": "ContactPoint",
      telephone: SITE.phoneUae.replace(/\s/g, ""),
      contactType: "sales",
      areaServed: "AE",
      availableLanguage: ["English", "Arabic"],
    },
  ],
  // Topical authority: the subjects answer engines should associate with Voltec.
  knowsAbout: [
    "Voltage stabilizers",
    "Inverter (IGBT) voltage stabilizers",
    "Servo motor (SVC) voltage stabilizers",
    "AVR relay voltage stabilizers",
    "Three-phase industrial voltage stabilizers",
    "Lithium batteries",
    "LiFePO4 batteries",
    "Solar batteries",
    "LFP lithium iron phosphate cells",
    "EVE Grade-A prismatic battery cells",
    "Solar energy storage systems",
    "Battery management systems (BMS)",
    "PCB power relays",
    "Voltage fluctuation and load-shedding in Pakistan",
  ],
  sameAs: [] as string[],
};

// The physical Abid Market showroom, as a LocalBusiness node.
//
// WHY (added 2026-07-31): the site emitted only an Organization, which carries no
// hours and no coordinates — so Google had nothing to build a local listing from,
// even though a whole Google campaign ("Lahore Showroom · Calls + Directions") is
// paid to drive walk-ins and directions. This is what feeds the local pack, the
// knowledge panel and answer engines asking "when is Voltec open?".
//
// ⚠️ Uses `phoneStore`, NOT the primary line: this is a location surface, and the
// landline must stay byte-identical to the Google Business Profile for NAP
// consistency. Do not "simplify" it to SITE.phone.
export const VOLTEC_STORE = {
  "@type": "Store",
  "@id": `${SITE.url}/#showroom`,
  name: `${SITE.name} — Abid Market Showroom`,
  parentOrganization: { "@id": `${SITE.url}/#organization` },
  url: `${SITE.url}/contact`,
  image: `${SITE.url}/assets/logo.png`,
  address: VOLTEC_ORG.address,
  telephone: SITE.phoneStore,
  email: SITE.email,
  geo: {
    "@type": "GeoCoordinates",
    latitude: SITE.geo.lat,
    longitude: SITE.geo.lng,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: SITE.hours.days.map(
        (d) =>
          ({
            Mo: "Monday",
            Tu: "Tuesday",
            We: "Wednesday",
            Th: "Thursday",
            Fr: "Friday",
            Sa: "Saturday",
          })[d],
      ),
      opens: SITE.hours.opens,
      closes: SITE.hours.closes,
    },
  ],
  currenciesAccepted: "PKR",
  paymentAccepted: "Cash, Bank transfer",
  areaServed: { "@type": "Country", name: "Pakistan" },
};

export function absUrl(path = "/"): string {
  if (path.startsWith("http")) return path;
  return `${SITE.url}${path.startsWith("/") ? path : `/${path}`}`;
}
