# Voltec 30kVA SVC "Ultra Low Voltage" (60V) — Post & Ad Copy (2026-08-21)

Product page: `/products/vt-svc-30k-60v` — **Rs 225,000** online price (visible on site).
Creative: `creatives/out/svc60-30kva-square.png` (1024×1024).
Videos on the product page: `public/assets/svc-60v/svc60-demo-{lowvolt,range,copper}.mp4`.

Voice: Roman-Urdu, problem-first. Hook = **"Voltage 60V tak gir jaye — machine phir bhi chale."**
The differentiator is the **60V floor**: an ordinary stabilizer cuts off below 150V.

**Two disqualifiers must stay in every version** — they save wasted WhatsApp threads:
1. **SINGLE PHASE, not 3-phase.** The 30kVA number pulls three-phase industrial enquiries.
2. **30kVA.** Not a home unit — people asking for one AC should go to the AVR/`/ac` line.

⚠️ **The creative's phone number is missing a digit** — it prints `0321164447` (10 digits).
The real line is `0321 1644447` / **`03211644447`** (11 digits). Fix before any post or boost.

⚠️ **Price rule:** no price on paid creative (standing rule, see `memory.md`) — the price lives on
the website and goes out on WhatsApp. The organic post below has a no-price version (default,
because organic posts get boosted later) and a with-price version.

Geo: Faisalabad · Karachi · Lahore · Peshawar · Swabi · Mardan · Gilgit · Skardu — anywhere the
line sags all day and the load is 30kVA single-phase. **Note:** this contradicts the Lahore
walk-in-only constraint from 2026-07-02. Raheel named these cities for this product on 2026-08-21,
so out-of-city is back ON for this SKU. Site-wide copy still says "Lahore delivery or showroom
pickup" on every product page — see the open item at the bottom.

---

## 1) FACEBOOK PAGE POST (organic) — default, no price

> Voltage 60V tak gir jaye — machine phir bhi chalti rahe gi. ⚡
>
> Faisalabad, Karachi, Lahore, Peshawar, Swabi, Mardan, Gilgit aur Skardu — jahan din bhar
> voltage low rehti hai, wahan aam stabilizer 150V se neeche band ho jata hai. Motor ruk jati
> hai, kaam ruk jata hai.
>
> Yeh 60V se kaam shuru karta hai.
>
> **VOLTEC 30kVA SVC — Ultra Low Voltage Stabilizer**
> ✅ Input 60V se 250V tak — output steady **220V**
> ✅ **100% PURE COPPER** winding aur autotransformer — koi aluminium nahi
> ✅ **30kVA SINGLE PHASE** — yeh 3-phase unit nahi hai
> ✅ Servo motor — smooth correction, motor aur compressor ke liye safe
> ✅ LED meter: input, output, load current, temperature
> ✅ High/low voltage cutoff, overload aur over-temperature protection
>
> Pakistan mein pehli baar. Factory, mill, workshop — jahan 30kVA single-phase load ho.
>
> Video mein khud dekh lein: input 60V, output 220V. 👇
>
> Apna load bata dein — hum size confirm kar ke rate bhej dete hain.
> 📱 WhatsApp: 0321 1644447
>
> Voltec Appliances — 1995 se

**First comment** (keeps the link out of the post so reach isn't throttled):
> Poori tafseel, videos aur specification yahan hain 👉 voltecappliances.com/products/vt-svc-30k-60v

## 1b) Same post, with the price

Swap the last two lines for:

> Online price: **Rs 225,000**. Delivery poore Pakistan mein — charges WhatsApp par confirm.
> 📱 WhatsApp: 0321 1644447

---

## 2) SHORT VERSION (for groups / a second post / IG caption)

> 60V par bhi 220V. ⚡
>
> Voltec **30kVA SVC Ultra Low Voltage** stabilizer — input 60V–250V, output steady 220V.
> **100% pure copper.** **Single phase** (3-phase nahi).
>
> Aam stabilizer 150V se neeche band. Yeh 60V se chalta hai.
> Faisalabad, Karachi, Peshawar, Mardan, Gilgit, Skardu — jahan voltage din bhar giri rehti hai.
>
> Load bata dein, rate bhej dete hain 📱 0321 1644447

---

## 3) CLICK-TO-WHATSAPP AD (paid — the only paid format we run)

Standing rule: `destination_type=WHATSAPP` + `promoted_object={page_id}` + CTA
`WHATSAPP_MESSAGE`. **Never** a plain boost — those "conversations" never reach the inbox.

**Primary text:**
> Aap ki factory ka voltage 60V tak gir jata hai? ⚡
> Aam stabilizer 150V se neeche band ho jata hai — machine ruk jati hai.
> Voltec **30kVA SVC** 60V se kaam shuru karta hai aur output **220V** steady rakhta hai.
> ✅ 100% pure copper winding — koi aluminium nahi
> ✅ **30kVA SINGLE PHASE** — yeh 3-phase unit nahi hai
> ✅ Servo motor · LED meter · overload & over-temp protection
> Sirf factory, mill aur workshop ke liye. Apna load aur sheher likh kar WhatsApp karein.

**Headline:** 60V par bhi 220V — 30kVA Single Phase
**Description:** 100% pure copper · Voltec, 1995 se
**CTA:** Send WhatsApp Message

**WhatsApp greeting** (set in Ads Manager — it is NOT settable on the creative, see `memory.md`):
> Assalam-o-Alaikum! 30kVA Single Phase Ultra Low Voltage stabilizer ke liye shukriya.
> Baraye meherbani likhein: (1) aap ka sheher (2) aap ka load — kitne kW / kitni machines
> (3) aap ke yahan voltage kam se kam kitni girti hai. Hum rate aur delivery confirm kar dete hain.

**Audience notes:** trade interests only — the "Hobbies and activities" topic is what filled the
cell campaign with DIY leads. Check `topic` before adding any interest
(`GET /{interest_id}?fields=name,topic`). Region keys: Punjab 2939 · KPK 2938 · Sindh 2940 ·
Gilgit-Baltistan 2942 · Islamabad 2943 (its own region, NOT inside Punjab).

---

## Claims — what is verified

| Claim | Source |
|---|---|
| Works from 60V, holds 220V | Raheel + on-camera: `svc60-demo-range.mp4` sweeps 61 → 98 → 170 → 215 → 260V, output 220V at every step |
| 64V in → 220V out @ 37A | `svc60-demo-lowvolt.mp4` front panel |
| 100% pure copper | Raheel; visible in `svc60-demo-copper.mp4` + `svc60-copper.webp` |
| 30kVA single-phase | Raheel + creative |
| TND-30 KVA, CE / ISO marks | Unit's own front panel |
| "First time in Pakistan" | Raheel's creative — his claim, not independently checked |

## Open items

- [ ] **Fix the phone digit on the creative** (`0321164447` → `03211644447`) before posting.
- [ ] Every product page still shows **"In stock · Lahore delivery or showroom pickup"**
      (i18n `cfg.instock`). It contradicts this product's nationwide pitch and the page's own
      "Delivery across Pakistan" trust row. Site-wide string — needs a decision, since the AC
      line is deliberately Lahore walk-in only.
- [ ] `/showcase/svc` spec-comparison table is capped at 6 columns in code order, so it shows
      1/3/5/7/10/15kVA and never reaches this model. Model cards below it do include it.
- [ ] A studio front photo exists (`~/Downloads/60V/main_image_voltec_logo.jpg`) but the unit in
      it carries the **SOLID®** OEM mark, not Voltec — not used. The gallery uses video frames of
      Voltec-branded units instead.
