/*
  # Add delete policy for waste reports

  1. Changes
    - Add policy allowing users to delete their own waste reports

  2. Security
    - Users can only delete their own waste reports
    - Maintains data isolation between users
*/

CREATE POLICY "Users can delete their own waste reports"
  ON waste_reports
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);