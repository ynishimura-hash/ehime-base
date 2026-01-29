
-- Direct SQL update to bypass PostgREST cache

UPDATE course_curriculums SET thumbnail_url = '/courses/archive.png' WHERE title ILIKE '%リスキル大学講座アーカイブ%';
UPDATE course_curriculums SET thumbnail_url = '/courses/it_passport.png' WHERE title ILIKE '%ITパスポート%';
UPDATE course_curriculums SET thumbnail_url = '/courses/career.png' WHERE title ILIKE '%キャリアサポート%';
UPDATE course_curriculums SET thumbnail_url = '/courses/archive.png' WHERE title ILIKE '%Webエンジニアリングマスター%';

-- Also update 'courses' (tracks) just in case the UI pulls from there
-- UPDATE courses SET image = '/courses/archive.png' ... (but tracks usually use courses table)
