import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function LearnPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: family } = await supabase
    .from("families")
    .select("child_name")
    .eq("auth_user_id", user!.id)
    .single();

  const { data: topics } = await supabase
    .from("topics")
    .select("id, title, slug, subsections(id, title, slug, order)")
    .order("order");

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">
            Hi {family?.child_name ?? "there"}!
          </h1>
          <div className="flex gap-4 items-center">
            <Link href="/dashboard" className="text-sm text-blue-600 hover:underline">
              Dashboard
            </Link>
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Log out
              </button>
            </form>
          </div>
        </div>

        {topics && topics.length > 0 ? (
          <div className="space-y-6">
            {topics.map((topic) => (
              <div key={topic.id} className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-3">{topic.title}</h2>
                <ul className="space-y-2">
                  {topic.subsections
                    ?.sort((a: { order: number }, b: { order: number }) => a.order - b.order)
                    .map((sub: { id: string; title: string; slug: string }) => (
                      <li key={sub.id}>
                        <Link
                          href={`/learn/${topic.slug}/${sub.slug}`}
                          className="block px-4 py-3 rounded-md border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                        >
                          {sub.title}
                        </Link>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">
            No topics available yet. Check back soon!
          </p>
        )}
      </div>
    </div>
  );
}
