-- Fix RLS policies for profiles to allow registration
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own profile
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile" ON profiles 
FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile" ON profiles 
FOR UPDATE USING (auth.uid() = id);

-- Ensure public read access (for viewing other profiles if needed, or at least for the app to work)
-- (This might already exist from 20240123_fix_public_rls.sql but reinforcing it)
DROP POLICY IF EXISTS "Public read access for profiles" ON profiles;
CREATE POLICY "Public read access for profiles" ON profiles 
FOR SELECT USING (true);

-- Function to safely register/update profile even if session is not yet fully established
CREATE OR REPLACE FUNCTION register_user_profile(
  target_id UUID,
  profile_data JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if profile exists
  IF EXISTS (SELECT 1 FROM profiles WHERE id = target_id) THEN
     -- UPDATE: Only allow if authenticated as the user (standard security)
     -- We assume that if they are updating, they should have a valid session.
     -- If auth.uid() is null (no session), we prevent update to avoid overwriting.
     IF auth.uid() = target_id THEN
       UPDATE profiles SET
         email = COALESCE(profile_data->>'email', email),
         last_name = COALESCE(profile_data->>'last_name', last_name),
         first_name = COALESCE(profile_data->>'first_name', first_name),
         full_name = COALESCE(profile_data->>'full_name', full_name),
         phone = COALESCE(profile_data->>'phone', phone),
         dob = COALESCE(profile_data->>'dob', dob),
         user_type = COALESCE(profile_data->>'user_type', user_type),
         occupation_status = COALESCE(profile_data->>'occupation_status', occupation_status),
         worker_status = profile_data->>'worker_status', -- Optional fields can be null
         company_name = profile_data->>'company_name',
         school_type = profile_data->>'school_type',
         school_name = profile_data->>'school_name',
         source_of_knowledge = profile_data->>'source_of_knowledge',
         referral_source = profile_data->>'referral_source',
         usage_purpose = profile_data->>'usage_purpose',
         updated_at = now()
       WHERE id = target_id;
     ELSE
       RAISE EXCEPTION 'Not authorized to update this profile';
     END IF;
  ELSE
     -- INSERT: Allow insertion if profile doesn't exist (Registration flow)
     -- This bypasses RLS to allow creation before email confirmation/session establishment
     INSERT INTO profiles (
       id,
       email,
       last_name,
       first_name,
       full_name,
       phone,
       dob,
       user_type,
       occupation_status,
       worker_status,
       company_name,
       school_type,
       school_name,
       source_of_knowledge,
       referral_source,
       usage_purpose
     ) VALUES (
       target_id,
       profile_data->>'email',
       profile_data->>'last_name',
       profile_data->>'first_name',
       profile_data->>'full_name',
       profile_data->>'phone',
       profile_data->>'dob',
       profile_data->>'user_type',
       profile_data->>'occupation_status',
       profile_data->>'worker_status',
       profile_data->>'company_name',
       profile_data->>'school_type',
       profile_data->>'school_name',
       profile_data->>'source_of_knowledge',
       profile_data->>'referral_source',
       profile_data->>'usage_purpose'
     );
  END IF;
END;
$$;
