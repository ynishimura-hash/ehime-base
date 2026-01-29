-- Add onboarding survey columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS source_of_knowledge text,
ADD COLUMN IF NOT EXISTS referral_source text,
ADD COLUMN IF NOT EXISTS usage_purpose text;

-- Add comment
COMMENT ON COLUMN profiles.source_of_knowledge IS 'Ehime Baseを知ったきっかけ';
COMMENT ON COLUMN profiles.referral_source IS '紹介者名';
COMMENT ON COLUMN profiles.usage_purpose IS '利用目的';
