-- Create user_analysis table to store diagnosis and value card results
CREATE TABLE IF NOT EXISTS user_analysis (
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  diagnosis_scores jsonb DEFAULT '{}'::jsonb,
  selected_values integer[] DEFAULT '{}',
  public_values integer[] DEFAULT '{}',
  is_fortune_integrated boolean DEFAULT true,
  fortune_traits text[] DEFAULT '{}',
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE user_analysis ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own analysis" ON user_analysis FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own analysis" ON user_analysis FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own analysis" ON user_analysis FOR UPDATE USING (auth.uid() = user_id);

-- Managers/Admins policies (optional, for viewing candidate data)
CREATE POLICY "Admins can view all analysis" ON user_analysis FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'admin')
);

CREATE POLICY "Companies can view analysis of applicants" ON user_analysis FOR SELECT USING (
    -- This is a simplified policy. In a real scenario, you'd check if the user has applied to the company.
    -- For now, we might allow companies to view public values if user permits, but let's stick to basic own-view for now.
    -- Or if persistence is strictly personal for now:
    auth.uid() = user_id
);
