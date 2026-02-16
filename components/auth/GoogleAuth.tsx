"use client";

import { getSupabaseBrowserClient } from "@/utils/supabase/browser-client";
import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FcGoogle } from "react-icons/fc";

type GoogleLoginProps = {
  user: User | null;
};

export default function GoogleLogin({ user }: GoogleLoginProps) {
  const supabase = getSupabaseBrowserClient();
  const [currentUser, setCurrentUser] = useState<User | null>(user);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
    setErrorMessage(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/home`,
      },
    });

    setIsSubmitting(false);

    if (error) {
      setErrorMessage(error.message);
    }
  };

  const handleSignOut = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    const { error } = await supabase.auth.signOut();

    setIsSubmitting(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setCurrentUser(null);
  };

  if (!currentUser) {
    return (
      <section className="w-full max-w-xl rounded-2xl border border-slate-700 bg-slate-900 p-8 text-slate-100 shadow-2xl shadow-slate-950/50">
        <div className="flex items-center gap-4">
          <FcGoogle className="h-10 w-10" />
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">OAuth</p>
            <h1 className="text-2xl font-semibold text-white">Smart Bookmark App</h1>
          </div>
        </div>

        <p className="mt-5 text-sm text-slate-300">
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

        {errorMessage ? <p className="mt-4 text-sm text-red-300">{errorMessage}</p> : null}
      </section>
    );
  }

  return (
    <section className="w-full max-w-3xl rounded-2xl border border-slate-700 bg-slate-900 p-8 text-slate-100 shadow-2xl shadow-slate-950/50">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Signed in</h1>
          <p className="text-sm text-slate-400">{currentUser.email ?? "No email found"}</p>
        </div>
      </div>

      <p className="mt-5 text-sm text-slate-300">
        Go to your dashboard to manage private bookmarks.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/home"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
        >
          Open Dashboard
        </Link>

        <button
          type="button"
          onClick={handleSignOut}
          disabled={isSubmitting}
          className="rounded-md border border-slate-600 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Signing out..." : "Sign out"}
        </button>
      </div>

      {errorMessage ? <p className="mt-4 text-sm text-red-300">{errorMessage}</p> : null}
    </section>
  );
}
