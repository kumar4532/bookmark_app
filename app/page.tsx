import GoogleAuth from "@/components/auth/GoogleAuth";
import { createClient } from "@/utils/supabase/server";

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
        <div className="absolute pt-52 w-full flex justify-center items-center">
          <GoogleAuth user={user} />
        </div>
      </div>
    </>
  );
}
