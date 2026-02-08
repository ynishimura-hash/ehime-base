-- Add category column to course_curriculums table
-- This allows categorizing courses (e.g., "AI・自動化", "マーケティング", etc.)

ALTER TABLE course_curriculums ADD COLUMN IF NOT EXISTS category TEXT DEFAULT '未分類';

-- Set initial categories based on title patterns
UPDATE course_curriculums SET category = 'AI・自動化' WHERE title ILIKE '%AI%' OR title ILIKE '%活用%' OR title ILIKE '%自動化%' OR title ILIKE '%業務自動化%';
UPDATE course_curriculums SET category = 'マーケティング' WHERE title ILIKE '%マーケティング%' OR title ILIKE '%SNS%';
UPDATE course_curriculums SET category = 'デジタル基礎' WHERE title ILIKE '%デジタル基礎%' OR title ILIKE '%デジタル応用%';
UPDATE course_curriculums SET category = 'Google' WHERE title ILIKE '%Google%' OR title ILIKE '%GAS%' OR title ILIKE '%Apps Script%';
UPDATE course_curriculums SET category = 'セキュリティ' WHERE title ILIKE '%セキュリティ%';
UPDATE course_curriculums SET category = '制作・開発' WHERE title ILIKE '%アプリ開発%' OR title ILIKE '%HP制作%';
UPDATE course_curriculums SET category = 'クリエイティブ' WHERE title ILIKE '%動画%';
UPDATE course_curriculums SET category = 'キャリア' WHERE title ILIKE '%キャリア%';
UPDATE course_curriculums SET category = '資格取得' WHERE title ILIKE '%ITパスポート%' OR title ILIKE '%資格%';
UPDATE course_curriculums SET category = 'アーカイブ' WHERE title ILIKE '%アーカイブ%' OR title ILIKE '%リスキル大学%';
