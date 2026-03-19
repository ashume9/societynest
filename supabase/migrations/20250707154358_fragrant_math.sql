/*
  # Add user profile enhancements

  1. New Columns
    - `full_name` (text) - User's full name
    - `email` (text) - User's email address with unique constraint
  
  2. Security
    - Add unique constraint on email column to prevent duplicates
  
  3. Notes
    - Uses safe column addition with existence checks
    - Constraint added separately to avoid visibility issues
*/

-- Add full_name column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'full_name'
  ) THEN
    ALTER TABLE users ADD COLUMN full_name text;
  END IF;
END $$;

-- Add email column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'email'
  ) THEN
    ALTER TABLE users ADD COLUMN email text;
  END IF;
END $$;

-- Add unique constraint on email if it doesn't exist
-- This is done separately to ensure the column is visible
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'users' AND constraint_name = 'users_email_unique'
  ) THEN
    -- Only add constraint if email column exists
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'users' AND column_name = 'email'
    ) THEN
      ALTER TABLE users ADD CONSTRAINT users_email_unique UNIQUE (email);
    END IF;
  END IF;
END $$;