import { createClient } from "@supabase/supabase-js";
import seedData from "../content/seed.json";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log("Seeding database...");

  for (const topic of seedData.topics) {
    const { data: topicRow, error: topicErr } = await supabase
      .from("topics")
      .upsert({ title: topic.title, slug: topic.slug, order: topic.order }, { onConflict: "slug" })
      .select()
      .single();

    if (topicErr) {
      console.error("Failed to insert topic:", topicErr);
      continue;
    }
    console.log(`Topic: ${topicRow.title}`);

    for (const sub of topic.subsections) {
      const { data: subRow, error: subErr } = await supabase
        .from("subsections")
        .upsert(
          {
            topic_id: topicRow.id,
            title: sub.title,
            slug: sub.slug,
            order: sub.order,
            walkthrough_steps: sub.walkthrough_steps,
            coaching_guide: sub.coaching_guide,
          },
          { onConflict: "slug" }
        )
        .select()
        .single();

      if (subErr) {
        console.error("Failed to insert subsection:", subErr);
        continue;
      }
      console.log(`  Subsection: ${subRow.title}`);

      // Delete existing questions for this subsection then re-insert
      await supabase
        .from("questions")
        .delete()
        .eq("subsection_id", subRow.id);

      for (const q of sub.questions) {
        const { error: qErr } = await supabase.from("questions").insert({
          subsection_id: subRow.id,
          level: q.level,
          content: q.content,
          options: q.options,
          correct_answer: q.correct_answer,
          explanation: q.explanation,
        });

        if (qErr) {
          console.error(`  Failed to insert question L${q.level}:`, qErr);
        } else {
          console.log(`    Question L${q.level} inserted`);
        }
      }
    }
  }

  console.log("Seed complete!");
}

seed().catch(console.error);
