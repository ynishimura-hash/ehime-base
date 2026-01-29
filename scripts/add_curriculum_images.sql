
-- 1. Add image column to course_curriculums (Modules)
ALTER TABLE course_curriculums ADD COLUMN IF NOT EXISTS image TEXT;

-- 2. Update Curriculum Images
UPDATE course_curriculums 
SET image = '/courses/reskill_archive.png' 
WHERE title LIKE '%リスキル大学%';

UPDATE course_curriculums 
SET image = '/courses/it_passport.png' 
WHERE title LIKE '%ITパスポート%';

UPDATE course_curriculums 
SET image = '/courses/fe_exam.png' 
WHERE title LIKE '%基本情報%';

UPDATE course_curriculums 
SET image = '/courses/digital_basics.png' 
WHERE title LIKE '%デジタル%' OR title LIKE '%基礎%';
