import GoogleLoginDemo from "@/components/auth/GoogleAuth";
import { createClient } from "@/utils/supabase/server";

export default async function GoogleLoginPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="h-screen flex items-center justify-center">
      <GoogleLoginDemo user={user} />
    </div>
  );
}