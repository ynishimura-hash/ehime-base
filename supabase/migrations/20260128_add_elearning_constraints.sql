
-- Add unique constraint to learning_curriculums title
ALTER TABLE learning_curriculums ADD CONSTRAINT learning_curriculums_title_key UNIQUE (title);

-- Add unique constraint to courses title
ALTER TABLE courses ADD CONSTRAINT courses_title_key UNIQUE (title);

-- Add unique constraint to sections course_id + title (optional but good)
ALTER TABLE learning_course_sections ADD CONSTRAINT learning_course_sections_course_id_title_key UNIQUE (course_id, title);

-- Add unique constraint to lessons section_id + title
ALTER TABLE learning_lessons ADD CONSTRAINT learning_lessons_section_id_title_key UNIQUE (section_id, title);
