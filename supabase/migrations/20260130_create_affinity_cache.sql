-- Create table to cache AI affinity analysis results
CREATE TABLE IF NOT EXISTS user_course_affinity (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id text NOT NULL, -- course id is text in current appStore/mock implementation?, assuming text based on route params
  score integer,
  title text,
  reason text,
  career_benefit text,
  match_details jsonb, -- structured details: { strength: "Curiosity", course_feature: "Exploratory Modules", explanation: "..." }
  analyzed_at timestamptz DEFAULT now(),
  
  UNIQUE(user_id, course_id)
);

-- Enable RLS
ALTER TABLE user_course_affinity ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own affinity data"
  ON user_course_affinity FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own affinity data"
  ON user_course_affinity FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own affinity data"
  ON user_course_affinity FOR UPDATE
  USING (auth.uid() = user_id);
