-- Add view_count and tags to courses table (Tracks)
ALTER TABLE courses ADD COLUMN IF NOT EXISTS view_count integer DEFAULT 0;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';

-- Add view_count and tags to course_curriculums table (Modules/Courses)
ALTER TABLE course_curriculums ADD COLUMN IF NOT EXISTS view_count integer DEFAULT 0;
ALTER TABLE course_curriculums ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';

-- Function to safely increment TRACK view count
CREATE OR REPLACE FUNCTION increment_course_view(course_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE courses
  SET view_count = view_count + 1
  WHERE id = course_id;
END;
$$;

-- Function to safely increment CURRICULUM (Module) view count
CREATE OR REPLACE FUNCTION increment_curriculum_view(curriculum_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE course_curriculums
  SET view_count = view_count + 1
  WHERE id = curriculum_id;
END;
$$;
