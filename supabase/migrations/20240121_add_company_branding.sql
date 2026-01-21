-- Add branding columns to organizations
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS logo_url text,
ADD COLUMN IF NOT EXISTS cover_image_url text;

-- Create storage bucket for company assets
INSERT INTO storage.buckets (id, name, public)
VALUES ('company-assets', 'company-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for company-assets bucket
-- 1. Public Access (Select)
CREATE POLICY "Public Company Assets Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'company-assets' );

-- 2. Authenticated Upload (Insert)
-- Allow any authenticated user to upload (ideally should check if they belong to a company, but keeping simple for MVP)
CREATE POLICY "Authenticated Company Assets Upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'company-assets' AND auth.role() = 'authenticated' );

-- 3. Authenticated Update
CREATE POLICY "Authenticated Company Assets Update"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'company-assets' AND auth.role() = 'authenticated' );
