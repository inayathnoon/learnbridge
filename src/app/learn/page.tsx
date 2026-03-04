import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getLastVisitedSubsection } from "@/lib/db/sessions";

export default async function LearnIndexPage() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Resume last-visited subsection if available
  const lastVisited = await getLastVisitedSubsection(user.id);
  if (lastVisited) {
    redirect(`/learn/${lastVisited.topic_slug}/${lastVisited.subsection_slug}`);
  }

  // No prior session — fetch first subsection and redirect there
  const { data: firstSubsection } = await supabase
    .from("subsections")
    .select("slug, topics(slug)")
    .order("order", { ascending: true })
    .limit(1)
    .single();

  if (firstSubsection) {
    const topicSlug = (firstSubsection.topics as unknown as { slug: string })
      ?.slug;
    if (topicSlug) {
      redirect(`/learn/${topicSlug}/${firstSubsection.slug}`);
    }
  }

  // Fallback: no content seeded yet
  return (
    <main>
      <p>No content available yet.</p>
    </main>
  );
}
