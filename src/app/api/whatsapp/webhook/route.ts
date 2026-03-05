import { NextRequest, NextResponse } from "next/server";
import { getFamilyByWhatsapp, markWhatsappVerified } from "@/lib/db/families";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (
    mode === "subscribe" &&
    token === process.env.META_WHATSAPP_WEBHOOK_VERIFY_TOKEN
  ) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ ok: true });

  const entry = body?.entry?.[0];
  const changes = entry?.changes?.[0];
  const value = changes?.value;
  const messages = value?.messages;

  if (!messages?.length) return NextResponse.json({ ok: true });

  const message = messages[0];
  const from: string = message?.from ?? "";
  const text: string = message?.text?.body ?? "";

  if (text.trim().toUpperCase() === "YES" && from) {
    const family = await getFamilyByWhatsapp(from).catch(() => null);
    if (family && !family.whatsapp_verified) {
      await markWhatsappVerified(family.id).catch(() => {});
    }
  }

  return NextResponse.json({ ok: true });
}
