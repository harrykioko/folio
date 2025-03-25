# Apply Migrations in Supabase Studio

Follow these steps to apply the migrations to fix the errors:

1. Open Supabase Studio at http://localhost:54323 
2. Go to the SQL Editor
3. Create a new query and paste the following SQL to add the missing user profile function:

```sql
-- Create the RPC function to get a user profile safely
CREATE OR REPLACE FUNCTION public.get_user_profile(user_id UUID)
RETURNS public.profiles
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    profile_record public.profiles;
BEGIN
    -- Get the profile for the given user_id
    SELECT * INTO profile_record
    FROM public.profiles
    WHERE id = user_id;
    
    -- If no profile found, return NULL
    IF profile_record IS NULL THEN
        RAISE EXCEPTION 'No profile found for user %', user_id;
    END IF;
    
    RETURN profile_record;
END;
$$;
```

4. Run the query and verify it's successful
5. Create another query and paste the following SQL to fix the company_settings table:

```sql
-- Add user_id column to company_settings table
ALTER TABLE public.company_settings
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update existing records to set user_id = created_by
UPDATE public.company_settings
SET user_id = created_by
WHERE user_id IS NULL AND created_by IS NOT NULL;

-- Add unique constraint on user_id to ensure only one company setting per user
ALTER TABLE public.company_settings 
ADD CONSTRAINT IF NOT EXISTS company_settings_user_id_key UNIQUE (user_id);
```

6. Run the query and verify it's successful
7. Restart your Vite development server
