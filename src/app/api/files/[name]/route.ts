import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { requireSession, handler } from "@/lib/auth";

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? "./uploads";
const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".heic": "image/heic",
  ".pdf": "application/pdf",
};

type Ctx = { params: Promise<{ name: string }> };

export const GET = handler(async (_req: Request, { params }: Ctx) => {
  await requireSession();
  const { name } = await params;

  // Prevent path traversal — serve only plain filenames from the upload dir.
  const safe = path.basename(name);
  if (safe !== name) {
    return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
  }

  try {
    const buf = await readFile(path.resolve(UPLOAD_DIR, safe));
    const type = MIME[path.extname(safe).toLowerCase()] ?? "application/octet-stream";
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        "Content-Type": type,
        "Cache-Control": "private, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
});
