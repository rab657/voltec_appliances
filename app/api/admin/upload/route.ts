import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { cookies } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabase";
import { ADMIN_COOKIE, isValidSession } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BUCKET = "product-images";
const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

function safeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/^-+|-+$/g, "").slice(-60) || "image";
}

export async function POST(req: Request) {
  const jar = await cookies();
  if (!isValidSession(jar.get(ADMIN_COOKIE)?.value)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let file: File | null = null;
  let productId = "misc";
  try {
    const form = await req.formData();
    file = form.get("file") as File | null;
    const pid = form.get("productId");
    if (typeof pid === "string" && pid) productId = safeName(pid);
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "File too large (max 8 MB)" }, { status: 413 });
  if (!file.type.startsWith("image/")) return NextResponse.json({ error: "Images only" }, { status: 415 });

  const buf = Buffer.from(await file.arrayBuffer());
  const filename = `${Date.now().toString(36)}-${safeName(file.name)}`;
  const objectPath = `${productId}/${filename}`;

  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(objectPath, buf, { contentType: file.type, upsert: true });
    if (error) {
      return NextResponse.json(
        { error: `Storage upload failed: ${error.message}. Create a public bucket named "${BUCKET}".` },
        { status: 500 },
      );
    }
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(objectPath);
    return NextResponse.json({ url: data.publicUrl });
  }

  // Local-dev fallback only. On a serverless host the filesystem is ephemeral,
  // so a local save would vanish on the next deploy — refuse and surface why.
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      {
        error:
          'Image storage is not configured. Create a public Supabase bucket named "product-images" and set NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in the environment — otherwise uploads are lost on the next deploy.',
      },
      { status: 503 },
    );
  }
  try {
    const dir = path.join(process.cwd(), "public", "uploads", "products");
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, filename), buf);
    return NextResponse.json({ url: `/uploads/products/${filename}` });
  } catch (e) {
    return NextResponse.json({ error: `Local save failed: ${String(e)}` }, { status: 500 });
  }
}
