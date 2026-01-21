-- Add missing branding and RJP columns to organizations
ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS rjp_negatives text,
ADD COLUMN IF NOT EXISTS logo_color text DEFAULT 'bg-blue-500';

-- Update existing data with some defaults if needed
UPDATE organizations SET rjp_negatives = '完璧な会社はありません。真実を語ることで、より良いマッチングを目指しています。' WHERE rjp_negatives IS NULL;
