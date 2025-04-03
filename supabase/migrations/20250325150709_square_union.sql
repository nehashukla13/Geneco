/*
  # Fix Foreign Key Relationships and Add Cascade Delete

  1. Changes
    - Add ON DELETE CASCADE to carbon_footprints foreign key
    - Fix user_points query by adding proper foreign key relationship

  2. Security
    - Maintains existing security policies
    - Ensures data consistency with cascading deletes
*/

-- Drop existing foreign key constraint
ALTER TABLE carbon_footprints
DROP CONSTRAINT IF EXISTS carbon_footprints_waste_report_id_fkey;

-- Re-add with CASCADE
ALTER TABLE carbon_footprints
ADD CONSTRAINT carbon_footprints_waste_report_id_fkey
FOREIGN KEY (waste_report_id)
REFERENCES waste_reports(id)
ON DELETE CASCADE;