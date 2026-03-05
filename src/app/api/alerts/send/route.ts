import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { sendWhatsAppTemplate } from "@/features/alerts/send-whatsapp";

export async function POST(request: NextRequest) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  // Verify auth
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const { sessionId, subsectionId } = body ?? {};
  if (!sessionId || !subsectionId) {
    return NextResponse.json(
      { error: "Missing sessionId or subsectionId" },
      { status: 400 }
    );
  }

  // Fetch family
  const { data: family } = await supabase
    .from("families")
    .select("id, whatsapp_number, child_name")
    .eq("id", user.id)
    .single();

  if (!family) {
    return NextResponse.json({ error: "Family not found" }, { status: 404 });
  }

  // Fetch subsection
  const { data: subsection } = await supabase
    .from("subsections")
    .select("title, coaching_guide")
    .eq("id", subsectionId)
    .single();

  if (!subsection) {
    return NextResponse.json(
      { error: "Subsection not found" },
      { status: 404 }
    );
  }

  const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/dashboard`;
  const templateName =
    process.env.META_WHATSAPP_STUCK_ALERT_TEMPLATE_NAME ??
    "learnbridge_stuck_alert";

  const result = await sendWhatsAppTemplate({
    to: family.whatsapp_number,
    templateName,
    components: [
      {
        type: "body",
        parameters: [
          { type: "text", text: family.child_name },
          { type: "text", text: subsection.title },
          { type: "text", text: subsection.coaching_guide ?? "" },
          { type: "text", text: dashboardUrl },
        ],
      },
    ],
  });

  // Record alert regardless of WhatsApp result
  await supabase.from("alerts_sent").insert({
    family_id: family.id,
    session_id: sessionId,
    subsection_id: subsectionId,
    sent_at: new Date().toISOString(),
    meta_message_id: result.success ? result.messageId : null,
  });

  return NextResponse.json({ ok: true });
}
