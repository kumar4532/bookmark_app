# Smart Bookmark App

A Next.js + Supabase bookmark manager with Google sign-in, private user data, and realtime bookmark updates across active sessions/devices.

## What Is Implemented

- Google OAuth login from the landing page
- Secure auth callback route that exchanges OAuth code for a Supabase session
- Protected `/home` page (unauthenticated users are redirected to `/`)
- Bookmark operations: create (`title`, `url`), read (newest first), and delete
- Realtime refresh when bookmark rows change for the signed-in user
- User-level data isolation with PostgreSQL Row Level Security (RLS)
- Sign out from dashboard
- Avatar rendering from Google profile image

## Realtime / Cross-Platform Behavior

Bookmark changes are subscribed through Supabase Realtime (`postgres_changes`) with a user-specific filter:

- If a bookmark is added/deleted in one tab, other open tabs for the same account refresh automatically
- If the same user is logged in on another device/browser, changes appear there as soon as Realtime events arrive

This is powered by:

- `components/bookmarks/BookmarkDashboard.tsx` (subscription + refetch)
- `supabase/migrations/202602170001_enable_bookmarks_realtime.sql` (publication + replica identity)

## Tech Stack

- Next.js `16.1.6` (App Router)
- React `19.2.3`
- TypeScript (strict mode)
- Tailwind CSS v4
- Supabase Auth (Google OAuth), Postgres, and Realtime
- `@supabase/ssr` + `@supabase/supabase-js`

## App Flow

1. User lands on `/` and clicks **Continue with Google**.
2. OAuth redirect goes to `/auth/callback?next=/home`.
3. Callback route exchanges code for session and redirects to `/home`.
4. `/home` verifies session on server; unauthenticated users are redirected away.
5. Dashboard loads bookmarks for the current user and listens to realtime DB events.

Relevant files:

- `app/page.tsx`
- `components/auth/GoogleAuth.tsx`
- `app/auth/callback/route.ts`
- `app/home/page.tsx`
- `components/bookmarks/BookmarkDashboard.tsx`

## Data Model

### `public.bookmarks`

- `id uuid primary key default gen_random_uuid()`
- `user_id uuid not null default auth.uid()`
- `title text not null` (non-empty after trim)
- `url text not null` (must match `http://` or `https://`)
- `created_at timestamptz not null default timezone('utc', now())`

Index:

- `(user_id, created_at desc)` for user-scoped recent bookmark reads

## Security (RLS Policies)

Enabled on `public.bookmarks`:

- Select: user can read only own rows (`auth.uid() = user_id`)
- Insert: user can insert only rows where `user_id` is their own ID
- Delete: user can delete only own rows

Defined in:

- `supabase/migrations/202602160001_create_bookmarks.sql`

## URL Validation Rules

Validation occurs in two layers:

- Client-side (`normalizeUrl`): URL must parse and use `http:` or `https:`
- Database check constraint: regex validation for `^https?://`

## Supabase Client Setup Pattern

- Server-side client for route/page auth checks: `utils/supabase/server.ts`
- Browser singleton client for interactive dashboard/auth actions: `utils/supabase/browser-client.ts`

Typed with:

- `types/database.ts`

## Environment Variables

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Configure Supabase Auth:
- Enable Google provider
- Set your site URL (for local dev): `http://localhost:3000`
- Add redirect URL used by this app: `http://localhost:3000/auth/callback`

3. Run migrations in order using Supabase SQL editor (or CLI):
- `supabase/migrations/202602160001_create_bookmarks.sql`
- `supabase/migrations/202602170001_enable_bookmarks_realtime.sql`

4. Start dev server:

```bash
npm run dev
```

Open:

- `http://localhost:3000`

## Available Scripts

- `npm run dev` - run development server
- `npm run build` - production build
- `npm run start` - start production server
- `npm run lint` - run ESLint

## Project Structure

```text
app/
  page.tsx                      # Landing page (Google auth entry)
  auth/callback/route.ts        # OAuth code exchange + redirect
  home/page.tsx                 # Protected dashboard page
components/
  auth/GoogleAuth.tsx           # Google login UI + auth state listener
  bookmarks/BookmarkDashboard.tsx  # Bookmark CRUD + realtime sync
  skeleton/Spinner.tsx
supabase/migrations/
  202602160001_create_bookmarks.sql
  202602170001_enable_bookmarks_realtime.sql
utils/supabase/
  server.ts
  browser-client.ts
types/
  database.ts
```
