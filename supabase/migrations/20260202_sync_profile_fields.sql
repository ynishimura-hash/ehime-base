-- Sync Profiles table with application requirements
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS school_faculty text,
ADD COLUMN IF NOT EXISTS school_year text,
ADD COLUMN IF NOT EXISTS university text,
ADD COLUMN IF NOT EXISTS faculty text,
ADD COLUMN IF NOT EXISTS position text,
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS source_of_knowledge text,
ADD COLUMN IF NOT EXISTS referral_source text,
ADD COLUMN IF NOT EXISTS usage_purpose text,
ADD COLUMN IF NOT EXISTS tags text[];

COMMENT ON COLUMN profiles.school_faculty IS '学校の学部・学科';
COMMENT ON COLUMN profiles.school_year IS '学年';
COMMENT ON COLUMN profiles.university IS '大学名（School Nameの別名）';
COMMENT ON COLUMN profiles.faculty IS '学部（School Facultyの別名）';
COMMENT ON COLUMN profiles.position IS '役職・職種';
COMMENT ON COLUMN profiles.bio IS 'プロフィール自己紹介';
COMMENT ON COLUMN profiles.source_of_knowledge IS 'Ehime Baseを知ったきっかけ';
COMMENT ON COLUMN profiles.referral_source IS '紹介者';
COMMENT ON COLUMN profiles.usage_purpose IS '利用目的';
COMMENT ON COLUMN profiles.tags IS 'ユーザーに関連するスキルや志向性タグ';
