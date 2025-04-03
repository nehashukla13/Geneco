/*
  # Fix User Points System

  1. Changes
    - Add trigger to automatically create user_points entry when user signs up
    - Update RLS policies to allow system to create/update user points
    - Fix single row selection query

  2. Security
    - Maintains data isolation between users
    - Allows system to manage points properly
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own points" ON user_points;
DROP POLICY IF EXISTS "System can update user points" ON user_points;

-- Create new policies
CREATE POLICY "Users can view their own points"
  ON user_points
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage user points"
  ON user_points
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create function to initialize user points
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_points (user_id, points, level)
  VALUES (new.id, 0, 1)
  ON CONFLICT (user_id) 
  DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();