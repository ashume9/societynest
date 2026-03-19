/*
  # Remove Duplicate Entries Migration

  This migration removes all duplicate entries from the database while properly handling foreign key constraints.

  ## Changes Made:
  1. **Clean up references first** - Update/delete child records before parent records
  2. **Remove duplicates** - Keep oldest record for each unique combination
  3. **Add unique constraints** - Prevent future duplicates
  4. **Optimize database** - Vacuum and analyze tables

  ## Tables Affected:
  - societies (remove duplicate names)
  - towers (remove duplicate society_id + name combinations)
  - flats (remove duplicate tower_id + number combinations)
  - clothing_types (remove duplicate names)
  - users (remove duplicate usernames)
  - user_sessions (clean up orphaned and expired sessions)
  - orders (clean up orphaned orders)
  - order_items (clean up orphaned items)
*/

-- Step 1: Clean up expired sessions first
DELETE FROM user_sessions 
WHERE expires_at < NOW();

-- Step 2: Identify duplicate societies and update user references
DO $$
DECLARE
    duplicate_society_ids uuid[];
BEGIN
    -- Get IDs of duplicate societies (keep the oldest one for each name)
    SELECT ARRAY(
        SELECT id FROM societies 
        WHERE id NOT IN (
            SELECT DISTINCT ON (name) id 
            FROM societies 
            ORDER BY name, created_at ASC
        )
    ) INTO duplicate_society_ids;
    
    -- Update users to point to the kept society record
    UPDATE users 
    SET society_id = (
        SELECT DISTINCT ON (s.name) s.id 
        FROM societies s 
        WHERE s.name = (
            SELECT name FROM societies ds WHERE ds.id = users.society_id
        )
        ORDER BY s.name, s.created_at ASC
    )
    WHERE society_id = ANY(duplicate_society_ids);
END $$;

-- Step 3: Identify duplicate towers and update user references
DO $$
DECLARE
    duplicate_tower_ids uuid[];
BEGIN
    -- Get IDs of duplicate towers (keep the oldest one for each society_id + name combination)
    SELECT ARRAY(
        SELECT id FROM towers 
        WHERE id NOT IN (
            SELECT DISTINCT ON (society_id, name) id 
            FROM towers 
            ORDER BY society_id, name, created_at ASC
        )
    ) INTO duplicate_tower_ids;
    
    -- Update users to point to the kept tower record
    UPDATE users 
    SET tower_id = (
        SELECT DISTINCT ON (t.society_id, t.name) t.id 
        FROM towers t 
        WHERE t.society_id = (
            SELECT society_id FROM towers dt WHERE dt.id = users.tower_id
        )
        AND t.name = (
            SELECT name FROM towers dt WHERE dt.id = users.tower_id
        )
        ORDER BY t.society_id, t.name, t.created_at ASC
    )
    WHERE tower_id = ANY(duplicate_tower_ids);
END $$;

-- Step 4: Identify duplicate flats and update user references
DO $$
DECLARE
    duplicate_flat_ids uuid[];
BEGIN
    -- Get IDs of duplicate flats (keep the oldest one for each tower_id + number combination)
    SELECT ARRAY(
        SELECT id FROM flats 
        WHERE id NOT IN (
            SELECT DISTINCT ON (tower_id, number) id 
            FROM flats 
            ORDER BY tower_id, number, created_at ASC
        )
    ) INTO duplicate_flat_ids;
    
    -- Update users to point to the kept flat record
    UPDATE users 
    SET flat_id = (
        SELECT DISTINCT ON (f.tower_id, f.number) f.id 
        FROM flats f 
        WHERE f.tower_id = (
            SELECT tower_id FROM flats df WHERE df.id = users.flat_id
        )
        AND f.number = (
            SELECT number FROM flats df WHERE df.id = users.flat_id
        )
        ORDER BY f.tower_id, f.number, f.created_at ASC
    )
    WHERE flat_id = ANY(duplicate_flat_ids);
END $$;

-- Step 5: Identify duplicate clothing types and update order item references
DO $$
DECLARE
    duplicate_clothing_type_ids uuid[];
BEGIN
    -- Get IDs of duplicate clothing types (keep the oldest one for each name)
    SELECT ARRAY(
        SELECT id FROM clothing_types 
        WHERE id NOT IN (
            SELECT DISTINCT ON (name) id 
            FROM clothing_types 
            ORDER BY name, created_at ASC
        )
    ) INTO duplicate_clothing_type_ids;
    
    -- Update order items to point to the kept clothing type record
    UPDATE order_items 
    SET clothing_type_id = (
        SELECT DISTINCT ON (ct.name) ct.id 
        FROM clothing_types ct 
        WHERE ct.name = (
            SELECT name FROM clothing_types dct WHERE dct.id = order_items.clothing_type_id
        )
        ORDER BY ct.name, ct.created_at ASC
    )
    WHERE clothing_type_id = ANY(duplicate_clothing_type_ids);
END $$;

-- Step 6: Clean up orphaned records before removing duplicates
DELETE FROM user_sessions 
WHERE user_id NOT IN (SELECT id FROM users);

DELETE FROM order_items 
WHERE order_id NOT IN (SELECT id FROM orders)
   OR clothing_type_id NOT IN (SELECT id FROM clothing_types);

DELETE FROM orders 
WHERE user_id NOT IN (SELECT id FROM users);

-- Step 7: Update any remaining broken foreign key references
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

-- Step 8: Remove duplicate records (now safe to do so)
DELETE FROM clothing_types 
WHERE id NOT IN (
    SELECT DISTINCT ON (name) id 
    FROM clothing_types 
    ORDER BY name, created_at ASC
);

DELETE FROM flats 
WHERE id NOT IN (
    SELECT DISTINCT ON (tower_id, number) id 
    FROM flats 
    ORDER BY tower_id, number, created_at ASC
);

DELETE FROM towers 
WHERE id NOT IN (
    SELECT DISTINCT ON (society_id, name) id 
    FROM towers 
    ORDER BY society_id, name, created_at ASC
);

DELETE FROM societies 
WHERE id NOT IN (
    SELECT DISTINCT ON (name) id 
    FROM societies 
    ORDER BY name, created_at ASC
);

-- Step 9: Remove duplicate users (keep the oldest one for each username)
DELETE FROM users 
WHERE id NOT IN (
    SELECT DISTINCT ON (username) id 
    FROM users 
    ORDER BY username, created_at ASC
);

-- Step 10: Final cleanup of any remaining orphaned records
DELETE FROM user_sessions 
WHERE user_id NOT IN (SELECT id FROM users);

DELETE FROM order_items 
WHERE order_id NOT IN (SELECT id FROM orders)
   OR clothing_type_id NOT IN (SELECT id FROM clothing_types);

DELETE FROM orders 
WHERE user_id NOT IN (SELECT id FROM users);

-- Step 11: Clean up any remaining broken references
DELETE FROM towers 
WHERE society_id NOT IN (SELECT id FROM societies);

DELETE FROM flats 
WHERE tower_id NOT IN (SELECT id FROM towers);

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

-- Step 12: Add constraints to prevent future duplicates
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

-- Step 13: Optimize database performance
VACUUM ANALYZE societies;
VACUUM ANALYZE towers;
VACUUM ANALYZE flats;
VACUUM ANALYZE clothing_types;
VACUUM ANALYZE users;
VACUUM ANALYZE user_sessions;
VACUUM ANALYZE orders;
VACUUM ANALYZE order_items;