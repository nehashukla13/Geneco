/*
  # Add Community Features

  1. New Tables
    - `events`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `title` (text)
      - `description` (text)
      - `location` (text)
      - `date` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `max_participants` (integer)
      - `current_participants` (integer)
      
    - `event_participants`
      - `id` (uuid, primary key)
      - `event_id` (uuid, references events)
      - `user_id` (uuid, references auth.users)
      - `created_at` (timestamptz)
      
    - `complaints`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `title` (text)
      - `description` (text)
      - `location` (text)
      - `status` (text)
      - `upvotes` (integer)
      - `media_urls` (text[])
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      
    - `complaint_upvotes`
      - `id` (uuid, primary key)
      - `complaint_id` (uuid, references complaints)
      - `user_id` (uuid, references auth.users)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Users can read all events and complaints
    - Users can only create/update their own events and complaints
    - Users can join events if max_participants not reached
    - Users can upvote complaints once
*/

-- Create events table
CREATE TABLE events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  location text NOT NULL,
  date timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  max_participants integer NOT NULL,
  current_participants integer DEFAULT 0
);

-- Create event participants table
CREATE TABLE event_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Create complaints table
CREATE TABLE complaints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  location text NOT NULL,
  status text DEFAULT 'pending',
  upvotes integer DEFAULT 0,
  media_urls text[] DEFAULT ARRAY[]::text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create complaint upvotes table
CREATE TABLE complaint_upvotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id uuid REFERENCES complaints ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(complaint_id, user_id)
);

-- Enable RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaint_upvotes ENABLE ROW LEVEL SECURITY;

-- Events policies
CREATE POLICY "Anyone can view events"
  ON events FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can create events"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own events"
  ON events FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Event participants policies
CREATE POLICY "Anyone can view event participants"
  ON event_participants FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can join events"
  ON event_participants FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    (
      SELECT (e.current_participants < e.max_participants)
      FROM events e
      WHERE e.id = event_id
    )
  );

-- Complaints policies
CREATE POLICY "Anyone can view complaints"
  ON complaints FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can create complaints"
  ON complaints FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own complaints"
  ON complaints FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Complaint upvotes policies
CREATE POLICY "Anyone can view complaint upvotes"
  ON complaint_upvotes FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can upvote complaints once"
  ON complaint_upvotes FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    NOT EXISTS (
      SELECT 1
      FROM complaint_upvotes cu
      WHERE cu.complaint_id = complaint_upvotes.complaint_id
      AND cu.user_id = auth.uid()
    )
  );

-- Create function to update event participants count
CREATE OR REPLACE FUNCTION update_event_participants_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE events
    SET current_participants = current_participants + 1
    WHERE id = NEW.event_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE events
    SET current_participants = current_participants - 1
    WHERE id = OLD.event_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for event participants
CREATE TRIGGER update_event_participants_count
AFTER INSERT OR DELETE ON event_participants
FOR EACH ROW
EXECUTE FUNCTION update_event_participants_count();

-- Create function to update complaint upvotes count
CREATE OR REPLACE FUNCTION update_complaint_upvotes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE complaints
    SET upvotes = upvotes + 1
    WHERE id = NEW.complaint_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE complaints
    SET upvotes = upvotes - 1
    WHERE id = OLD.complaint_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for complaint upvotes
CREATE TRIGGER update_complaint_upvotes_count
AFTER INSERT OR DELETE ON complaint_upvotes
FOR EACH ROW
EXECUTE FUNCTION update_complaint_upvotes_count();