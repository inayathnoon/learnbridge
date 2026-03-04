"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function signup(formData: FormData) {
  const supabase = createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const whatsappNumber = formData.get("whatsapp_number") as string;
  const childName = formData.get("child_name") as string;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  if (data.user) {
    // Create family record
    const { error: familyError } = await supabase.from("families").insert({
      auth_user_id: data.user.id,
      email,
      whatsapp_number: whatsappNumber,
      child_name: childName,
    });

    if (familyError) {
      return redirect(
        `/signup?error=${encodeURIComponent(familyError.message)}`
      );
    }
  }

  redirect("/learn");
}
