-- Add all missing columns to applications table (if table already exists)
-- Run this in Supabase → SQL Editor if you already created the table

-- Add phone_country_code column
alter table applications 
add column if not exists phone_country_code text;

-- Add phone_number column with unique constraint
alter table applications 
add column if not exists phone_number text;

-- Add unique constraint to phone_number (only if it doesn't exist)
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

-- Add nationality column
alter table applications 
add column if not exists nationality text;

-- If you get an error that the constraint already exists or there are duplicates,
-- you may need to clean up duplicate phone numbers first:
-- 
-- 1. Check for duplicates:
-- SELECT phone_number, COUNT(*) FROM applications WHERE phone_number IS NOT NULL GROUP BY phone_number HAVING COUNT(*) > 1;
--
-- 2. Remove duplicates (keeps the oldest one):
-- DELETE FROM applications 
-- WHERE id NOT IN (
--   SELECT MIN(id) FROM applications WHERE phone_number IS NOT NULL GROUP BY phone_number
-- );
