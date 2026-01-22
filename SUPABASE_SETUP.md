# Supabase Setup Guide

This guide walks you through connecting Supabase to your Vercel-deployed Next.js project.

## Step 1 — Verify your Vercel project is linked

From your local project root, run:

```bash
vercel link
```

Select the existing Vercel project. This ensures environment variables and deployments apply to the correct app. You only do this once.

## Step 2 — Create / verify your Supabase project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create a new project (or use your existing one)
3. Note the following from **Settings → API**:
   - **Project URL**
   - **Anon public key**

You will need these in Step 4.

## Step 3 — Create your database table (with RLS)

In Supabase → **SQL Editor**, run the SQL from `supabase-setup.sql`:

```sql
create table notes (
  id bigint primary key generated always as identity,
  content text not null,
  created_at timestamp with time zone default now()
);

alter table notes enable row level security;

-- Allow inserts (user input)
create policy "public can insert notes"
on public.notes
for insert
to anon
with check (true);

-- Allow reads (optional)
create policy "public can read notes"
on public.notes
for select
to anon
using (true);
```

**Important:** Without these policies, Supabase will reject requests even if keys are correct.

## Step 4 — Add Supabase environment variables to Vercel

In **Vercel → Project → Settings → Environment Variables**, add:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |

Apply to:
- ✅ Production
- ✅ Preview
- ✅ Development

Save changes.

## Step 5 — Pull env variables locally

From your project root:

```bash
vercel env pull .env.development.local
```

This ensures your local app matches Vercel.

## Step 6 — Install Supabase client

✅ Already completed! The `@supabase/supabase-js` package is installed.

## Step 7 — Supabase client utility

✅ Already created at `/lib/supabaseClient.ts`

## Step 8 — Using Supabase in your components

An example `NoteForm` component has been created at `/components/NoteForm.tsx`. You can import and use it in any page:

```tsx
import NoteForm from '@/components/NoteForm';

export default function MyPage() {
  return (
    <div>
      <NoteForm />
    </div>
  );
}
```

Or use the Supabase client directly:

```tsx
'use client';

import { supabase } from '@/lib/supabaseClient';

// Insert data
const { error } = await supabase
  .from('notes')
  .insert({ content: 'Hello World' });

// Read data
const { data, error } = await supabase
  .from('notes')
  .select('*');
```

## Step 9 — Deploy

```bash
vercel deploy
```

Your deployed app now writes to Supabase.

## Step 10 — Verify in Supabase

1. Go to **Supabase → Table Editor**
2. Open the `notes` table
3. Submit the form in production
4. Confirm rows appear

## Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| `permission denied` | Missing RLS policy | Run the SQL policies from Step 3 |
| `process.env is undefined` | Using env vars in client without `NEXT_PUBLIC_` | Ensure env vars start with `NEXT_PUBLIC_` |
| Works locally but not on Vercel | Env vars not added to Vercel | Add env vars in Vercel dashboard (Step 4) |
| Insert fails silently | Not checking error from Supabase | Always check the `error` property in responses |

## Environment Variables Reference

Create a `.env.development.local` file (or use `vercel env pull`) with:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Next Steps (Production Hardening)

For production-grade apps, consider:

1. **Move inserts to Server Actions or API routes** - More secure than client-side inserts
2. **Lock RLS policies to authenticated users** - Avoid public writes
3. **Add user authentication** - Use Supabase Auth for user management
4. **Add validation** - Validate data before inserting

If you need help implementing any of these, let me know!
