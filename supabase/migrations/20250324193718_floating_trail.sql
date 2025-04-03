/*
  # Waste Classification System Schema

  1. New Tables
    - `waste_reports`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `image_url` (text)
      - `classification` (text)
      - `confidence_score` (decimal)
      - `created_at` (timestamp)
      - `status` (text)
      - `recommendations` (text[])
    
    - `waste_categories`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `handling_instructions` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Users can read their own waste reports
    - Users can create new waste reports
    - Public access to waste categories (read-only)
*/

-- Create waste categories table
CREATE TABLE IF NOT EXISTS waste_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  handling_instructions text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create waste reports table
CREATE TABLE IF NOT EXISTS waste_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  image_url text NOT NULL,
  classification text NOT NULL,
  confidence_score decimal NOT NULL,
  created_at timestamptz DEFAULT now(),
  status text NOT NULL DEFAULT 'pending',
  recommendations text[] DEFAULT ARRAY[]::text[]
);

-- Enable RLS
ALTER TABLE waste_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE waste_reports ENABLE ROW LEVEL SECURITY;

-- Policies for waste_categories
CREATE POLICY "Allow public read access to waste categories"
  ON waste_categories
  FOR SELECT
  TO public
  USING (true);

-- Policies for waste_reports
CREATE POLICY "Users can create their own waste reports"
  ON waste_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own waste reports"
  ON waste_reports
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Insert initial waste categories
INSERT INTO waste_categories (name, description, handling_instructions) VALUES
  ('Recyclable', 'Materials that can be recycled and reprocessed', 'Clean and separate materials by type (paper, plastic, glass, metal). Remove any non-recyclable components.'),
  ('Hazardous', 'Dangerous materials requiring special handling', 'Do not mix with regular waste. Contact local hazardous waste facility for proper disposal instructions.'),
  ('Organic', 'Biodegradable materials suitable for composting', 'Separate from non-organic waste. Consider home composting or municipal organic waste collection.'),
  ('Non-Recyclable', 'Materials that cannot be recycled', 'Dispose in regular waste bin. Consider alternatives to reduce non-recyclable waste.'),
  ('Industrial', 'Commercial or industrial waste materials', 'Contact certified industrial waste handlers. Follow local regulations for industrial waste disposal.');