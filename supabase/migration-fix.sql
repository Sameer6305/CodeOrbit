-- Quick fix migration to ensure all columns exist
-- Run this in Supabase SQL Editor

-- Add missing columns if they don't exist (safe - won't error if they already exist)
DO $$ 
BEGIN
  -- Add codechef_handle if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'codechef_handle'
  ) THEN
    ALTER TABLE profiles ADD COLUMN codechef_handle TEXT;
  END IF;

  -- Add leetcode_username if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'leetcode_username'
  ) THEN
    ALTER TABLE profiles ADD COLUMN leetcode_username TEXT;
  END IF;

  -- Add codeforces_handle if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'codeforces_handle'
  ) THEN
    ALTER TABLE profiles ADD COLUMN codeforces_handle TEXT;
  END IF;

  -- Add username if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'username'
  ) THEN
    ALTER TABLE profiles ADD COLUMN username TEXT;
  END IF;
END $$;

-- Verify columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;
