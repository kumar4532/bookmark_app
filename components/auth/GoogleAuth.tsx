"use client";

import toast from "react-hot-toast";
import { FcGoogle } from "react-icons/fc";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/utils/supabase/browser-client";

type GoogleLoginProps = {
  user: User | null;
};

export default function GoogleLogin({ user }: GoogleLoginProps) {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const [currentUser, setCurrentUser] = useState<User | null>(user);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/home`,
      },
    });

    setIsSubmitting(false);

    if (error) {
      toast.error("Failed to start Google login");
      return;
    }

    toast.success("Redirecting to Google...", { icon: "🔐" });
  };

  useEffect(() => {
    if (currentUser) {
      router.replace("/home");
    }
  }, [currentUser, router]);

  return (
    <section className="w-full max-w-xl rounded-2xl border border-slate-700 bg-[#FFF2E0] p-8 text-slate-100 shadow-2xl shadow-slate-950/50">
      <div className="flex items-center gap-4">
        <FcGoogle className="h-10 w-10" />
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-800">OAuth</p>
          <h1 className="text-2xl font-semibold text-black">Login To Bookies</h1>
        </div>
      </div>

      <p className="mt-5 text-sm text-slate-800">
        Sign in to create your private bookmark list.
      </p>

      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={isSubmitting}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#1a73e8] px-4 py-2.5 text-base font-semibold text-white shadow-lg shadow-blue-900/40 transition hover:bg-[#1662c4] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Redirecting..." : "Continue with Google"}
      </button>
    </section>
  );
}
