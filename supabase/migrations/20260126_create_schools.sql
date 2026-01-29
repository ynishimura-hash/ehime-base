-- Create schools table for autocomplete
CREATE TABLE IF NOT EXISTS schools (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  type text CHECK (type IN ('junior_high', 'high_school', 'university', 'vocational', 'other')),
  prefecture text DEFAULT '愛媛県',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;

-- Allow read access to authenticated users and anonymous users (for registration)
CREATE POLICY "Schools are viewable by everyone" 
ON schools FOR SELECT 
USING (true);

-- Seed some initial data for demo purposes (Ehime specific)
INSERT INTO schools (name, type) VALUES
('愛媛大学', 'university'),
('松山大学', 'university'),
('聖カタリナ大学', 'university'),
('松山東雲女子大学', 'university'),
('愛媛県立医療技術大学', 'university'),
('河原デザイン・アート専門学校', 'vocational'),
('河原電子ビジネス専門学校', 'vocational'),
('松山東高等学校', 'high_school'),
('松山南高等学校', 'high_school'),
('松山北高等学校', 'high_school'),
('松山中央高等学校', 'high_school'),
('愛光高等学校', 'high_school'),
('新田高等学校', 'high_school'),
('済美高等学校', 'high_school');
