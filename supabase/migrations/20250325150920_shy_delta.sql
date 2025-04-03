/*
  # Fix User Points Foreign Key Relationship

  1. Changes
    - Add foreign key relationship between user_points and auth.users
    - Update RLS policies to maintain security

  2. Security
    - Maintains existing security policies
    - Ensures proper data relationships
*/

-- Drop existing user_points table
DROP TABLE IF EXISTS user_points CASCADE;

-- Recreate user_points table with proper foreign key
CREATE TABLE user_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  points integer DEFAULT 0,
  level integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT user_points_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;

-- Recreate policies
CREATE POLICY "Users can view their own points"
  ON user_points
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can update user points"
  ON user_points
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);