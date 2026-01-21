-- Add logo_url and cover_image_url columns to organizations table
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS cover_image_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN organizations.logo_url IS '企業ロゴ画像のURL';
COMMENT ON COLUMN organizations.cover_image_url IS '企業カバー画像のURL';
