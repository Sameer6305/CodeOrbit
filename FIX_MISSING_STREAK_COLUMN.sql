-- ============================================
-- EMERGENCY FIX: Add missing streak column
-- ============================================
-- This fixes the issue where data sync fails silently
-- because the streak column is missing
--
-- 🚨 RUN THIS IN YOUR SUPABASE SQL EDITOR NOW! 🚨
--
-- Instructions:
-- 1. Go to https://supabase.com/dashboard/project/vnsroavhkhfhtqbykgbh
-- 2. Click "SQL Editor" in left sidebar
-- 3. Click "New Query"
-- 4. Copy and paste this ENTIRE script
-- 5. Click "RUN" (bottom right)
-- 6. Should see "Success. No rows returned"
-- ============================================

-- Add the missing streak column
ALTER TABLE daily_stats 
ADD COLUMN IF NOT EXISTS streak INTEGER DEFAULT 0;

-- Add comment to document the column
COMMENT ON COLUMN daily_stats.streak IS 'Current streak count for the platform on this date';

-- Update any existing rows to have streak = 0
UPDATE daily_stats SET streak = 0 WHERE streak IS NULL;

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'daily_stats' 
ORDER BY ordinal_position;

-- ✅ DONE! You should see 'streak' column listed above
-- Now go back to your app and try "Sync All Platforms" again!
