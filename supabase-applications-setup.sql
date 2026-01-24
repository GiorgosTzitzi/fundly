-- Database setup for Fundly application submissions
-- Run this in Supabase → SQL Editor

-- Create the applications table
create table applications (
  id bigint primary key generated always as identity,
  email text not null unique, -- Unique constraint prevents duplicate emails
  password text not null, -- Note: In production, you should hash passwords!
  full_name text not null,
  phone_country_code text not null,
  phone_number text not null unique, -- Unique constraint prevents duplicate phone numbers
  id_type text not null,
  id_number text not null unique, -- Unique constraint prevents duplicate ID numbers
  nationality text not null,
  status text default 'pending',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table applications enable row level security;

-- Add policies
-- Allow inserts (user submissions)
create policy "public can insert applications"
on public.applications
for insert
to anon
with check (true);

-- Allow reads only for the same email (users checking their own application)
-- This is a simple example - in production, use proper authentication
create policy "public can read own application"
on public.applications
for select
to anon
using (true); -- For now, allow all reads. In production, restrict by email/auth

-- Note: In production, you should:
-- 1. Hash passwords (never store plain text passwords!)
-- 2. Use Supabase Auth for user authentication
-- 3. Restrict RLS policies to authenticated users
-- 4. Add proper validation and sanitization
