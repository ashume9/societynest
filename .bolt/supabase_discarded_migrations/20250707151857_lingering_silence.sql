/*
  # Remove duplicate entries from all tables

  1. Cleanup Operations
    - Remove duplicate societies (keep oldest by created_at)
    - Remove duplicate towers (keep oldest by created_at)
    - Remove duplicate flats (keep oldest by created_at)
    - Remove duplicate clothing types (keep oldest by created_at)
    - Remove duplicate users (keep oldest by created_at)
    - Remove orphaned sessions
    - Remove orphaned orders and order items

  2. Data Integrity
    - Ensure referential integrity after cleanup
    - Update foreign key references if needed
*/

-- Remove duplicate societies (keep the oldest one for each name)
DELETE FROM societies 
WHERE id NOT IN (
  SELECT DISTINCT ON (name) id 
  FROM societies 
  ORDER BY name, created_at ASC
);

-- Remove duplicate towers (keep the oldest one for each society_id + name combination)
DELETE FROM towers 
WHERE id NOT IN (
  SELECT DISTINCT ON (society_id, name) id 
  FROM towers 
  ORDER BY society_id, name, created_at ASC
);

-- Remove duplicate flats (keep the oldest one for each tower_id + number combination)
DELETE FROM flats 
WHERE id NOT IN (
  SELECT DISTINCT ON (tower_id, number) id 
  FROM flats 
  ORDER BY tower_id, number, created_at ASC
);

-- Remove duplicate clothing types (keep the oldest one for each name)
DELETE FROM clothing_types 
WHERE id NOT IN (
  SELECT DISTINCT ON (name) id 
  FROM clothing_types 
  ORDER BY name, created_at ASC
);

-- Remove duplicate users (keep the oldest one for each username)
DELETE FROM users 
WHERE id NOT IN (
  SELECT DISTINCT ON (username) id 
  FROM users 
  ORDER BY username, created_at ASC
);

-- Clean up orphaned user sessions (sessions without valid users)
DELETE FROM user_sessions 
WHERE user_id NOT IN (SELECT id FROM users);

-- Clean up orphaned orders (orders without valid users)
DELETE FROM orders 
WHERE user_id NOT IN (SELECT id FROM users);

-- Clean up orphaned order items (items without valid orders or clothing types)
DELETE FROM order_items 
WHERE order_id NOT IN (SELECT id FROM orders)
   OR clothing_type_id NOT IN (SELECT id FROM clothing_types);

-- Clean up expired sessions
DELETE FROM user_sessions 
WHERE expires_at < NOW();

-- Update any broken foreign key references in users table
UPDATE users 
SET society_id = NULL 
WHERE society_id IS NOT NULL 
  AND society_id NOT IN (SELECT id FROM societies);

UPDATE users 
SET tower_id = NULL 
WHERE tower_id IS NOT NULL 
  AND tower_id NOT IN (SELECT id FROM towers);

UPDATE users 
SET flat_id = NULL 
WHERE flat_id IS NOT NULL 
  AND flat_id NOT IN (SELECT id FROM flats);

-- Clean up towers with invalid society references
DELETE FROM towers 
WHERE society_id NOT IN (SELECT id FROM societies);

-- Clean up flats with invalid tower references
DELETE FROM flats 
WHERE tower_id NOT IN (SELECT id FROM towers);

-- Add constraints to prevent future duplicates
DO $$
BEGIN
  -- Add unique constraint on society name if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'societies_name_unique' 
    AND table_name = 'societies'
  ) THEN
    ALTER TABLE societies ADD CONSTRAINT societies_name_unique UNIQUE (name);
  END IF;

  -- Add unique constraint on tower name per society if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'towers_society_name_unique' 
    AND table_name = 'towers'
  ) THEN
    ALTER TABLE towers ADD CONSTRAINT towers_society_name_unique UNIQUE (society_id, name);
  END IF;

  -- Add unique constraint on flat number per tower if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'flats_tower_number_unique' 
    AND table_name = 'flats'
  ) THEN
    ALTER TABLE flats ADD CONSTRAINT flats_tower_number_unique UNIQUE (tower_id, number);
  END IF;

  -- Add unique constraint on clothing type name if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'clothing_types_name_unique' 
    AND table_name = 'clothing_types'
  ) THEN
    ALTER TABLE clothing_types ADD CONSTRAINT clothing_types_name_unique UNIQUE (name);
  END IF;
END $$;

-- Vacuum tables to reclaim space
VACUUM ANALYZE societies;
VACUUM ANALYZE towers;
VACUUM ANALYZE flats;
VACUUM ANALYZE clothing_types;
VACUUM ANALYZE users;
VACUUM ANALYZE user_sessions;
VACUUM ANALYZE orders;
VACUUM ANALYZE order_items;