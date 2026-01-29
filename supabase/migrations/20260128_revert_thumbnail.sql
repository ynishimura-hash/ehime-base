
-- Revert: Drop thumbnail_url from course_curriculums
ALTER TABLE course_curriculums DROP COLUMN IF EXISTS thumbnail_url;

-- Force reload just in case
NOTIFY pgrst, 'reload schema';
