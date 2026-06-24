// Pure helpers for rendering post bodies: inject ids into <h2> headings for
// in-page anchors and extract a table of contents.

export interface Heading {
  id: string;
  label: string;
}

function slugify(txt: string): string {
  return txt
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function renderBody(body: string): { html: string; headings: Heading[] } {
  const html = body.replace(/<h2>([^<]+)<\/h2>/g, (_, txt) => `<h2 id="${slugify(txt)}">${txt}</h2>`);
  const headings: Heading[] = [];
  const re = /<h2 id="([^"]+)">([^<]+)<\/h2>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) headings.push({ id: m[1], label: m[2] });
  return { html, headings };
}
