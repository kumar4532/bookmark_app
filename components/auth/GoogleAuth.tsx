"use client";

import { getSupabaseBrowserClient } from "@/utils/supabase/browser-client";
import { User } from "@supabase/supabase-js";
import { useState, useEffect } from "react";
import { FcGoogle } from "react-icons/fc";

type GoogleLoginDemoProps = {
    user: User | null;
};

export default function GoogleLoginDemo({ user }: GoogleLoginDemoProps) {
    const supabase = getSupabaseBrowserClient();
    const [currentUser, setCurrentUser] = useState<User | null>(user);

    // async function handleSignOut() {
    //     await supabase.auth.signOut();
    //     setCurrentUser(null);
    // }

    useEffect(() => {
        const { data: listener } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setCurrentUser(session?.user ?? null);
            }
        );

        return () => {
            listener?.subscription.unsubscribe();
        };
    }, [supabase])

    const handleGoogleLogin = async () => {
        await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/`,
                skipBrowserRedirect: false,
            },
        });
    }

    return (
        <>
            {!currentUser && (
                <>
                    <section className="w-1/2 bg-gray-900 border rounded-2xl p-8 text-slate-100">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div>
                                    <FcGoogle className="w-10 h-10" />
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                                        OAuth
                                    </p>
                                    <h3 className="text-xl font-semibold text-white">
                                        Continue with Google
                                    </h3>
                                </div>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#1a73e8] px-4 py-2.5 text-lg font-semibold text-white shadow-lg shadow-blue-900/40 transition hover:bg-[#1662c4]"
                        >
                            Continue with Google
                        </button>
                    </section>
                </>
            )}
        </>
    );
}