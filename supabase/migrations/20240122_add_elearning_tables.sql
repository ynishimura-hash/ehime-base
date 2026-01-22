-- Create E-learning Content Tables

-- Courses Table
CREATE TABLE IF NOT EXISTS courses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  instructor jsonb, -- { name, role, image }
  category text,
  level text,
  duration text,
  image text,
  is_published boolean DEFAULT true,
  order_index integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Courses are viewable by everyone." ON courses FOR SELECT USING (true);
CREATE POLICY "Admins can manage courses." ON courses FOR ALL USING (
  exists (select 1 from profiles where id = (select auth.uid()) and user_type = 'admin')
);


-- Curriculums (Chapters) Table
CREATE TABLE IF NOT EXISTS course_curriculums (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  order_index integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE course_curriculums ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Curriculums are viewable by everyone." ON course_curriculums FOR SELECT USING (true);
CREATE POLICY "Admins can manage curriculums." ON course_curriculums FOR ALL USING (
  exists (select 1 from profiles where id = (select auth.uid()) and user_type = 'admin')
);


-- Lessons Table
CREATE TABLE IF NOT EXISTS course_lessons (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  curriculum_id uuid REFERENCES course_curriculums(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  youtube_url text,
  duration text,
  quiz jsonb, -- [{ question, options[], correctAnswerIndex, explanation }]
  order_index integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE course_lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lessons are viewable by everyone." ON course_lessons FOR SELECT USING (true);
CREATE POLICY "Admins can manage lessons." ON course_lessons FOR ALL USING (
  exists (select 1 from profiles where id = (select auth.uid()) and user_type = 'admin')
);

-- Note: We already have 'course_progress' table in previous schema, but it referenced 'course_id' and 'lesson_id' which were previously conceptual.
-- Now they will properly reference these tables if we added foreign keys, but 'course_progress' uses UUIDs, so it should be fine.
-- We might want to add foreign key constraints to course_progress later, but for now let's keep it loose to avoid breaking existing progress if IDs change (though we will migrate IDs if possible or map them).
