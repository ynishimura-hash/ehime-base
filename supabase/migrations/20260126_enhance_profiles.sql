-- Add detailed fields for student/worker distinction
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS occupation_status text CHECK (occupation_status IN ('student', 'worker')),
ADD COLUMN IF NOT EXISTS worker_status text CHECK (worker_status IN ('company_employee', 'freelance', 'civil_servant', 'other')),
ADD COLUMN IF NOT EXISTS school_type text CHECK (school_type IN ('junior_high', 'high_school', 'university', 'vocational', 'other')),
ADD COLUMN IF NOT EXISTS school_name text,
ADD COLUMN IF NOT EXISTS school_grade text;

-- Comment on columns
COMMENT ON COLUMN profiles.occupation_status IS '学生(student)か社会人(worker)か';
COMMENT ON COLUMN profiles.worker_status IS '社会人の場合の働き方';
COMMENT ON COLUMN profiles.school_type IS '学校種別';
COMMENT ON COLUMN profiles.school_name IS '学校名';
