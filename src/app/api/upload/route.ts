import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();

  // Support both single file (field "file") and multiple files (field "files")
  const single = formData.get("file") as File | null;
  const multiple = formData.getAll("files") as File[];
  const files = single ? [single] : multiple;

  if (!files.length) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const uploadDir = join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });

  const urls: string[] = [];

  for (const file of files) {
    if (!file.type.startsWith("image/")) continue;
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const filename = `${randomUUID()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(join(uploadDir, filename), buffer);
    urls.push(`/uploads/${filename}`);
  }

  if (!urls.length) return NextResponse.json({ error: "No valid images" }, { status: 400 });

  // Return { url } for single-file callers, { urls } for multi-file callers
  return NextResponse.json({ url: urls[0], urls });
}
