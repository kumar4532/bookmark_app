import BookmarkDashboard from "@/components/bookmarks/BookmarkDashboard";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 sm:px-6">
      <div className="mx-auto flex max-w-5xl justify-center">
        <BookmarkDashboard user={user} />
      </div>
    </main>
  );
}
