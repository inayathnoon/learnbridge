import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function getClient() {
  const cookieStore = cookies();
  return createServerClient(
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
}

export type Family = {
  id: string;
  email: string;
  whatsapp_number: string;
  whatsapp_verified: boolean;
  child_name: string;
  created_at: string;
};

export async function getFamilyByWhatsapp(
  whatsappNumber: string
): Promise<Family | null> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("families")
    .select("*")
    .eq("whatsapp_number", whatsappNumber)
    .single();

  if (error || !data) return null;
  return data;
}

export async function markWhatsappVerified(familyId: string): Promise<void> {
  const supabase = getClient();
  const { error } = await supabase
    .from("families")
    .update({ whatsapp_verified: true })
    .eq("id", familyId);

  if (error) throw error;
}

export async function createFamily(params: {
  userId: string;
  email: string;
  whatsappNumber: string;
  childName: string;
}): Promise<void> {
  const supabase = getClient();
  const { error } = await supabase.from("families").insert({
    id: params.userId,
    email: params.email,
    whatsapp_number: params.whatsappNumber,
    whatsapp_verified: false,
    child_name: params.childName,
  });

  if (error) throw error;
}
