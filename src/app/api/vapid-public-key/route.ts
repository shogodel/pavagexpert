import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  let publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  if (!publicKey) {
    try {
      const p = path.join(process.env.DATA_DIR || "/data", "vapid-keys.json");
      if (fs.existsSync(p)) {
        const json = JSON.parse(fs.readFileSync(p, "utf-8"));
        publicKey = json.publicKey;
      }
    } catch {
      // ignore
    }
  }

  if (!publicKey) {
    return NextResponse.json({ error: "VAPID not configured" }, { status: 500 });
  }

  return NextResponse.json({ publicKey });
}
