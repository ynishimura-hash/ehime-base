-- Enhance media_library table with metadata for videos
ALTER TABLE media_library 
ADD COLUMN IF NOT EXISTS title text,
ADD COLUMN IF NOT EXISTS caption text,
ADD COLUMN IF NOT EXISTS link_url text,
ADD COLUMN IF NOT EXISTS link_text text DEFAULT '詳細を見る';

-- Note: company_id and job_id already exist in the schema.
