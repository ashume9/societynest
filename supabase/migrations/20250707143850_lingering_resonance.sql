/*
  # Society SuperApp - Ironing Service Database Schema

  1. New Tables
    - `societies` - List of societies/complexes
    - `towers` - Towers within each society
    - `flats` - Flat numbers within each tower
    - `users` - User accounts with profile information
    - `clothing_types` - Types of clothing items with rates
    - `orders` - Ironing service orders
    - `order_items` - Individual items within each order

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Admin policies for managing societies, towers, flats, and clothing types

  3. Sample Data
    - Pre-populate societies, towers, flats, and clothing types
*/

-- Create societies table
CREATE TABLE IF NOT EXISTS societies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create towers table
CREATE TABLE IF NOT EXISTS towers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id uuid REFERENCES societies(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create flats table
CREATE TABLE IF NOT EXISTS flats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tower_id uuid REFERENCES towers(id) ON DELETE CASCADE,
  number text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  phone text NOT NULL,
  society_id uuid REFERENCES societies(id),
  tower_id uuid REFERENCES towers(id),
  flat_id uuid REFERENCES flats(id),
  adults integer DEFAULT 2,
  kids integer DEFAULT 0,
  pickup_slot text DEFAULT 'morning' CHECK (pickup_slot IN ('morning', 'evening')),
  delivery_slot text DEFAULT 'evening' CHECK (delivery_slot IN ('morning', 'evening')),
  created_at timestamptz DEFAULT now()
);

-- Create clothing types table
CREATE TABLE IF NOT EXISTS clothing_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  normal_rate integer NOT NULL,
  priority_rate integer NOT NULL,
  express_rate integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  pickup_date date NOT NULL,
  pickup_slot text NOT NULL CHECK (pickup_slot IN ('morning', 'evening')),
  service_type text NOT NULL CHECK (service_type IN ('normal', 'priority', 'express')),
  total_amount integer NOT NULL,
  estimated_delivery timestamptz NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'picked_up', 'in_progress', 'ready', 'delivered')),
  created_at timestamptz DEFAULT now()
);

-- Create order items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  clothing_type_id uuid REFERENCES clothing_types(id),
  quantity integer NOT NULL,
  rate integer NOT NULL,
  subtotal integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE societies ENABLE ROW LEVEL SECURITY;
ALTER TABLE towers ENABLE ROW LEVEL SECURITY;
ALTER TABLE flats ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clothing_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Policies for societies (read-only for authenticated users)
CREATE POLICY "Anyone can read societies"
  ON societies
  FOR SELECT
  TO authenticated
  USING (true);

-- Policies for towers (read-only for authenticated users)
CREATE POLICY "Anyone can read towers"
  ON towers
  FOR SELECT
  TO authenticated
  USING (true);

-- Policies for flats (read-only for authenticated users)
CREATE POLICY "Anyone can read flats"
  ON flats
  FOR SELECT
  TO authenticated
  USING (true);

-- Policies for users
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own data"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policies for clothing types (read-only for authenticated users)
CREATE POLICY "Anyone can read clothing types"
  ON clothing_types
  FOR SELECT
  TO authenticated
  USING (true);

-- Policies for orders
CREATE POLICY "Users can read own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Policies for order items
CREATE POLICY "Users can read own order items"
  ON order_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own order items"
  ON order_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

-- Insert sample societies
INSERT INTO societies (name) VALUES
  ('Prestige Lakeside Habitat'),
  ('Brigade Cosmopolis'),
  ('Sobha City'),
  ('Godrej Platinum'),
  ('Purva Panorama'),
  ('Mantri Espana'),
  ('Embassy Boulevard'),
  ('Salarpuria Sattva')
ON CONFLICT DO NOTHING;

-- Insert sample towers for each society
DO $$
DECLARE
  society_record RECORD;
  tower_names text[] := ARRAY['A', 'B', 'C', 'D', 'E'];
  tower_name text;
BEGIN
  FOR society_record IN SELECT id FROM societies LOOP
    FOREACH tower_name IN ARRAY tower_names LOOP
      INSERT INTO towers (society_id, name) 
      VALUES (society_record.id, 'Tower ' || tower_name)
      ON CONFLICT DO NOTHING;
    END LOOP;
  END LOOP;
END $$;

-- Insert sample flats for each tower
DO $$
DECLARE
  tower_record RECORD;
  floor_num integer;
  flat_num integer;
  flat_number text;
BEGIN
  FOR tower_record IN SELECT id FROM towers LOOP
    FOR floor_num IN 1..20 LOOP
      FOR flat_num IN 1..4 LOOP
        flat_number := LPAD(floor_num::text, 2, '0') || flat_num::text;
        INSERT INTO flats (tower_id, number) 
        VALUES (tower_record.id, flat_number)
        ON CONFLICT DO NOTHING;
      END LOOP;
    END LOOP;
  END LOOP;
END $$;

-- Insert clothing types with rates
INSERT INTO clothing_types (name, normal_rate, priority_rate, express_rate) VALUES
  ('Shirt', 15, 20, 30),
  ('Trouser', 20, 25, 35),
  ('Saree', 25, 35, 50),
  ('Salwar Kameez', 22, 30, 45),
  ('Kurta', 18, 25, 35),
  ('Dress', 22, 30, 45),
  ('Bedsheet', 30, 40, 60),
  ('Pillowcase', 10, 15, 25),
  ('T-Shirt', 12, 18, 28),
  ('Jeans', 25, 35, 50)
ON CONFLICT DO NOTHING;