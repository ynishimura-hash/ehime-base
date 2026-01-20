
-- Enhance media_library table to support YouTube and Entity Linking
ALTER TABLE media_library 
ADD COLUMN IF NOT EXISTS type text DEFAULT 'file', -- 'file' or 'youtube'
ADD COLUMN IF NOT EXISTS company_id uuid REFERENCES companies(id),
ADD COLUMN IF NOT EXISTS job_id uuid REFERENCES jobs(id), -- Can be job or quest (job table handles both)
ADD COLUMN IF NOT EXISTS title text,
ADD COLUMN IF NOT EXISTS description text;
