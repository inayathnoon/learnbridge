import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = createClient();
  const { familyId, sessionId, subsectionId } = await request.json();

  // Look up family and subsection details
  const [{ data: family }, { data: subsection }] = await Promise.all([
    supabase
      .from("families")
      .select("child_name, whatsapp_number, whatsapp_verified")
      .eq("id", familyId)
      .single(),
    supabase
      .from("subsections")
      .select("title, coaching_guide")
      .eq("id", subsectionId)
      .single(),
  ]);

  if (!family || !subsection) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Log the alert
  await supabase.from("alerts_sent").insert({
    family_id: familyId,
    session_id: sessionId,
    subsection_id: subsectionId,
  });

  // TODO: Send actual WhatsApp message via Meta Cloud API
  // For now, just log it
  console.log(
    `[ALERT] ${family.child_name} is stuck on "${subsection.title}". ` +
    `WhatsApp: ${family.whatsapp_number}. ` +
    `Coaching guide: ${subsection.coaching_guide}`
  );

  return NextResponse.json({ sent: true });
}
