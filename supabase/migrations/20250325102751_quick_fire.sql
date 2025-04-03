/*
  # Add Gamification and Carbon Footprint Features

  1. New Tables
    - `user_points`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `points` (integer)
      - `level` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `point_transactions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `points` (integer)
      - `reason` (text)
      - `created_at` (timestamp)

    - `carbon_footprints`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `waste_report_id` (uuid, references waste_reports)
      - `carbon_impact` (decimal)
      - `reduction_suggestions` (text[])
      - `created_at` (timestamp)

  2. Changes to existing tables
    - Add `points_earned` column to waste_reports
    - Add `carbon_footprint` column to waste_reports

  3. Security
    - Enable RLS on all new tables
    - Users can only read and modify their own data
*/

-- Add new columns to waste_reports
ALTER TABLE waste_reports 
ADD COLUMN points_earned integer DEFAULT 0,
ADD COLUMN carbon_footprint decimal DEFAULT 0;

-- Create user_points table
CREATE TABLE user_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  points integer DEFAULT 0,
  level integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Create point_transactions table
CREATE TABLE point_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  points integer NOT NULL,
  reason text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create carbon_footprints table
CREATE TABLE carbon_footprints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  waste_report_id uuid REFERENCES waste_reports NOT NULL,
  carbon_impact decimal NOT NULL,
  reduction_suggestions text[] DEFAULT ARRAY[]::text[],
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE carbon_footprints ENABLE ROW LEVEL SECURITY;

-- Policies for user_points
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

-- Policies for point_transactions
CREATE POLICY "Users can view their point transactions"
  ON point_transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can create point transactions"
  ON point_transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policies for carbon_footprints
CREATE POLICY "Users can view their carbon footprints"
  ON carbon_footprints
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can create carbon footprints"
  ON carbon_footprints
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);