import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id || id.includes("..") || id.includes("/") || id.includes("\\")) {
    return new NextResponse("invalid", { status: 400 });
  }

  const filename = new URL(req.url).searchParams.get("file");
  if (!filename || filename.includes("..") || filename.includes("/")) {
    return new NextResponse("invalid", { status: 400 });
  }

  const dataDir = process.env.DATA_DIR || path.join(process.cwd(), "data");
  const filePath = path.join(dataDir, "photos", id, filename);

  if (!fs.existsSync(filePath)) {
    return new NextResponse("not found", { status: 404 });
  }

  const ext = filename.split(".").pop()?.toLowerCase();
  const mime: Record<string, string> = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", avif: "image/avif" };
  const buf = fs.readFileSync(filePath);
  return new NextResponse(buf, {
    headers: { "Content-Type": mime[ext || ""] || "application/octet-stream", "Cache-Control": "public, max-age=86400" },
  });
}
