// Central site configuration & structured-data org block.

export const SITE = {
  name: "Voltec Appliances",
  shortName: "Voltec",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://voltecappliances.com",
  description:
    "Maker of voltage stabilizers (IGBT, SVC, AVR), EVE lithium cells, industrial systems and electric parts. Founded in Lahore in 1995. Serving Pakistan, the UAE and China.",
  locale: "en-PK",
  phone: "+92-324-400-4778",
  phoneDisplay: "+92 324 400 4778",
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
  name: SITE.name,
  url: SITE.url,
  logo: `${SITE.url}/assets/logo.png`,
  description: SITE.description,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Lahore",
    addressCountry: "PK",
  },
  telephone: SITE.phone,
  foundingDate: "1995",
  founder: { "@type": "Person", name: SITE.founder },
  areaServed: SITE.markets,
  sameAs: [] as string[],
};

export function absUrl(path = "/"): string {
  if (path.startsWith("http")) return path;
  return `${SITE.url}${path.startsWith("/") ? path : `/${path}`}`;
}
