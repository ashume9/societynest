/*
  # Add full name and email to users table

  1. Schema Changes
    - Add `full_name` column to users table (text, nullable)
    - Add `email` column to users table (text, unique, nullable)
    - Add unique constraint on email when not null

  2. Security
    - Maintain existing RLS policies
    - No changes to authentication flow

  3. Notes
    - Email is optional to maintain backward compatibility
    - Full name is optional to allow gradual profile completion
*/

-- Add full_name column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'full_name'
  ) THEN
    ALTER TABLE users ADD COLUMN full_name text;
  END IF;
END $$;

-- Add email column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'email'
  ) THEN
    ALTER TABLE users ADD COLUMN email text;
  END IF;
END $$;

-- Add unique constraint on email (only when not null)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'users' AND constraint_name = 'users_email_unique'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT users_email_unique UNIQUE (email);
  END IF;
END $$;