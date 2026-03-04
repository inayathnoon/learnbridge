import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import WalkthroughViewer from "./walkthrough-viewer";

export default async function SubsectionPage({
  params,
}: {
  params: { topicSlug: string; subsectionSlug: string };
}) {
  const supabase = createClient();

  const { data: subsection } = await supabase
    .from("subsections")
    .select(
      "id, title, slug, walkthrough_steps, coaching_guide, topic_id, topics(title, slug)"
    )
    .eq("slug", params.subsectionSlug)
    .single();

  if (!subsection) notFound();

  const { data: questions } = await supabase
    .from("questions")
    .select("id, level, content, options, correct_answer, explanation")
    .eq("subsection_id", subsection.id)
    .order("level");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: family } = await supabase
    .from("families")
    .select("id")
    .eq("auth_user_id", user!.id)
    .single();

  return (
    <div className="min-h-screen bg-gray-50">
      <WalkthroughViewer
        subsection={subsection}
        questions={questions ?? []}
        familyId={family!.id}
      />
    </div>
  );
}
