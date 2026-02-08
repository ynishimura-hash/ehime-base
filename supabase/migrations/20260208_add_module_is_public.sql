-- Add is_public column to course_curriculums
ALTER TABLE course_curriculums
ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT false;

-- Make existing courses public by default to avoid disruption (optional, but good for existing data)
UPDATE course_curriculums SET is_public = true WHERE is_public IS FALSE;
