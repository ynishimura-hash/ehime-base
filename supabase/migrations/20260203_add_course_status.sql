-- =====================================================
-- コース承認ステータスの追加
-- =====================================================

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'course_status') THEN
        CREATE TYPE course_status AS ENUM ('draft', 'pending', 'approved', 'rejected');
    END IF;
END $$;

ALTER TABLE course_curriculums 
ADD COLUMN IF NOT EXISTS status course_status DEFAULT 'draft';

-- 既存の is_official が true のものを approved に移行
UPDATE course_curriculums SET status = 'approved' WHERE is_official = true;
