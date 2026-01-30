-- Add missing columns to course_lessons table
ALTER TABLE course_lessons ADD COLUMN IF NOT EXISTS thumbnail_url text;
ALTER TABLE course_lessons ADD COLUMN IF NOT EXISTS type text DEFAULT 'video';
ALTER TABLE course_lessons ADD COLUMN IF NOT EXISTS youtube_url text; -- Ensure this exists
