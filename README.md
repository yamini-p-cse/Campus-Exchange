# Campus Exchange

A student marketplace starter built with React, TypeScript, Vite, and Supabase.

## Get started

1. Install Node.js (version 20.19+ or 22.12+).
2. Install dependencies with `npm install`.
3. Copy `.env.example` to `.env.local` and add your Supabase project URL and anon key. Without credentials, browse uses sample listings and account, listing-management, and messaging actions are unavailable.
4. Run `npm run dev` and open the local URL printed by Vite.

Run `npm run build` to type-check and create a production build. Run `npm run lint` to check code style.

## Supabase setup

The backend uses Supabase Auth, PostgreSQL, Storage, and Realtime. `supabase/migrations` creates student profiles, listings, listing conversations, the public listing-image bucket with owner-scoped uploads, and the Realtime publication for new messages. Install the Supabase CLI, link your project with `npx supabase link`, then apply the migrations with `npx supabase db push`.

## Project structure

- `src/app`: application route configuration.
- `src/components`: shared layout and small reusable interface elements.
- `src/features`: code grouped by auth, listings, messages, search, and profile capabilities.
- `src/pages`: screens connected to application routes.
- `src/lib`: shared service integrations, including the Supabase client.
- `src/types`: shared TypeScript data models.
- `supabase`: local Supabase configuration and database migrations.

The app supports Supabase authentication, database-backed browsing, listing management with photo uploads, editable profiles, and listing-specific buyer/seller messaging with live incoming updates. When Supabase is not configured, browse remains available with sample listings and demo seller contacts. Apply all migrations before using account, listing, image upload, profile, or messaging workflows.