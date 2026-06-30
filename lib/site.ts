// Central site configuration & structured-data org block.

export const SITE = {
  name: "Voltec Appliances",
  shortName: "Voltec",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://voltecappliances.com",
  description:
    "Maker of voltage stabilizers (IGBT, SVC, AVR), EVE lithium cells, industrial systems and electric parts. Established as Voltec in 1995, with roots in a 1980s Lahore workshop. Serving Pakistan, the UAE and China.",
  locale: "en-PK",
  phone: "+92-342-636-8601",
  phoneDisplay: "+92 342 636 8601",
  phoneUae: "+971 525 414 894",
  email: "voltecappliances@hotmail.com",
  wechat: "rab657",
  whatsapp: "923244004778",
  established: 1995,
  founder: "Riaz Ahmad",
  chairman: "Riaz Ahmad",
  md: "Raheel Ahmad",
  markets: ["Pakistan", "UAE", "China"],
  cities: ["Lahore", "Dubai", "Shenzhen"],
  mapsQuery: "Voltec Appliances Lahore",
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
    streetAddress: "Hall Road",
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
    "LFP lithium iron phosphate cells",
    "EVE Grade-A prismatic battery cells",
    "Solar energy storage systems",
    "Battery management systems (BMS)",
    "PCB power relays",
    "Voltage fluctuation and load-shedding in Pakistan",
  ],
  sameAs: [] as string[],
};

export function absUrl(path = "/"): string {
  if (path.startsWith("http")) return path;
  return `${SITE.url}${path.startsWith("/") ? path : `/${path}`}`;
}
