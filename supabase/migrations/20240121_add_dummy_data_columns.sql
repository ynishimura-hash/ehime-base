-- Add industry, is_premium, and status to organizations
ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS industry text,
ADD COLUMN IF NOT EXISTS is_premium boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));

-- Add usage-specific columns to jobs
ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS type text CHECK (type IN ('job', 'quest')) DEFAULT 'job',
ADD COLUMN IF NOT EXISTS category text, -- '新卒', '中途', 'アルバイト', '体験JOB', etc.
ADD COLUMN IF NOT EXISTS reward text, -- For quests, e.g. "¥10,000"
ADD COLUMN IF NOT EXISTS location text, -- Simplified location string
ADD COLUMN IF NOT EXISTS requirements text, -- For qualifications/requirements
ADD COLUMN IF NOT EXISTS selection_process text; -- For selection process description
