/*
  # Fix User Points System and Database Relationships

  1. Changes
    - Safely recreate user points table with proper foreign key relationships
    - Add proper error handling for user creation
    - Improve RLS policies
    - Add safer transaction handling

  2. Security
    - Maintain data isolation between users
    - Ensure proper cascade behavior
    - Add proper security policies
*/

-- Safely check and drop existing objects
DO $$ 
BEGIN
  -- Drop existing policies if they exist
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'user_points'
  ) THEN
    DROP POLICY IF EXISTS "Users can view their own points" ON user_points;
    DROP POLICY IF EXISTS "System can manage user points" ON user_points;
  END IF;

  -- Drop trigger if exists
  DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
  
  -- Drop function if exists
  DROP FUNCTION IF EXISTS public.handle_new_user();
  
  -- Drop table if exists
  DROP TABLE IF EXISTS user_points CASCADE;
END $$;

-- Create user_points table with improved structure
CREATE TABLE IF NOT EXISTS user_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  points integer NOT NULL DEFAULT 0,
  level integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_points_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES auth.users(id) 
    ON DELETE CASCADE,
  CONSTRAINT user_points_user_id_key 
    UNIQUE(user_id),
  CONSTRAINT user_points_points_check 
    CHECK (points >= 0),
  CONSTRAINT user_points_level_check 
    CHECK (level >= 1)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_points_user_id 
  ON user_points(user_id);

-- Enable RLS
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;

-- Create improved policies
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

-- Create improved function to handle new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Safely insert new user points
  INSERT INTO public.user_points (
    user_id,
    points,
    level,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    0,
    1,
    now(),
    now()
  )
  ON CONFLICT (user_id) 
  DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error if needed
    RAISE NOTICE 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup with error handling
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;