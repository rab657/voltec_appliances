// Adds the September 2026 update note to /blog/genuine-eve-cells-check-pakistan.
//
// WHY: that post's whole method is "count the characters in the QR code". The new
// post (eve-cells-original-test-report) says the QR is no longer proof on its own,
// because re-lasering a code is a cheap trade service. Left alone, the two posts
// contradict each other and the older one — which ranks (~100 impressions/week,
// position 4.9) — keeps giving advice we have publicly superseded.
//
// The note demotes the QR checks to a first pass rather than deleting them; they
// still catch careless fakes. Idempotent: re-running it changes nothing.
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n")
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, "")];
    }),
) as Record<string, string>;

const SLUG = "genuine-eve-cells-check-pakistan";
const NEW = "/blog/eve-cells-original-test-report";

const NOTE = `<div class="callout"><div class="c-label">Update — September 2026</div><div>A scannable QR code is no longer proof on its own. Re-lasering a code has become a cheap, routine service in the trade, so a used or downgraded cell can carry a code that scans perfectly. The checks below still catch careless fakes and are worth doing, but treat them as a first pass. The document that actually holds up is the batch test report — we explain how to ask for one and how to read it in <a href="${NEW}">how to tell EVE cells are original</a>.</div></div>`;

const TAIL_LINK = ` Before you pay for any batch, also ask for its <a href="${NEW}">test report</a>.`;

const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const { data, error } = await sb.from("posts").select("id,body").eq("slug", SLUG).single();
if (error || !data) {
  console.error("Could not read the post:", error);
  process.exit(1);
}

let body: string = data.body;
if (body.includes(NEW)) {
  console.log("Already cross-linked — nothing to do.");
  process.exit(0);
}

// Anchor on the sentence that introduces the checks, so the note lands above them.
const ANCHOR = "<h2>1. Count the characters in the QR code</h2>";
if (!body.includes(ANCHOR)) {
  console.error(`Anchor not found: ${ANCHOR}`);
  process.exit(1);
}
body = body.replace(ANCHOR, `${NOTE}\n\n${ANCHOR}`);

// And a pointer in the closing paragraph, where the other related links already are.
body = body.replace(
  /(<a href="\/blog\/authorized-eve-distributor-pakistan">here<\/a>\.)/,
  `$1${TAIL_LINK}`,
);

if (process.argv.includes("--dry")) {
  console.log(body.slice(0, 1400));
  console.log("\n…\n");
  console.log(body.slice(-800));
  console.log("\nDRY RUN — nothing written.");
  process.exit(0);
}

const { error: upErr } = await sb.from("posts").update({ body }).eq("id", data.id);
if (upErr) {
  console.error("UPDATE ERROR:", upErr);
  process.exit(1);
}
console.log(`Patched /blog/${SLUG} — update note + 2 links to ${NEW}.`);
