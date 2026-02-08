-- Add public visibility and hiring status columns

-- Organizations: Add is_public
ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT true;

-- Jobs: Add is_public and hiring_status
ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS hiring_status text DEFAULT 'open' CHECK (hiring_status IN ('open', 'closed'));
