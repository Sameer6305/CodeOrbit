# 🔧 Database Setup Fix

## Problem
Error: `Could not find the 'codechef_handle' column of 'profiles' in the schema cache`

## Solution

### Step 1: Open Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project: **vnsroavhkhfhtqbykgbh**
3. Click **SQL Editor** in the left sidebar

### Step 2: Run the Quick Fix Migration

Copy and paste this SQL into the SQL Editor:

```sql
-- Quick fix migration to ensure all columns exist
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
```

Click **RUN** button.

### Step 3: Verify Tables Exist

Run this query to verify:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;
```

You should see:
- id (uuid)
- email (text)
- username (text)
- codeforces_handle (text)
- leetcode_username (text)
- codechef_handle (text)
- created_at (timestamp)
- updated_at (timestamp)

### Step 4: Test the App

1. Refresh your browser at http://localhost:5177
2. Go to Settings
3. Enter profile URLs:
   - Codeforces: `https://codeforces.com/profile/tourist`
   - LeetCode: `https://leetcode.com/u/8aK9aTbn24/`
   - CodeChef: `https://www.codechef.com/users/sameerkadam05`
4. Click **Save Settings**

## If You Haven't Run schema.sql Yet

If this is your first time setting up the database, run the full schema:

1. Open Supabase SQL Editor
2. Copy all content from `supabase/schema.sql`
3. Paste and click RUN
4. This will create all tables, policies, and triggers

## Fixed Issues

✅ **LeetCode Validation** - Changed to format validation (CORS issue with GraphQL)
✅ **Database Schema** - Migration script adds missing columns safely
✅ **Error Handling** - Better error messages for debugging

## Next Steps

After fixing the database:
1. Save your settings successfully
2. Go to Dashboard
3. Click **Sync All Platforms** button
4. Watch your data populate!
