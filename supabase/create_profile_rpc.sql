-- Create an RPC function to create user profiles bypassing RLS
-- This will be called by the auth hook when a user needs a profile created
-- and will allow profile creation even with restrictive RLS policies

CREATE OR REPLACE FUNCTION public.create_user_profile(profile_data JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- This bypasses RLS policies
AS $$
DECLARE
  new_profile JSONB;
BEGIN
  -- Insert the profile data
  INSERT INTO public.profiles (
    id,
    first_name,
    last_name,
    role,
    created_at
  ) VALUES (
    (profile_data->>'id')::UUID,
    profile_data->>'first_name',
    profile_data->>'last_name',
    profile_data->>'role',
    COALESCE((profile_data->>'created_at')::TIMESTAMP, NOW())
  )
  ON CONFLICT (id) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name
  RETURNING to_jsonb(profiles.*) INTO new_profile;
  
  RETURN new_profile;
EXCEPTION WHEN OTHERS THEN
  RAISE EXCEPTION 'Error creating profile: %', SQLERRM;
END;
$$;

-- Set permissions for the function
GRANT EXECUTE ON FUNCTION public.create_user_profile(JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_user_profile(JSONB) TO anon;
