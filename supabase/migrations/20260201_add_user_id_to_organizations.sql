-- organizations テーブルに user_id カラムを追加
-- 既存のデータとの整合性を保つため NULL 許容とする

ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- user_id にインデックスを追加（検索用）
CREATE INDEX IF NOT EXISTS idx_organizations_user_id ON organizations(user_id);
