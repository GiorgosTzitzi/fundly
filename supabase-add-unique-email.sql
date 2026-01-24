-- Add unique constraint to email column (if table already exists)
-- Run this in Supabase → SQL Editor if you already created the table

-- Add unique constraint to email column
alter table applications 
add constraint applications_email_unique unique (email);

-- If you get an error that the constraint already exists or there are duplicates,
-- you may need to clean up duplicate emails first:
-- 
-- 1. Check for duplicates:
-- SELECT email, COUNT(*) FROM applications GROUP BY email HAVING COUNT(*) > 1;
--
-- 2. Remove duplicates (keeps the oldest one):
-- DELETE FROM applications 
-- WHERE id NOT IN (
--   SELECT MIN(id) FROM applications GROUP BY email
-- );
