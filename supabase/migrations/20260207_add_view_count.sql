-- Add view_count to organizations table
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS view_count integer DEFAULT 0;
