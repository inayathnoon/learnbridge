import { NextResponse } from "next/server";

export async function POST() {
  // Alert sending logic — implemented in alerts feature task
  return NextResponse.json({ ok: false, error: "Not implemented" }, { status: 501 });
}
