/*
  # Add Authority Tracking for Complaints

  1. Changes
    - Add authority notification tracking to complaints table
    - Add authority status tracking
    - Add authority updates tracking
    - Add authority location tracking

  2. Security
    - Maintain existing RLS policies
    - Allow updates for authority status fields
*/

-- Add new columns to complaints table
ALTER TABLE complaints
ADD COLUMN authority_notified boolean DEFAULT false,
ADD COLUMN authority_status text DEFAULT 'pending',
ADD COLUMN authority_updates text[] DEFAULT ARRAY[]::text[],
ADD COLUMN authority_location jsonb;

-- Update existing policies to allow authority status updates
CREATE POLICY "System can update authority status"
  ON complaints
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);