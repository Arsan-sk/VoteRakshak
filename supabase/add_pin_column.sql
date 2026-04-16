-- ═══════════════════════════════════════════════
-- VoteRakshak Phase 2 — Add PIN column to students
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════

-- 1. Add pin_hash column to students table
ALTER TABLE students
ADD COLUMN IF NOT EXISTS pin_hash TEXT DEFAULT NULL;

-- 2. Set default PIN '1234' (correct bcrypt hash) for all existing students
--    Generated via: bcrypt.hash('1234', 10)
UPDATE students
SET pin_hash = '$2a$10$xfZJ4yG5GVy8gF92.8fkW.DvdbXNfjqNlAWeB7AjgNo4FDzB/NSJK'
WHERE pin_hash IS NULL
   OR pin_hash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';

-- The second condition also fixes students that got the WRONG hash from the old migration

-- 3. Verify
SELECT id, roll_number, first_name, last_name,
       CASE WHEN pin_hash IS NOT NULL THEN '✅ PIN set' ELSE '❌ No PIN' END AS pin_status
FROM students;
