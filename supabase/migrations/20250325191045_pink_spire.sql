/*
  # Fix User Points Foreign Key Relationship

  1. Changes
    - Drop and recreate user_points table with correct foreign key to auth.users
    - Recreate policies and triggers
    - Ensure proper cascade behavior

  2. Security
    - Maintains existing security policies
    - Ensures proper data relationships
*/

-- Drop existing table and related objects
DROP TABLE IF EXISTS user_points CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Create user_points table with correct foreign key
CREATE TABLE user_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  points integer DEFAULT 0,
  level integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;

-- Create policies
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
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();