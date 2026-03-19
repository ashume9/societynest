/*
  # Add user profile enhancements

  1. New Columns
    - `full_name` (text) - User's full name
    - `email` (text, unique) - User's email address

  2. Security
    - Add unique constraint on email column

  3. Notes
    - Uses IF NOT EXISTS to prevent errors on re-runs
    - Email constraint allows for future email-based features
*/

-- Add full_name column if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name text;

-- Add email column if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS email text;

-- Add unique constraint on email (will only work if constraint doesn't already exist)
-- Using a more direct approach that PostgreSQL handles better
DO $$
BEGIN
  -- Check if constraint already exists before adding
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'users_email_unique'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT users_email_unique UNIQUE (email);
  END IF;
EXCEPTION
  WHEN duplicate_table THEN
    -- Constraint already exists, ignore
    NULL;
  WHEN others THEN
    -- Re-raise any other errors
    RAISE;
END $$;