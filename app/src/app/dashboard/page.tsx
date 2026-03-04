import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: family } = await supabase
    .from("families")
    .select("child_name")
    .eq("auth_user_id", user!.id)
    .single();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">
            {family?.child_name}&apos;s Progress
          </h1>
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Log out
            </button>
          </form>
        </div>
        <p className="text-gray-600">Progress dashboard coming soon.</p>
      </div>
    </div>
  );
}
