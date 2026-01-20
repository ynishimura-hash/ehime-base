-- Add detailed fields to organizations (companies) table
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS representative_name text,
ADD COLUMN IF NOT EXISTS established_date text, -- Text allows flexibility "YYYY年MM月"
ADD COLUMN IF NOT EXISTS employee_count text,
ADD COLUMN IF NOT EXISTS capital text,
ADD COLUMN IF NOT EXISTS business_content text,
ADD COLUMN IF NOT EXISTS phone text;

-- Add detailed fields to jobs table
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS salary text, -- e.g., "月給 25万円〜"
ADD COLUMN IF NOT EXISTS employment_type text, -- e.g., "正社員"
ADD COLUMN IF NOT EXISTS working_hours text, -- e.g., "9:00 - 18:00"
ADD COLUMN IF NOT EXISTS holidays text, -- e.g., "土日祝"
ADD COLUMN IF NOT EXISTS benefits text, -- e.g., "社会保険完備, 交通費支給"
ADD COLUMN IF NOT EXISTS qualifications text, -- e.g., "要普通免許"
ADD COLUMN IF NOT EXISTS access text; -- e.g., "松山市駅から徒歩5分"
