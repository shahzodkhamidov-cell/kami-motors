import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

const BUCKET = "car-images";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();

  // Support both single file ("file") and multiple files ("files")
  const single = formData.get("file") as File | null;
  const multiple = formData.getAll("files") as File[];
  const files = single ? [single] : multiple;

  if (!files.length) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // Ensure bucket exists
  const { data: buckets } = await supabaseAdmin.storage.listBuckets();
  if (!buckets?.find((b) => b.name === BUCKET)) {
    await supabaseAdmin.storage.createBucket(BUCKET, { public: true });
  }

  const urls: string[] = [];

  for (const file of files) {
    if (!file.type.startsWith("image/")) continue;
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const bytes = await file.arrayBuffer();

    const { error } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(filename, bytes, {
        contentType: file.type || "image/jpeg",
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
