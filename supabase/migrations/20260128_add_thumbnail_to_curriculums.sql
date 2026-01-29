
-- Add thumbnail_url to course_curriculums
ALTER TABLE course_curriculums ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

-- Grant permissions just in case
GRANT SELECT, UPDATE ON course_curriculums TO anon, authenticated, service_role;
