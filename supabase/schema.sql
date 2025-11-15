-- ============================================
-- CodeOrbit Database Schema - COMPLETE SETUP
-- ============================================
-- Run this ENTIRE script in your Supabase SQL Editor
-- 
-- Instructions:
-- 1. Go to Supabase Dashboard → SQL Editor
-- 2. Create a new query
-- 3. Copy and paste this ENTIRE file
-- 4. Click "RUN" button
-- 5. Verify success: Should see "Success. No rows returned"
-- ============================================

-- STEP 1: Clean up existing objects (if rerunning)
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own stats" ON daily_stats;
DROP POLICY IF EXISTS "Service role can insert stats" ON daily_stats;
DROP POLICY IF EXISTS "Service role can update stats" ON daily_stats;
DROP POLICY IF EXISTS "Anyone can view contests" ON contests_cache;
DROP POLICY IF EXISTS "Service role can manage contests" ON contests_cache;

-- Drop existing triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_daily_stats_updated_at ON daily_stats;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop existing functions
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS handle_new_user();

-- Drop existing tables (CASCADE removes dependencies)
DROP TABLE IF EXISTS contests_cache CASCADE;
DROP TABLE IF EXISTS daily_stats CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- STEP 2: Create Tables

-- 1. User Profiles Table
-- Stores platform usernames for each user
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  username TEXT,
  codeforces_handle TEXT,
  leetcode_username TEXT,
  codechef_handle TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- STEP 3: Create Policies for profiles

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- 2. Daily Stats Table
-- Stores daily problem-solving statistics for each platform
CREATE TABLE daily_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('codeforces', 'leetcode', 'codechef')),
  solved_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date, platform)
);

-- Enable Row Level Security
ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;

-- STEP 4: Create Policies for daily_stats

-- Policy: Users can view their own stats
CREATE POLICY "Users can view own stats"
  ON daily_stats FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Service role can insert/update stats (for API routes)
CREATE POLICY "Service role can insert stats"
  ON daily_stats FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can update stats"
  ON daily_stats FOR UPDATE
  USING (true);

-- Create index for faster queries
CREATE INDEX idx_daily_stats_user_date 
  ON daily_stats(user_id, date DESC);

-- 3. Contests Cache Table
-- Caches upcoming contest information
CREATE TABLE contests_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  platform TEXT NOT NULL,
  contest_name TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE,
  duration INTEGER, -- in seconds
  link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(platform, contest_name, start_time)
);

-- Enable Row Level Security (public read)
ALTER TABLE contests_cache ENABLE ROW LEVEL SECURITY;

-- STEP 5: Create Policies for contests_cache

-- Policy: Everyone can view contests
CREATE POLICY "Anyone can view contests"
  ON contests_cache FOR SELECT
  USING (true);

-- Policy: Service role can insert/update contests
CREATE POLICY "Service role can manage contests"
  ON contests_cache FOR ALL
  USING (true);

-- Create index for faster queries
CREATE INDEX idx_contests_start_time 
  ON contests_cache(start_time);

-- STEP 6: Create Functions and Triggers

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles table
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for daily_stats table
CREATE TRIGGER update_daily_stats_updated_at
  BEFORE UPDATE ON daily_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 5. Function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these after the main script to verify everything is set up correctly

-- Check tables exist
SELECT 'Tables Created' as status;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'daily_stats', 'contests_cache');

-- Check columns in profiles table
SELECT 'Profiles Columns' as status;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- Check policies
SELECT 'Policies Created' as status;
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('profiles', 'daily_stats', 'contests_cache');

-- Check triggers
SELECT 'Triggers Created' as status;
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE event_object_table IN ('profiles', 'daily_stats')
OR event_object_table = 'users';

-- ============================================
-- SETUP COMPLETE! 
-- ============================================
-- Expected results:
-- ✓ 3 tables created (profiles, daily_stats, contests_cache)
-- ✓ 8 columns in profiles table
-- ✓ 8 policies created
-- ✓ 3 triggers created
-- ✓ 2 functions created
-- 
-- Next steps:
-- 1. Refresh your app at http://localhost:5177
-- 2. Sign up with a new account
-- 3. Go to Settings and add your platform URLs
-- 4. Click "Sync All Platforms" on Dashboard
-- ============================================
