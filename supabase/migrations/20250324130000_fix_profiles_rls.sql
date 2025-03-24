-- Fix infinite recursion in profiles RLS policy
CREATE OR REPLACE FUNCTION public.get_user_profile(user_id uuid)
RETURNS SETOF profiles
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM profiles WHERE id = user_id;
$$;

CREATE OR REPLACE FUNCTION public.create_user_profile(profile_data jsonb)
RETURNS profiles
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO profiles (id, first_name, last_name, role, created_at)
  VALUES (
    (profile_data->>'id')::uuid,
    profile_data->>'first_name',
    profile_data->>'last_name',
    profile_data->>'role',
    (profile_data->>'created_at')::timestamptz
  )
  RETURNING *;
END;
$$;
