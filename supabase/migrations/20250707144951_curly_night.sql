/*
  # Add sample data for societies, towers, flats, and clothing types

  1. Sample Data
    - Add sample societies
    - Add towers for each society
    - Add flats for each tower
    - Add clothing types with rates

  2. Data Structure
    - 5 societies with 3-4 towers each
    - Each tower has 20 flats (4 flats per floor, 5 floors)
    - Standard clothing types with different service rates
*/

-- Insert sample societies
INSERT INTO societies (name) VALUES
  ('Prestige Lakeside Habitat'),
  ('Brigade Cosmopolis'),
  ('Sobha City'),
  ('Godrej Platinum'),
  ('Purva Panorama')
ON CONFLICT DO NOTHING;

-- Insert towers for each society
DO $$
DECLARE
  society_record RECORD;
  tower_names TEXT[] := ARRAY['A', 'B', 'C', 'D'];
  tower_name TEXT;
BEGIN
  FOR society_record IN SELECT id FROM societies LOOP
    FOREACH tower_name IN ARRAY tower_names LOOP
      INSERT INTO towers (society_id, name) 
      VALUES (society_record.id, 'Tower ' || tower_name)
      ON CONFLICT DO NOTHING;
    END LOOP;
  END LOOP;
END $$;

-- Insert flats for each tower
DO $$
DECLARE
  tower_record RECORD;
  floor_num INTEGER;
  flat_num INTEGER;
  flat_number TEXT;
BEGIN
  FOR tower_record IN SELECT id FROM towers LOOP
    FOR floor_num IN 1..5 LOOP
      FOR flat_num IN 1..4 LOOP
        flat_number := floor_num::TEXT || LPAD(flat_num::TEXT, 2, '0');
        INSERT INTO flats (tower_id, number) 
        VALUES (tower_record.id, flat_number)
        ON CONFLICT DO NOTHING;
      END LOOP;
    END LOOP;
  END LOOP;
END $$;

-- Insert clothing types with rates
INSERT INTO clothing_types (name, normal_rate, priority_rate, express_rate) VALUES
  ('Shirt', 15, 20, 25),
  ('Trouser', 20, 25, 30),
  ('Saree', 25, 35, 45),
  ('Kurta', 18, 23, 28),
  ('Dress', 22, 27, 32),
  ('Bed Sheet', 30, 40, 50),
  ('Salwar Kameez', 20, 25, 30),
  ('Blouse', 15, 20, 25),
  ('Dupatta', 12, 17, 22),
  ('T-Shirt', 12, 17, 22)
ON CONFLICT DO NOTHING;