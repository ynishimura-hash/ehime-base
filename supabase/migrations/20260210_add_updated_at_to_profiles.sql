-- Add updated_at column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

COMMENT ON COLUMN profiles.updated_at IS '更新日時';
