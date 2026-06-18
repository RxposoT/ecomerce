-- Add INSERT policy for profiles so the trigger can work
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Also add a service role override to ensure trigger works
ALTER FUNCTION public.handle_new_user() SECURITY DEFINER;
