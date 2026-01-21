-- Add missing welfare column to jobs
ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS welfare text;
