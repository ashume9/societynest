/*
  # Fix Society Data Access

  1. Security Updates
    - Update RLS policies for societies, towers, and flats tables
    - Allow public read access to location data
    - Ensure proper data visibility for profile setup

  2. Data Access
    - Enable read access for societies, towers, and flats
    - Remove restrictive policies that prevent data loading
*/

-- Update societies table policies
DROP POLICY IF EXISTS "Anyone can read societies" ON societies;
CREATE POLICY "Public can read societies"
  ON societies
  FOR SELECT
  TO public
  USING (true);

-- Update towers table policies  
DROP POLICY IF EXISTS "Anyone can read towers" ON towers;
CREATE POLICY "Public can read towers"
  ON towers
  FOR SELECT
  TO public
  USING (true);

-- Update flats table policies
DROP POLICY IF EXISTS "Anyone can read flats" ON flats;
CREATE POLICY "Public can read flats"
  ON flats
  FOR SELECT
  TO public
  USING (true);

-- Update clothing_types table policies
DROP POLICY IF EXISTS "Anyone can read clothing types" ON clothing_types;
CREATE POLICY "Public can read clothing types"
  ON clothing_types
  FOR SELECT
  TO public
  USING (true);

-- Ensure RLS is enabled but allows public read access
ALTER TABLE societies ENABLE ROW LEVEL SECURITY;
ALTER TABLE towers ENABLE ROW LEVEL SECURITY;
ALTER TABLE flats ENABLE ROW LEVEL SECURITY;
ALTER TABLE clothing_types ENABLE ROW LEVEL SECURITY;

-- Insert some sample data if tables are empty
INSERT INTO societies (name) VALUES 
  ('Green Valley Society'),
  ('Sunrise Apartments'),
  ('Royal Gardens')
ON CONFLICT DO NOTHING;

-- Get society IDs for sample data
DO $$
DECLARE
  green_valley_id uuid;
  sunrise_id uuid;
  royal_gardens_id uuid;
BEGIN
  SELECT id INTO green_valley_id FROM societies WHERE name = 'Green Valley Society' LIMIT 1;
  SELECT id INTO sunrise_id FROM societies WHERE name = 'Sunrise Apartments' LIMIT 1;
  SELECT id INTO royal_gardens_id FROM societies WHERE name = 'Royal Gardens' LIMIT 1;

  -- Insert towers
  INSERT INTO towers (society_id, name) VALUES 
    (green_valley_id, 'Tower A'),
    (green_valley_id, 'Tower B'),
    (sunrise_id, 'Block 1'),
    (sunrise_id, 'Block 2'),
    (royal_gardens_id, 'Wing A'),
    (royal_gardens_id, 'Wing B')
  ON CONFLICT DO NOTHING;

  -- Insert flats for each tower
  INSERT INTO flats (tower_id, number)
  SELECT t.id, flat_num::text
  FROM towers t
  CROSS JOIN generate_series(101, 110) AS flat_num
  ON CONFLICT DO NOTHING;
END $$;

-- Insert clothing types if not exists
INSERT INTO clothing_types (name, normal_rate, priority_rate, express_rate) VALUES
  ('Shirt', 15, 20, 25),
  ('T-Shirt', 12, 16, 20),
  ('Pants', 20, 25, 30),
  ('Jeans', 25, 30, 35),
  ('Dress', 30, 40, 50),
  ('Saree', 40, 50, 60),
  ('Kurta', 25, 30, 35),
  ('Blouse', 20, 25, 30)
ON CONFLICT DO NOTHING;