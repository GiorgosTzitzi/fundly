-- Add all missing columns to applications table
-- Run this in Supabase → SQL Editor if you get column errors

-- Add phone_country_code column (if missing)
alter table applications 
add column if not exists phone_country_code text;

-- Add phone_number column (if missing)
alter table applications 
add column if not exists phone_number text;

-- Add unique constraint to phone_number (if not exists)
do $$
begin
  if not exists (
    select 1 from pg_constraint 
    where conname = 'applications_phone_number_unique'
  ) then
    alter table applications 
    add constraint applications_phone_number_unique unique (phone_number);
  end if;
end $$;

-- Add id_type column (if missing)
alter table applications 
add column if not exists id_type text;

-- Add nationality column (if missing)
alter table applications 
add column if not exists nationality text;

-- Make phone_country_code and phone_number NOT NULL if they don't have data yet
-- (Only run this if your table is empty, otherwise update existing rows first)
-- alter table applications 
-- alter column phone_country_code set not null;
-- alter table applications 
-- alter column phone_number set not null;
-- alter table applications 
-- alter column id_type set not null;
-- alter table applications 
-- alter column nationality set not null;
