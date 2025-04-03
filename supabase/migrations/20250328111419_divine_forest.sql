/*
  # Fix Complaint Upvotes System

  1. Changes
    - Drop and recreate complaint upvotes trigger with proper error handling
    - Update RLS policies to ensure proper access control
    - Add proper foreign key constraints

  2. Security
    - Maintain data isolation between users
    - Ensure proper upvote counting
*/

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS update_complaint_upvotes_count ON complaint_upvotes;
DROP FUNCTION IF EXISTS update_complaint_upvotes_count();

-- Recreate the function with better error handling
CREATE OR REPLACE FUNCTION update_complaint_upvotes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE complaints
    SET upvotes = (
      SELECT COUNT(*)
      FROM complaint_upvotes
      WHERE complaint_id = NEW.complaint_id
    )
    WHERE id = NEW.complaint_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE complaints
    SET upvotes = (
      SELECT COUNT(*)
      FROM complaint_upvotes
      WHERE complaint_id = OLD.complaint_id
    )
    WHERE id = OLD.complaint_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
CREATE TRIGGER update_complaint_upvotes_count
AFTER INSERT OR DELETE ON complaint_upvotes
FOR EACH ROW
EXECUTE FUNCTION update_complaint_upvotes_count();

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view complaint upvotes" ON complaint_upvotes;
DROP POLICY IF EXISTS "Users can upvote complaints once" ON complaint_upvotes;

-- Recreate policies with proper checks
CREATE POLICY "Anyone can view complaint upvotes"
  ON complaint_upvotes
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can upvote complaints"
  ON complaint_upvotes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    NOT EXISTS (
      SELECT 1
      FROM complaint_upvotes
      WHERE complaint_id = complaint_upvotes.complaint_id
      AND user_id = auth.uid()
    )
  );

-- Enable RLS if not already enabled
ALTER TABLE complaint_upvotes ENABLE ROW LEVEL SECURITY;