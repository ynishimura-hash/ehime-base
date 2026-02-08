-- Add detailed fields to profiles for completeness
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS graduation_year text,
ADD COLUMN IF NOT EXISTS skills jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS qualifications text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS portfolio_url text,
ADD COLUMN IF NOT EXISTS desired_conditions jsonb DEFAULT '{}';

COMMENT ON COLUMN profiles.graduation_year IS '卒業予定年 (e.g. 2027年)';
COMMENT ON COLUMN profiles.skills IS 'スキルリスト (JSONB: [{name, level}, ...])';
COMMENT ON COLUMN profiles.qualifications IS '保有資格リスト';
COMMENT ON COLUMN profiles.portfolio_url IS 'ポートフォリオURL';
COMMENT ON COLUMN profiles.desired_conditions IS '希望条件 (JSONB: {salary, location, industry})';
