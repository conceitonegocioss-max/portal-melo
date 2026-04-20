import { NextResponse } from "next/server";
import { clearLoginLog, listLoginLog } from "@/src/lib/auditlogin";

export async function GET() {
  try {
    const items = await listLoginLog();
    return NextResponse.json({ ok: true, items });
  } catch {
    return NextResponse.json({ ok: false, items: [] }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await clearLoginLog();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
