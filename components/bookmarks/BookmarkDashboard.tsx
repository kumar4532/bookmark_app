"use client";

import { Bookmark } from "@/types/database";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";
import { useEffect, useState, type FormEvent } from "react";
import { getSupabaseBrowserClient } from "@/utils/supabase/browser-client";
import { GoSignOut } from "react-icons/go";
import Image from "next/image";
import Spinner from "../skeleton/Spinner";
import toast from "react-hot-toast";

type BookmarkDashboardProps = {
  user: User;
};

function normalizeUrl(url: string): string | null {
  try {
    const parsedUrl = new URL(url.trim());
    const isHttp =
      parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
    return isHttp ? parsedUrl.toString() : null;
  } catch {
    return null;
  }
}

export default function BookmarkDashboard({
  user,
}: BookmarkDashboardProps) {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();

  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [deletingBookmarkIds, setDeletingBookmarkIds] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchBookmarks = async (userId: string) => {
    const { data, error } = await supabase
      .from("bookmarks")
      .select("id, user_id, title, url, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });


    if (error) {
      toast.error("Failed to fetch bookmarks")
      return;
    }

    if (data) setBookmarks(data);
  };

  useEffect(() => {
    let realtimeChannel: ReturnType<typeof supabase.channel> | null = null;

    const load = async () => {
      await fetchBookmarks(user?.id);

      realtimeChannel = supabase
        .channel("bookmarks-changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "bookmarks",
            filter: `user_id=eq.${user.id}`,
          },
          () => fetchBookmarks(user.id)
        )
        .subscribe();

      setIsLoading(false);
    };

    load();

    return () => {
      if (realtimeChannel) supabase.removeChannel(realtimeChannel);
    };
  }, []);

  const handleAddBookmark = async (e: FormEvent) => {
    e.preventDefault();

    const cleanTitle = title.trim();
    const normalizedUrl = normalizeUrl(url);

    if (!cleanTitle || !normalizedUrl) {
      toast.error("Please provide a valid title and URL.");
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    const { data, error } = await supabase
      .from("bookmarks")
      .insert({
        title: cleanTitle,
        url: normalizedUrl,
        user_id: user.id,
      })
      .select("id, user_id, title, url, created_at")
      .single();

    if (error) {
      toast.error("Failed to add bookmark.");
      setIsSaving(false);
      return;
    }

    setBookmarks((prev) => [data, ...prev]);
    toast.success("Bookmark saved");

    setTitle("");
    setUrl("");
    setIsSaving(false);
  };

  const handleDeleteBookmark = async (id: string) => {
    setDeletingBookmarkIds((prev) => [...prev, id]);

    const { error } = await supabase.from("bookmarks").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete bookmark");
    } else {
      setBookmarks((prev) => prev.filter((b) => b.id !== id));
      toast.success("Bookmark removed", { icon: "🗑️" });
    }
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    setErrorMessage(null);

    const { error } = await supabase.auth.signOut();
    setIsSigningOut(false);

    if (error) {
      toast.error("Failed to sign out");
      return;
    }

    toast.success("Signed out successfully");

    router.replace("/");
    router.refresh();
  };

  return (
    <section className="w-full max-w-4xl">
      <div className="w-full rounded-2xl border border-[#A53860] bg-[#FFF2E0] p-8 text-[#BA6B57] shadow-2xl shadow-slate-950/50">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">
              Welcome to Bookies
            </h1>
            <p className="text-sm">
              Store you all your bookmarks at one place.
            </p>
          </div>
          <div className="flex flex-row space-x-4">
            <div className="rounded-full border p-0.5 hover:border-blue-300">
              <Image
                src={user?.user_metadata?.avatar_url}
                alt={user?.user_metadata?.name}
                width={40}
                height={40}
                className="rounded-full"
              />
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="rounded-md border border-slate-600 px-4 py-2 text-sm font-medium text-[#30475E] transition hover:border-slate-500 hover:bg-amber-50 disabled:opacity-60"
            >
              {isSigningOut ? <Spinner size="md" /> : <GoSignOut className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <form
          onSubmit={handleAddBookmark}
          className="mt-6 grid gap-3 sm:grid-cols-[1fr_1fr_auto]"
        >
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Bookmark title"
            className="rounded-md border border-[#C06C84] bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-[#C06C84]"
            maxLength={120}
            required
          />
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="rounded-md border border-[#C06C84] bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-[#C06C84]"
            type="url"
            required
          />
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center justify-center gap-2 rounded-md bg-[#BA6B57] px-4 py-2 text-sm font-semibold text-white hover:bg-[#BA6B57]/80 disabled:opacity-60"
          >
            {isSaving ? (
              <>
                <Spinner size="sm" />
                <span>Saving...</span>
              </>
            ) : (
              "Add"
            )}
          </button>
        </form>
      </div>

      <div className="w-full rounded-2xl border border-slate-700 bg-[#F9F7F7] p-6 text-slate-100 shadow-2xl shadow-slate-950/50 mt-6 space-y-3">
        {isLoading ? (
          <p className="flex justify-center items-center gap-2 text-lg text-slate-300">
            <Spinner size="md" /> Loading bookmarks...
          </p>
        ) : bookmarks.length === 0 ? (
          <p className="text-xl text-[#547792] text-center">
            No bookmarks yet. Add your first one above.
          </p>
        ) : (
          bookmarks.map((bookmark) => {
            const isDeleting = deletingBookmarkIds.includes(bookmark.id);

            return (
              <div
                key={bookmark.id}
                className="flex justify-between rounded-lg bg-[#DBE2EF] p-4"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-lg text-black">
                    {bookmark.title}
                  </p>
                  <a
                    href={bookmark.url}
                    target="_blank"
                    rel="noreferrer"
                    className="truncate text-sm text-blue-600 hover:text-blue-800"
                  >
                    {bookmark.url}
                  </a>
                </div>

                <button
                  onClick={() => handleDeleteBookmark(bookmark.id)}
                  disabled={isDeleting}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-red-500 px-6 py-1 text-sm font-semibold text-red-500 hover:bg-red-500/10 disabled:opacity-60"
                >
                  {isDeleting ? (
                    <>
                      <Spinner size="sm" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}