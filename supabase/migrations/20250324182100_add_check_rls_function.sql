-- Create a function to check if RLS is enabled for a table
CREATE OR REPLACE FUNCTION public.check_rls_enabled(table_name text)
RETURNS boolean AS $$
DECLARE
  is_enabled boolean;
BEGIN
  SELECT relrowsecurity INTO is_enabled
  FROM pg_class
  WHERE oid = (table_name::regclass)::oid;
  RETURN is_enabled;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
