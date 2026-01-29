-- Function to check if an email already exists in auth.users
-- Returns true if exists, false otherwise.
CREATE OR REPLACE FUNCTION check_email_exists(email_check text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER -- Access to auth.users requires elevated privileges
SET search_path = public, auth -- Ensure secure search path
AS $$
BEGIN
  -- Check email case-insensitively
  RETURN EXISTS (SELECT 1 FROM auth.users WHERE email = lower(email_check) OR email = email_check);
END;
$$;

-- Grant execute permission to public (or anon/authenticated)
GRANT EXECUTE ON FUNCTION check_email_exists(text) TO anon, authenticated, service_role;
