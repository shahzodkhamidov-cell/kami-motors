import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import sharp from "sharp";

const BUCKET = "car-images";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();

  const single = formData.get("file") as File | null;
  const multiple = formData.getAll("files") as File[];
  const files = single ? [single] : multiple;

  if (!files.length) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const urls: string[] = [];

  for (const file of files) {
    if (!file.type.startsWith("image/")) continue;

    const bytes = await file.arrayBuffer();

    // Compress: resize to max 1400px, convert to WebP at quality 78
    const compressed = await sharp(Buffer.from(bytes))
      .resize({ width: 1400, withoutEnlargement: true })
      .webp({ quality: 78 })
      .toBuffer();

    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.webp`;

    const { error } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(filename, compressed, {
        contentType: "image/webp",
        upsert: false,
      });

    if (!error) {
      const { data: urlData } = supabaseAdmin.storage
        .from(BUCKET)
        .getPublicUrl(filename);
      urls.push(urlData.publicUrl);
    }
  }

  if (!urls.length) {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }

  return NextResponse.json({ url: urls[0], urls });
}
