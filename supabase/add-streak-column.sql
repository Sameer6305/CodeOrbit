-- Add streak column to daily_stats table
-- Run this in Supabase SQL Editor after initial schema setup

-- Add streak column to store daily streak values
ALTER TABLE daily_stats 
ADD COLUMN IF NOT EXISTS streak INTEGER DEFAULT 0;

-- Add comment to document the column
COMMENT ON COLUMN daily_stats.streak IS 'Current streak count for the platform on this date';

-- Update existing rows to have streak = 0 if NULL
UPDATE daily_stats SET streak = 0 WHERE streak IS NULL;
