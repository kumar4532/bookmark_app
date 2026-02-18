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
    <>
      <div className="min-h-screen w-full bg-[#020617] relative">
        {/* Dark Radial Glow Background */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `radial-gradient(circle 500px at 50% 200px, #3e3e3e, transparent)`,
          }}
        />
        {/* Your Content/Components */}
        <div className="absolute pt-10 w-full flex justify-center items-center">
          <BookmarkDashboard user={user} />
        </div>
      </div>
    </>
  );
}
