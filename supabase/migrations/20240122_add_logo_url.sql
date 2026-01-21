-- organizationsテーブルにlogo_urlカラムを追加
ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS logo_url text;

-- 既存のcover_image_urlをlogo_urlにもコピー（初期値として）
UPDATE organizations
SET logo_url = cover_image_url
WHERE logo_url IS NULL AND cover_image_url IS NOT NULL;
