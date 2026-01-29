-- Add flags for quiz and document existence to course_lessons table
ALTER TABLE course_lessons ADD COLUMN IF NOT EXISTS has_quiz boolean DEFAULT false;
ALTER TABLE course_lessons ADD COLUMN IF NOT EXISTS has_document boolean DEFAULT false;
