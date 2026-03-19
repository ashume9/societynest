/*
  # Remove duplicate entries from all tables

  1. Clean up duplicates safely
    - Use temporary tables to identify records to keep
    - Update all foreign key references to point to kept records
    - Remove duplicates without violating constraints
  
  2. Add unique constraints
    - Prevent future duplicates
    - Ensure data integrity
*/

-- Step 1: Clean up expired sessions first
DELETE FROM user_sessions 
WHERE expires_at < NOW();

-- Step 2: Create temporary table with societies to keep (oldest for each name)
CREATE TEMP TABLE societies_to_keep AS
SELECT DISTINCT ON (name) id, name
FROM societies 
ORDER BY name, created_at ASC;

-- Step 3: Update all user references to point to kept societies
UPDATE users 
SET society_id = stk.id
FROM societies_to_keep stk
WHERE users.society_id IN (
    SELECT s.id FROM societies s 
    WHERE s.name = stk.name AND s.id != stk.id
);

-- Step 4: Create temporary table with towers to keep (oldest for each society + name)
CREATE TEMP TABLE towers_to_keep AS
SELECT DISTINCT ON (society_id, name) id, society_id, name
FROM towers 
WHERE society_id IN (SELECT id FROM societies_to_keep)
ORDER BY society_id, name, created_at ASC;

-- Step 5: Update all user references to point to kept towers
UPDATE users 
SET tower_id = ttk.id
FROM towers_to_keep ttk
WHERE users.tower_id IN (
    SELECT t.id FROM towers t 
    WHERE t.society_id = ttk.society_id 
    AND t.name = ttk.name 
    AND t.id != ttk.id
);

-- Step 6: Create temporary table with flats to keep (oldest for each tower + number)
CREATE TEMP TABLE flats_to_keep AS
SELECT DISTINCT ON (tower_id, number) id, tower_id, number
FROM flats 
WHERE tower_id IN (SELECT id FROM towers_to_keep)
ORDER BY tower_id, number, created_at ASC;

-- Step 7: Update all user references to point to kept flats
UPDATE users 
SET flat_id = ftk.id
FROM flats_to_keep ftk
WHERE users.flat_id IN (
    SELECT f.id FROM flats f 
    WHERE f.tower_id = ftk.tower_id 
    AND f.number = ftk.number 
    AND f.id != ftk.id
);

-- Step 8: Create temporary table with clothing types to keep (oldest for each name)
CREATE TEMP TABLE clothing_types_to_keep AS
SELECT DISTINCT ON (name) id, name
FROM clothing_types 
ORDER BY name, created_at ASC;

-- Step 9: Update all order item references to point to kept clothing types
UPDATE order_items 
SET clothing_type_id = cttk.id
FROM clothing_types_to_keep cttk
WHERE order_items.clothing_type_id IN (
    SELECT ct.id FROM clothing_types ct 
    WHERE ct.name = cttk.name AND ct.id != cttk.id
);

-- Step 10: Clean up any broken references by setting them to NULL
UPDATE users 
SET society_id = NULL 
WHERE society_id IS NOT NULL 
  AND society_id NOT IN (SELECT id FROM societies_to_keep);

UPDATE users 
SET tower_id = NULL 
WHERE tower_id IS NOT NULL 
  AND tower_id NOT IN (SELECT id FROM towers_to_keep);

UPDATE users 
SET flat_id = NULL 
WHERE flat_id IS NOT NULL 
  AND flat_id NOT IN (SELECT id FROM flats_to_keep);

-- Step 11: Remove orphaned records
DELETE FROM user_sessions 
WHERE user_id NOT IN (SELECT id FROM users);

DELETE FROM order_items 
WHERE order_id NOT IN (SELECT id FROM orders)
   OR clothing_type_id NOT IN (SELECT id FROM clothing_types_to_keep);

DELETE FROM orders 
WHERE user_id NOT IN (SELECT id FROM users);

-- Step 12: Now safely remove duplicate records (all references have been updated)
DELETE FROM clothing_types 
WHERE id NOT IN (SELECT id FROM clothing_types_to_keep);

DELETE FROM flats 
WHERE id NOT IN (SELECT id FROM flats_to_keep);

DELETE FROM towers 
WHERE id NOT IN (SELECT id FROM towers_to_keep);

DELETE FROM societies 
WHERE id NOT IN (SELECT id FROM societies_to_keep);

-- Step 13: Remove duplicate users (keep the oldest one for each username)
CREATE TEMP TABLE users_to_keep AS
SELECT DISTINCT ON (username) id, username
FROM users 
ORDER BY username, created_at ASC;

-- Update session references to point to kept users
UPDATE user_sessions 
SET user_id = utk.id
FROM users_to_keep utk
WHERE user_sessions.user_id IN (
    SELECT u.id FROM users u 
    WHERE u.username = utk.username AND u.id != utk.id
);

-- Update order references to point to kept users
UPDATE orders 
SET user_id = utk.id
FROM users_to_keep utk
WHERE orders.user_id IN (
    SELECT u.id FROM users u 
    WHERE u.username = utk.username AND u.id != utk.id
);

-- Remove duplicate users
DELETE FROM users 
WHERE id NOT IN (SELECT id FROM users_to_keep);

-- Step 14: Final cleanup of any remaining orphaned records
DELETE FROM user_sessions 
WHERE user_id NOT IN (SELECT id FROM users);

DELETE FROM order_items 
WHERE order_id NOT IN (SELECT id FROM orders)
   OR clothing_type_id NOT IN (SELECT id FROM clothing_types);

DELETE FROM orders 
WHERE user_id NOT IN (SELECT id FROM users);

-- Step 15: Clean up any remaining broken tower/flat references
DELETE FROM towers 
WHERE society_id NOT IN (SELECT id FROM societies);

DELETE FROM flats 
WHERE tower_id NOT IN (SELECT id FROM towers);

-- Step 16: Add unique constraints to prevent future duplicates
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

-- Step 17: Drop temporary tables
DROP TABLE IF EXISTS societies_to_keep;
DROP TABLE IF EXISTS towers_to_keep;
DROP TABLE IF EXISTS flats_to_keep;
DROP TABLE IF EXISTS clothing_types_to_keep;
DROP TABLE IF EXISTS users_to_keep;

-- Step 18: Optimize database performance
VACUUM ANALYZE societies;
VACUUM ANALYZE towers;
VACUUM ANALYZE flats;
VACUUM ANALYZE clothing_types;
VACUUM ANALYZE users;
VACUUM ANALYZE user_sessions;
VACUUM ANALYZE orders;
VACUUM ANALYZE order_items;