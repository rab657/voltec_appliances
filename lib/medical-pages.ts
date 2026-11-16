// Medical cluster (2026-11-16, Raheel: "create a dedicated medical page —
// multiple actually. use IGBT/SCR too → custom order option. but servo → we
// need to come across as specialists. we use pure copper. we handle high
// voltage issue — not a lot of stabilizers do").
//
// One hub (/medical) + one page per equipment type (/medical/[slug]).
// Every spec quoted here must match lib/products.ts and llms.txt:
//   servo 220V ±1%, input up to 270–280V, 10 kVA 100–280V, 30 kVA from 60V,
//   ~28–30 V/second correction, high/low cutoff + time-delay restart, 1-year warranty.
//   IGBT (custom order): 220V ±2% from 90–310V, 0 ms rated, pure sine THD < 3%.
//   SCR  (custom order): 220V ±5% from 95–250V, ~20 ms.
// Do NOT claim "medical-grade", IEC 60601 or isolation-transformer compliance —
// Voltec holds no such certificate.
// Origin (Raheel, 2026-11-16, final): VOLTEC = "manufacturer and importer". That's the only origin line.
// Never "assembled in Lahore" / "imported parts". Customers he named: Chughtai Labs +
// medical equipment importers (unnamed).

export type MedFaq = { q: string; a: string };
export type MedSetup = { title: string; kva: string; points: string[]; href?: string };

export type MedicalPage = {
  slug: string;
  nav: string; // short label for sibling links
  title: string; // <title>
  description: string; // meta description
  eyebrow: string;
  h1: string;
  lede: string;
  equipment: string[];
  problemTitle: string;
  problem: string;
  setups: MedSetup[];
  notes?: string[]; // honest scope notes
  faqs: MedFaq[];
  waMessage: string;
};

// The specialist points every medical page repeats — the servo line as it is sold today.
export const SERVO_STRENGTHS: { t: string; d: string }[] = [
  {
    t: "Cuts HIGH voltage, not only low",
    d: "When power returns after load-shedding the line can jump to 260–280V. A Voltec servo brings it back down to 220V — and cuts off above its limit — instead of only boosting low voltage.",
  },
  {
    t: "Steady 220V ±1%",
    d: "A servo motor moves a carbon-brush slider across the autotransformer, so correction is smooth and stepless — no relay clicks, no stepped jumps reaching your machine.",
  },
  {
    t: "Pure copper windings",
    d: "Copper autotransformer and coils, no aluminium — they run cooler under the long, continuous load of a busy clinic day.",
  },
  {
    t: "Works on weak lines too",
    d: "10 kVA units hold 220V from 100V or 140V input (you choose the range); our 30 kVA model starts working at 60V.",
  },
  {
    t: "Protection built in",
    d: "High- and low-voltage cutoff, overload protection and a time-delay restart, so a surge when the grid comes back never reaches the machine.",
  },
  {
    t: "VOLTEC — manufacturer and importer",
    d: "VOLTEC is a manufacturer and importer of voltage stabilizers. Every unit is tested before dispatch and serviced by our own team. 1-year warranty. Since 1995.",
  },
  {
    t: "Trusted by labs and equipment importers",
    d: "Chughtai Labs and medical equipment importers — the companies that sell and install clinic machines — buy VOLTEC stabilizers from us.",
  },
];

export const SOLID_STATE = {
  title: "Need solid-state? IGBT and SCR on custom order",
  body: "For the most sensitive electronics, or a load that needs the fastest possible correction, we supply solid-state stabilizers on custom order. Tell us the machine and we quote the specification, price and lead time in writing.",
  options: [
    {
      name: "Inverter (IGBT)",
      points: ["220V ±2% from a 90–310V input", "0 ms rated response, pure sine (THD under 3%)", "No motor or brush — nothing to wear"],
    },
    {
      name: "SCR (thyristor)",
      points: ["220V ±5% from a 95–250V input", "About 20 ms response", "Lower-cost solid-state option"],
    },
  ],
};

const WA = (machine: string) =>
  `Hi Voltec! Mujhe ${machine} ke liye stabilizer chahiye. Machine model: ___ Sheher: ___`;

export const MEDICAL_PAGES: MedicalPage[] = [
  {
    slug: "laser-machines",
    nav: "Laser machines",
    title: "Voltage Stabilizer for Laser Machines in Pakistan — Servo, Pure Copper",
    description:
      "Servo motor stabilizers for diode, IPL, Nd:YAG and CO₂ laser machines. Steady 220V ±1%, cuts high voltage up to 280V, pure copper. 10 kVA for one laser room. Lahore, nationwide delivery.",
    eyebrow: "Aesthetic & dermatology lasers",
    h1: "Voltage stabilizer for laser machines",
    lede: "A laser machine costs lakhs and earns every day it runs. One voltage swing — low in the evening, a spike when power returns after load-shedding — can stop a session or damage its power boards. A Voltec servo motor stabilizer keeps it on a steady 220V.",
    equipment: [
      "Diode hair-removal lasers",
      "IPL / SHR platforms",
      "Nd:YAG and Q-switched / picosecond tattoo lasers",
      "Fractional CO₂ lasers",
      "HIFU and RF aesthetic devices",
      "Cryolipolysis and body-contouring machines",
    ],
    problemTitle: "Why laser clinics lose machines to voltage",
    problem:
      "Most laser machines are imported and built for a clean, stable supply. In Pakistan the same clinic can see 170V at peak hours and 270V when the grid comes back. Low voltage makes the machine error out mid-session; high voltage is what burns power boards and cooling circuits. A stabilizer that only boosts low voltage leaves you exposed to the second problem.",
    setups: [
      { title: "One laser room", kva: "10 kVA servo", points: ["Our most-ordered size for laser rooms", "One laser plus room AC and lights", "Input from 100V or 140V — choose your range"], href: "/products/vt-svc-10k" },
      { title: "Two machines or a full clinic", kva: "15–20 kVA servo", points: ["Two lasers, or laser + AC + reception", "Single-phase; 20 kVA also in 3-phase"], href: "/products/vt-svc-15k" },
      { title: "Very weak line", kva: "30 kVA (from 60V)", points: ["For areas where voltage drops below 100V", "Single-phase, 100% pure copper"], href: "/products/vt-svc-30k-60v" },
    ],
    notes: [
      "Sell or import laser machines? Bundle protection with every machine you install — ask for our dealer rate on WhatsApp.",
    ],
    faqs: [
      { q: "What size stabilizer do I need for a laser machine?", a: "Check the machine's nameplate for its power in kVA or watts (watts ÷ 0.8 gives kVA), add 25%, and add anything else on the same supply, such as the room AC. For a single laser room most clinics use a 10 kVA servo stabilizer. Send us the model and we will size it for you." },
      { q: "Is a servo stabilizer fast enough for a laser?", a: "For the voltage swings a Pakistani clinic actually sees — slow sags in the evening and the jump when power returns — yes. A Voltec servo corrects at about 28–30 volts per second and holds 220V ±1%, and its cutoff disconnects the machine if voltage goes beyond the safe range. If your machine maker asks for solid-state protection, we supply IGBT and SCR stabilizers on custom order." },
      { q: "Does it protect against high voltage?", a: "Yes. Voltec servo stabilizers bring high input — up to about 270–280V depending on the model — back down to 220V, and cut off above their limit. They do not only boost low voltage." },
      { q: "Are the windings copper?", a: "Yes, copper windings and autotransformer. Our 30 kVA model is 100% pure copper with no aluminium." },
      { q: "What warranty do I get?", a: "One year on all Voltec stabilizers, with service from our own team in Lahore." },
    ],
    waMessage: WA("laser machine"),
  },
  {
    slug: "ultrasound-x-ray",
    nav: "Ultrasound & X-ray",
    title: "Stabilizer for Ultrasound & X-Ray Machines in Pakistan — Servo Specialists",
    description:
      "Servo motor stabilizers for ultrasound, digital X-ray, CR/DR and OPG units. Steady 220V ±1%, high and low voltage protection, pure copper windings. Sized to your machine by Voltec, Lahore.",
    eyebrow: "Diagnostic imaging",
    h1: "Stabilizer for ultrasound and X-ray machines",
    lede: "Ultrasound and X-ray machines are expensive to repair and slow to replace. A steady 220V supply protects their power supplies and keeps scans running through the evening sag and the surge after load-shedding.",
    equipment: [
      "Ultrasound and colour Doppler machines",
      "Digital / DR and CR X-ray systems",
      "Dental X-ray and OPG units",
      "ECG, patient monitors and workstations",
      "Image printers and reporting PCs",
    ],
    problemTitle: "What makes imaging rooms different",
    problem:
      "An ultrasound machine draws a modest, steady load and mainly needs clean, stable voltage. An X-ray generator is different: it pulls a large burst of current at the moment of exposure. The stabilizer and the wiring feeding it must be sized for that burst, not only for the machine's idle rating — so always tell us the generator's kW rating.",
    setups: [
      { title: "Ultrasound room", kva: "3–5 kVA servo", points: ["Ultrasound + monitor + printer", "Smooth, stepless correction"], href: "/products?range=svc" },
      { title: "Clinic with X-ray", kva: "10–15 kVA servo", points: ["Sized for the X-ray exposure burst", "Tell us the generator kW"], href: "/products/vt-svc-10k" },
      { title: "Diagnostic centre", kva: "20 kVA to 50 kVA 3-phase", points: ["Whole floor or several rooms", "3-phase SJW servo, per-phase correction"], href: "/products/vt-ind-50k" },
    ],
    notes: [
      "CT and MRI scanners use power conditioning specified by the scanner maker. We will tell you that honestly rather than sell you the wrong unit.",
    ],
    faqs: [
      { q: "What size stabilizer for an ultrasound machine?", a: "Most single ultrasound rooms run comfortably on a 3–5 kVA servo stabilizer, including the monitor and printer. Send us the model and we will confirm." },
      { q: "Can a stabilizer handle an X-ray machine?", a: "Yes, if it is sized for the exposure. X-ray generators draw a large burst of current when they fire, so we size from the generator's kW rating, not the standby load. Send us the generator rating and we will recommend the size." },
      { q: "Do you protect CT or MRI?", a: "No. Large CT and MRI systems use power conditioning specified by the scanner manufacturer. We protect ultrasound, X-ray, OPG and the other single-phase and smaller three-phase equipment in a diagnostic centre." },
      { q: "Does the stabilizer handle high voltage?", a: "Yes. It brings high input back down to 220V and cuts off above its limit, as well as boosting low voltage." },
    ],
    waMessage: WA("ultrasound / X-ray"),
  },
  {
    slug: "dental-clinics",
    nav: "Dental clinics",
    title: "Voltage Stabilizer for Dental Clinics in Pakistan — Chair, Compressor, X-Ray",
    description:
      "Protect dental chairs, compressors, autoclaves, OPG and intraoral scanners with a Voltec servo motor stabilizer. Steady 220V ±1%, high voltage cutoff, pure copper. 10–15 kVA for a whole clinic.",
    eyebrow: "Dental clinics",
    h1: "Voltage stabilizer for dental clinics",
    lede: "A dental clinic runs motors, heaters and electronics on one supply — the chair, the compressor, the autoclave and the X-ray. One Voltec servo stabilizer on the clinic's main line keeps all of them on a steady 220V.",
    equipment: [
      "Dental chairs and delivery units",
      "Air compressors and suction",
      "Autoclaves and sterilizers",
      "Dental X-ray and OPG",
      "Intraoral scanners, CAD/CAM and dental lasers",
    ],
    problemTitle: "One clinic, many kinds of load",
    problem:
      "Compressors and suction motors pull a surge each time they start, the autoclave heater draws steadily, and the electronics in the chair and scanner want clean voltage. Sizing the stabilizer for the whole clinic — with room for the motor starts — protects everything at once.",
    setups: [
      { title: "One or two chairs", kva: "10 kVA servo", points: ["Chair, compressor, autoclave, lights", "Input from 100V or 140V"], href: "/products/vt-svc-10k" },
      { title: "Clinic with OPG", kva: "15–20 kVA servo", points: ["Extra headroom for the X-ray", "20 kVA also in 3-phase"], href: "/products/vt-svc-15k" },
    ],
    faqs: [
      { q: "What size stabilizer for a dental clinic?", a: "A clinic with one or two chairs, a compressor and an autoclave usually needs a 10 kVA servo stabilizer. Add an OPG or more chairs and 15–20 kVA is the right range. Send us your equipment list and we will size it." },
      { q: "Will it handle the compressor starting?", a: "Yes — we size with headroom for motor starts. A servo stabilizer corrects smoothly and does not drop out when the compressor kicks in." },
      { q: "Does it protect against high voltage?", a: "Yes. It brings high voltage back down to 220V and cuts off above its limit, as well as boosting low voltage." },
    ],
    waMessage: WA("dental clinic"),
  },
  {
    slug: "laboratory-hospital",
    nav: "Labs & hospitals",
    title: "Voltage Stabilizer for Laboratories & Hospitals in Pakistan — 1 to 50 kVA",
    description:
      "Servo stabilizers for lab analysers, centrifuges, incubators and hospital wings — single-phase 1–30 kVA and 3-phase 50 kVA SJW. High and low voltage protection, pure copper, tender documentation.",
    eyebrow: "Laboratories & hospitals",
    h1: "Voltage stabilizer for laboratories and hospitals",
    lede: "Lab analysers, centrifuges, incubators and lab refrigerators need a stable supply to give reliable results and to last. Voltec supplies single-phase servo stabilizers for single machines and 3-phase servo systems for whole floors and hospital wings.",
    equipment: [
      "Chemistry, haematology and immunoassay analysers",
      "Centrifuges, incubators and water baths",
      "Lab and vaccine refrigerators",
      "Hospital wards, OPD blocks and admin floors",
      "Pharmacy cold storage",
    ],
    problemTitle: "Bench machine or the whole building",
    problem:
      "A single analyser needs a small, clean single-phase supply. A hospital wing needs every phase corrected on its own, with phase-failure protection. Voltec covers both: single-phase servo stabilizers from 1 kVA, and 3-phase SJW servo stabilizers that correct each phase independently.",
    setups: [
      { title: "One analyser or bench", kva: "1–5 kVA servo", points: ["Analyser + PC + printer", "Steady 220V ±1%"], href: "/products?range=svc" },
      { title: "Whole laboratory", kva: "10–20 kVA servo", points: ["All benches on one unit", "Single-phase; 20 kVA also 3-phase"], href: "/products/vt-svc-10k" },
      { title: "Hospital wing or floor", kva: "50 kVA 3-phase SJW", points: ["Per-phase correction, phase-failure cutoff", "Larger 3-phase units on order"], href: "/products/vt-ind-50k" },
    ],
    notes: [
      "Hospital and government tenders: we provide quotations, specification sheets and documentation. See our industrial and tenders page.",
    ],
    faqs: [
      { q: "What stabilizer does a laboratory analyser need?", a: "Most single analysers need 1–5 kVA. Check the nameplate rating, add the PC and printer, and add 25%. Send us the model and we will size it." },
      { q: "Do you supply 3-phase stabilizers for hospitals?", a: "Yes. Our 3-phase SJW servo stabilizer corrects each phase separately and cuts off on phase failure. The 50 kVA is available, and larger 3-phase units are supplied on order." },
      { q: "Can you handle a hospital tender?", a: "Yes. We provide written quotations, specification sheets and the documentation tenders ask for." },
    ],
    waMessage: WA("laboratory / hospital"),
  },
  {
    slug: "igbt-scr-custom-order",
    nav: "IGBT & SCR (custom order)",
    title: "IGBT & SCR Solid-State Stabilizers for Medical Equipment — Custom Order",
    description:
      "Solid-state IGBT and SCR voltage stabilizers for sensitive medical and laser equipment, supplied on custom order by Voltec. IGBT 220V ±2%, 90–310V, pure sine. Tell us the machine — we quote spec, price and lead time.",
    eyebrow: "Solid-state · custom order",
    h1: "IGBT and SCR stabilizers for medical equipment — on custom order",
    lede: "For the most sensitive electronics, or when an equipment maker asks for solid-state protection, Voltec supplies IGBT and SCR stabilizers on custom order. Tell us the machine and the supply, and we quote the specification, price and lead time in writing.",
    equipment: [
      "Sensitive diagnostic and lab electronics",
      "Laser platforms whose maker specifies solid-state protection",
      "Equipment on very weak lines (IGBT works from 90V)",
      "Rooms where silent, maintenance-free operation matters",
    ],
    problemTitle: "Servo or solid-state?",
    problem:
      "For most clinics a servo stabilizer is the right, proven choice — steady 220V ±1%, high and low voltage protection, and easy to service. Solid-state stabilizers have no motor or brush and correct electronically, which suits the most sensitive loads and the fastest disturbances. We will tell you honestly which one your machine needs.",
    setups: [
      { title: "Inverter (IGBT)", kva: "Custom order", points: ["220V ±2% from 90–310V", "0 ms rated, pure sine, THD under 3%"] },
      { title: "SCR (thyristor)", kva: "Custom order", points: ["220V ±5% from 95–250V", "About 20 ms response"] },
      { title: "Servo — available now", kva: "1–50 kVA", points: ["220V ±1%, cuts high voltage", "Pure copper, 1-year warranty"], href: "/medical/laser-machines" },
    ],
    faqs: [
      { q: "How do I order an IGBT or SCR stabilizer?", a: "Message us on WhatsApp with the machine model, its power rating and your city, or fill in the custom order form. We reply with the specification, price and lead time in writing." },
      { q: "Is solid-state better than servo for a clinic?", a: "Not always. A servo stabilizer gives 220V ±1% and handles both high and low voltage, and suits most clinic equipment. Solid-state is for the most sensitive electronics or when the equipment maker specifies it. We recommend whichever your machine actually needs." },
      { q: "What warranty do custom-order units have?", a: "All Voltec stabilizers carry a one-year warranty." },
    ],
    waMessage: "Hi Voltec! IGBT / SCR stabilizer custom order chahiye. Machine model: ___ Power (kVA/watt): ___ Sheher: ___",
  },
];

export const getMedicalPage = (slug: string) => MEDICAL_PAGES.find((p) => p.slug === slug);
