"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

function getSupabase() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = getSupabase();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/learn");
}

export async function logout() {
  const supabase = getSupabase();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function signup(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const childName = formData.get("childName") as string;
  const whatsappNumber = formData.get("whatsappNumber") as string;

  const supabase = getSupabase();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${appUrl}/auth/callback` },
  });

  if (error || !data.user) {
    redirect(
      `/signup?error=${encodeURIComponent(error?.message ?? "Signup failed")}`
    );
  }

  const { createFamily } = await import("@/lib/db/families");
  await createFamily({
    userId: data.user!.id,
    email,
    whatsappNumber,
    childName,
  }).catch(() => {});

  const { sendWhatsAppTemplate } = await import(
    "@/features/alerts/send-whatsapp"
  );
  await sendWhatsAppTemplate({
    to: whatsappNumber,
    templateName:
      process.env.META_WHATSAPP_VERIFY_TEMPLATE_NAME ??
      "learnbridge_verify_number",
  }).catch(() => {});

  redirect("/login?message=Check+your+WhatsApp+to+verify+your+number");
}
