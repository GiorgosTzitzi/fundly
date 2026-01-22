-- Step 3: Create your database table (with RLS)
-- Run this in Supabase → SQL Editor

-- Create the notes table
create table notes (
  id bigint primary key generated always as identity,
  content text not null,
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table notes enable row level security;

-- Add policies (required for inserts to work)
-- Allow inserts (user input)
create policy "public can insert notes"
on public.notes
for insert
to anon
with check (true);

-- Allow reads (optional, but useful for viewing data)
create policy "public can read notes"
on public.notes
for select
to anon
using (true);

-- Note: Without these policies, Supabase will reject requests even if keys are correct.
