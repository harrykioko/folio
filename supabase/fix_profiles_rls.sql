-- Step 1: Make sure RLS is enabled on the profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Step 2: Add policies for the profiles table
-- Allow users to insert their own profile (for new users)
CREATE POLICY "Users can create their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Allow users to view their own profile
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile" 
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);

-- Allow users to view other profiles (needed for assignee info in tasks)
CREATE POLICY "Users can view all profiles"
ON public.profiles
FOR SELECT
USING (auth.role() = 'authenticated');
