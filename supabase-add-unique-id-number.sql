-- Add unique constraint to id_number column (if table already exists)
-- Run this in Supabase → SQL Editor if you already created the table

-- Add unique constraint to id_number column
alter table applications 
add constraint applications_id_number_unique unique (id_number);

-- If you get an error that the constraint already exists or there are duplicates,
-- you may need to clean up duplicate ID numbers first:
-- 
-- 1. Check for duplicates:
-- SELECT id_number, COUNT(*) FROM applications GROUP BY id_number HAVING COUNT(*) > 1;
--
-- 2. Remove duplicates (keeps the oldest one):
-- DELETE FROM applications 
-- WHERE id NOT IN (
--   SELECT MIN(id) FROM applications GROUP BY id_number
-- );
