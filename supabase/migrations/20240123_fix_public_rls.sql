-- Enable RLS on valid tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
-- Check if these exist, if not, they might fail, but based on API route they should be there
ALTER TABLE course_curriculums ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 1. Organizations: Public read
DROP POLICY IF EXISTS "Public read access for organizations" ON organizations;
CREATE POLICY "Public read access for organizations" ON organizations FOR SELECT USING (true);

-- 2. Jobs: Public read
DROP POLICY IF EXISTS "Public read access for jobs" ON jobs;
CREATE POLICY "Public read access for jobs" ON jobs FOR SELECT USING (true);

-- 3. E-Learning: Public read for hierarchy
DROP POLICY IF EXISTS "Public read access for courses" ON courses;
CREATE POLICY "Public read access for courses" ON courses FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read access for course_curriculums" ON course_curriculums;
CREATE POLICY "Public read access for course_curriculums" ON course_curriculums FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read access for course_lessons" ON course_lessons;
CREATE POLICY "Public read access for course_lessons" ON course_lessons FOR SELECT USING (true);

-- 4. Profiles: Public read (or minimal public info? Let's allow public read for now to fix listing issues)
DROP POLICY IF EXISTS "Public read access for profiles" ON profiles;
CREATE POLICY "Public read access for profiles" ON profiles FOR SELECT USING (true);
