-- ═══════════════════════════════════════════════
-- VoteRakshak Phase 2 — Add PIN column to students
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════

-- 1. Add pin_hash column to students table
ALTER TABLE students
ADD COLUMN IF NOT EXISTS pin_hash TEXT DEFAULT NULL;

-- 2. Set default PIN '1234' (bcrypt hash) for all existing students
--    bcrypt hash of '1234' with saltRounds=10
UPDATE students
SET pin_hash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
WHERE pin_hash IS NULL;

-- 3. Add NOT NULL constraint with default after backfill
--    (optional - leave nullable so registration can set it properly)
-- ALTER TABLE students ALTER COLUMN pin_hash SET NOT NULL;

-- Verify the update
SELECT id, roll_number, first_name, last_name,
       CASE WHEN pin_hash IS NOT NULL THEN '✅ PIN set' ELSE '❌ No PIN' END AS pin_status
FROM students;
