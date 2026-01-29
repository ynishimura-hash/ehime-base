
-- Fix RLS Policies for E-Learning
-- Ensure 'courses', 'course_curriculums', and 'course_lessons' are readable by everyone

-- 1. courses table
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read courses" ON courses;
CREATE POLICY "Public read courses" ON courses FOR SELECT USING (true);

-- 2. course_curriculums table
ALTER TABLE course_curriculums ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read modules" ON course_curriculums;
CREATE POLICY "Public read modules" ON course_curriculums FOR SELECT USING (true);

-- 3. course_lessons table
ALTER TABLE course_lessons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read lessons" ON course_lessons;
CREATE POLICY "Public read lessons" ON course_lessons FOR SELECT USING (true);

-- 4. Verify learning_* tables too just in case (though we use course_*)
DROP POLICY IF EXISTS "Public read learning_curriculums" ON learning_curriculums;
CREATE POLICY "Public read learning_curriculums" ON learning_curriculums FOR SELECT USING (true);
