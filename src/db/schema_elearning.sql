-- NEW E-Learning Schema (Curriculum > Course > Section > Lesson)

-- 1. Curriculums (The high-level Tracks, e.g. "DX Professional Track")
CREATE TABLE IF NOT EXISTS learning_curriculums (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Courses (Existing concept, but now reusable across curriculums)
-- Assuming 'courses' table exists. If not:
CREATE TABLE IF NOT EXISTS courses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    level TEXT CHECK (level IN ('初級', '中級', '上級')),
    category TEXT, 
    thumbnail_url TEXT,
    instructor_id UUID, -- Link to user or instructor profile
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Curriculum-Course Join Table (Many-to-Many with Order)
CREATE TABLE IF NOT EXISTS learning_curriculum_courses (
    curriculum_id UUID REFERENCES learning_curriculums(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    order_index INTEGER DEFAULT 0,
    PRIMARY KEY (curriculum_id, course_id)
);

-- 4. Course Sections (Formerly called "Curriculums" in the code, renaming to "Sections")
-- These are the chapters within a course (e.g. "Chapter 1: Intro")
CREATE TABLE IF NOT EXISTS learning_course_sections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Lessons (The actual content: Video/Quiz)
CREATE TABLE IF NOT EXISTS learning_lessons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    section_id UUID REFERENCES learning_course_sections(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    content_type TEXT CHECK (content_type IN ('video', 'quiz', 'text')),
    video_url TEXT,
    duration_seconds INTEGER,
    order_index INTEGER DEFAULT 0,
    is_free_preview BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. User Progress
CREATE TABLE IF NOT EXISTS learning_user_progress (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES learning_lessons(id) ON DELETE CASCADE,
    status TEXT CHECK (status IN ('started', 'completed')),
    completed_at TIMESTAMPTZ,
    last_position_seconds INTEGER,
    PRIMARY KEY (user_id, lesson_id)
);

-- RLS Policies (Example)
ALTER TABLE learning_curriculums ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_curriculum_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_course_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_lessons ENABLE ROW LEVEL SECURITY;

-- Public Read
CREATE POLICY "Public read curriculums" ON learning_curriculums FOR SELECT USING (true);
CREATE POLICY "Public read course mapping" ON learning_curriculum_courses FOR SELECT USING (true);
CREATE POLICY "Public read sections" ON learning_course_sections FOR SELECT USING (true);
CREATE POLICY "Public read lessons" ON learning_lessons FOR SELECT USING (true);

-- Admin Write (Assuming 'admin' claim or role table check)
-- For simplicity in dev:
CREATE POLICY "Admin full access curriculums" ON learning_curriculums FOR ALL USING (auth.role() = 'service_role' OR auth.jwt() ->> 'email' LIKE '%@admin.com'); 
