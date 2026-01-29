-- Add material_url column to course_lessons table
ALTER TABLE course_lessons ADD COLUMN IF NOT EXISTS material_url text;
