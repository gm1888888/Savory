# Savory -- Cooking & Recipe Blog

A community recipe blog where registered members publish their own cooking
recipes. Built with **Next.js (App Router) + TypeScript + Tailwind CSS +
shadcn/ui**, backed by **Supabase** for authentication, the PostgreSQL
database and image storage, and deployed on **Vercel**.

> **The site ships empty on purpose.** There are no sample recipes, demo
> users, fake comments or seeded likes anywhere in this repository or in the
> SQL script. Every recipe you see after deployment was uploaded by a real
> person through the Share a Recipe page.

---

## Table of contents

1. [What it does](#1-what-it-does)
2. [Technologies used](#2-technologies-used)
3. [Installation](#3-installation)
4. [Create a Supabase project](#4-create-a-supabase-project)
5. [Configure environment variables](#5-configure-environment-variables)
6. [Create the database tables](#6-create-the-database-tables)
7. [Storage buckets](#7-storage-buckets)
8. [Authentication settings](#8-authentication-settings)
9. [Run the project locally](#9-run-the-project-locally)
10. [Deploy to Vercel](#10-deploy-to-vercel)
11. [Project structure](#11-project-structure)
12. [How security works](#12-how-security-works)
13. [Troubleshooting](#13-troubleshooting)

---

## 1. What it does

**Anyone (not logged in) can:**

- Browse the homepage, all recipes, and individual recipe pages
- Search recipes by title, description, ingredient, tag or category
- Filter by category and difficulty, and sort by newest, oldest, most liked
  or quickest to make
- See who wrote each recipe, and read the comments

**Registered members can additionally:**

- Publish recipes, with a photo, a dynamic ingredient list and numbered steps
- Edit and delete **their own** recipes (and nobody else's)
- Like and unlike recipes
- Bookmark recipes and view them on a private Saved page
- Comment on recipes and delete **their own** comments
- Edit their display name, bio and profile photo

When a guest taps Like, Save or the comment box, they are told to log in
rather than being silently ignored.

---

## 2. Technologies used

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, Server Components, Server Actions) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui (Radix primitives) + lucide-react icons |
| Validation | Zod (runs on the server, on every submission) |
| Database | Supabase PostgreSQL |
| Auth | Supabase Auth (email + password) |
| File storage | Supabase Storage |
| Notifications | Sonner toasts |
| Hosting | Vercel |

---

## 3. Installation

You need **Node.js 18.18 or newer** and npm.

```bash
# from the project folder
npm install
```

That installs everything. Next: create the Supabase project it talks to.

---

## 4. Create a Supabase project

1. Go to <https://supabase.com> and sign in (a free account is enough).
2. Click **New project**.
3. Fill in:
   - **Name** -- anything, e.g. `savory`
   - **Database Password** -- generate one and **save it somewhere safe**
   - **Region** -- pick the one closest to you
4. Click **Create new project** and wait 1-2 minutes while it provisions.

---

## 5. Configure environment variables

In your Supabase dashboard go to **Project Settings -> API**. You need two
values from that page:

- **Project URL** -- looks like `https://abcdefgh.supabase.co`
- **anon public** key -- a long string starting with `eyJ...`

Now, in the project folder, copy the example file:

```bash
cp .env.example .env.local
```

Open `.env.local` and paste your values in:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://abcdefgh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...your-anon-key...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

> **Which key do I use?** Only the **anon public** key, never the
> `service_role` key. The anon key is designed to be visible in the browser;
> every table is protected by Row Level Security so it cannot be abused. The
> `service_role` key bypasses all of that and must never leave a server.
> This project never reads it.

`.env.local` is git-ignored, so your keys are not committed.

---

## 6. Create the database tables

1. In Supabase, open **SQL Editor** in the left sidebar.
2. Click **New query**.
3. Open the file [`supabase/schema.sql`](supabase/schema.sql) from this
   project, copy **the whole file**, and paste it into the editor.
4. Press **Run** (or Ctrl+Enter).

You should see `Success. No rows returned`. That one script creates:

- the `profiles`, `recipes`, `likes`, `bookmarks` and `comments` tables
- all constraints (including the unique rules that stop double likes and
  double bookmarks)
- all indexes, including trigram indexes that keep search fast
- triggers that keep `likes_count` and `comments_count` accurate
- a trigger that creates a profile automatically whenever someone signs up
- Row Level Security and every policy
- the two storage buckets and their policies

The script is safe to run more than once, and **inserts no recipes**.

---

## 7. Storage buckets

The SQL script already creates both buckets for you:

| Bucket | Used for | Public read | Max size |
| --- | --- | --- | --- |
| `recipe-images` | Recipe photos | Yes | 5 MB |
| `profile-images` | Profile pictures | Yes | 5 MB |

To confirm, open **Storage** in the sidebar and check both appear.

Files are stored at `<bucket>/<your-user-id>/<random>.<ext>`. The storage
policies read that first folder segment, which is how a member is prevented
from overwriting or deleting someone else's photos.

---

## 8. Authentication settings

Go to **Authentication -> Sign In / Providers** and make sure **Email** is
enabled.

### Google Sign-In ("Continue with Google")

The app already has a Google button on the login and register pages -- it
does nothing until you complete these two steps.

**1. Create a Google OAuth client:**

1. Go to the [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   and create a project (or pick an existing one).
2. **Create Credentials -> OAuth client ID**. If prompted, configure the
   consent screen first (External, add your app name -- it can stay in
   "Testing" mode for a class project).
3. Application type: **Web application**.
4. Under **Authorized redirect URIs**, add your Supabase project's callback
   URL, found in Supabase under **Authentication -> Providers -> Google**:
   ```
   https://<your-project-ref>.supabase.co/auth/v1/callback
   ```
5. Click **Create**. Copy the **Client ID** and **Client secret**.

**2. Enable it in Supabase:**

1. **Authentication -> Sign In / Providers -> Google**, toggle it on.
2. Paste in the **Client ID** and **Client secret** from step 1, save.

That's it -- no code change needed. `signInWithOAuth` redirects to Google,
then back to the same `/auth/callback` route the email-confirmation link
uses, which creates the session. The `handle_new_user()` trigger already
populates the new profile's name and avatar from Google's account data.

> Until both steps are done, clicking the button shows a
> "provider is not enabled" error from Supabase -- that is expected, not a
> bug in the app.

### Email confirmation

This project is built for **email confirmation ON**, which is the Supabase
default. The flow is:

> Register -> "Check your inbox" screen -> click the link in the email ->
> `/auth/callback` exchanges it for a session -> logged in

You must tell Supabase which URLs it is allowed to send people back to.
Go to **Authentication -> URL Configuration** and set:

- **Site URL**: `http://localhost:3000` while developing, and your Vercel
  URL once deployed
- **Redirect URLs**: add both
  - `http://localhost:3000/auth/callback`
  - `https://your-project.vercel.app/auth/callback`

> **Heads up for group demos.** Supabase's built-in email service is rate
> limited to a handful of messages per hour. If several group members sign up
> at once, some confirmation emails will not arrive.

### Turning confirmation off (optional, recommended for a class demo)

If you would rather people be logged in the instant they register:

1. **Authentication -> Sign In / Providers -> Email**
2. Turn **Confirm email** off, and save.

No code change is needed. The register action already detects that a session
came back immediately and sends the user straight to the homepage instead of
the "check your inbox" screen.

---

## 9. Run the project locally

```bash
npm run dev
```

Open <http://localhost:3000>.

The site will be **empty**, showing "No recipes have been shared yet" -- that
is correct. To check everything works end to end:

1. Click **Sign up** and create an account
2. Confirm your email (or skip this if you turned confirmation off)
3. Log in
4. Click **Share a recipe**, fill the form, upload a photo, press
   **Publish Recipe**
5. You land on your new recipe page; it now also appears on the homepage,
   All Recipes, its category, and in search

Other useful commands:

```bash
npm run build     # production build
npm run start     # serve the production build
npm run lint      # ESLint
npx tsc --noEmit  # type check only
```

---

## 10. Deploy to Vercel

1. Push this project to a GitHub repository.
2. Go to <https://vercel.com>, sign in with GitHub, and click **Add New ->
   Project**.
3. Import your repository. Vercel detects Next.js automatically -- leave the
   build settings alone.
4. Expand **Environment Variables** and add the same two values from your
   `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` -- set this to your Vercel URL, e.g.
     `https://savory-yourteam.vercel.app`
5. Click **Deploy**.
6. **Afterwards, go back to Supabase** -> Authentication -> URL
   Configuration, and add your live Vercel URL as the **Site URL** plus
   `https://your-project.vercel.app/auth/callback` to the redirect list.
   Skipping this step is the single most common reason confirmation emails
   send people to a broken page.

---

## 11. Project structure

```
supabase/
  schema.sql                 One script: tables, indexes, triggers, RLS, storage

src/
  proxy.ts                   Refreshes the session and guards private routes

  app/
    layout.tsx               Navbar + Footer shell, fonts, toaster
    page.tsx                 Home: hero, latest / popular / trending, categories
    (auth)/                  login, register, verify-email
    auth/callback/route.ts   Handles the email confirmation link
    recipes/                 All recipes, [id] detail, [id]/edit
    categories/              Category index and [slug] listing
    search/                  Search page
    upload/                  Share a Recipe
    my-recipes/              Manage your own recipes
    bookmarks/               Your saved recipes
    profile/                 View and edit your profile
    about/  contact/
    actions/                 Server Actions: auth, recipes, interactions, profile

  components/
    layout/                  navbar, mobile-nav, user-menu, footer
    recipes/                 recipe-card, recipe-grid, recipe-form,
                             dynamic-list-input, tag-input, image-upload,
                             like-button, bookmark-button, share-button,
                             comment-section, recipe-filters, search-bar,
                             pagination, delete-recipe-button
    shared/                  empty-state, error-state, loading-state,
                             confirmation-dialog, logo
    home/                    hero, section-heading
    ui/                      shadcn/ui primitives

  lib/
    supabase/client.ts       Browser client
    supabase/server.ts       Server client (RSC, Server Actions, Route Handlers)
    supabase/middleware.ts   Session refresh used by proxy.ts
    queries.ts               All server-side reads, in one place
    validation.ts            Zod schemas, shared by client hints and server checks
    constants.ts             Categories, difficulties, sort options, limits
    database.types.ts        TypeScript mirror of the SQL schema
    format.ts  storage.ts
```

---

## 12. How security works

- **Row Level Security is on for every table.** The policies -- not the UI --
  decide who can do what. Even if someone called the API directly with the
  anon key, they could not edit another member's recipe.
- **Ownership is checked in the database.** `Users can update their own
  recipes` compares `auth.uid()` to `user_id`. The Server Actions re-check
  ownership too, so a forbidden action fails clearly rather than silently.
- **Every form is validated on the server** with Zod before anything is
  written. Client-side checks exist only to give faster feedback.
- **Uploads are constrained twice**: the browser checks type and size for a
  friendly error, and the bucket independently enforces a 5 MB limit and an
  allow-list of JPG / PNG / WEBP.
- **Storage is namespaced per user.** A member can only write inside
  `<bucket>/<their-own-user-id>/`.
- **Search input is sanitised** before it reaches PostgREST, so a search term
  cannot alter the shape of the query.
- **Only the anon key is ever used.** The `service_role` key appears nowhere
  in this codebase.

### A note on counts

`recipes.likes_count` and `recipes.comments_count` are maintained by database
triggers, not by the browser. Clicking Like inserts a real row in `likes`;
the trigger updates the count; the action reads the true value back. A unique
constraint on `(user_id, recipe_id)` makes a duplicate like impossible.

---

## 13. Troubleshooting

**"We could not load this right now" on every page**
Your `.env.local` values are missing or wrong, or the SQL script has not been
run yet. Check both, then restart `npm run dev` -- environment variables are
only read at startup.

**Register works but no confirmation email arrives**
Supabase's built-in mailer is heavily rate limited. Wait a few minutes, check
spam, or turn off email confirmation (section 8) for testing.

**The confirmation link says the link did not work**
The redirect URL is not allow-listed. Add `<your-site>/auth/callback` under
Authentication -> URL Configuration.

**Uploading a photo fails**
Confirm the `recipe-images` bucket exists under Storage. If you created the
project before running the SQL, re-run `supabase/schema.sql`.

**Images do not display after upload**
The bucket must be public. Re-running the SQL script fixes this.

**A recipe will not save**
Every recipe needs a title of at least 3 characters, a description, a
category, at least one ingredient and at least one step. The form shows which
field is at fault.
