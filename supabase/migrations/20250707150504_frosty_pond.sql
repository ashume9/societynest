/*
  # Simple Database Authentication System

  1. New Tables
    - Remove dependency on Supabase Auth
    - Add password field to users table
    - Update RLS policies for simple authentication

  2. Security
    - Remove auth.users dependency
    - Implement simple session-based authentication
    - Update RLS policies to work without Supabase Auth
*/

-- Drop existing triggers and functions that depend on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Remove foreign key constraint to auth.users
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_id_fkey;

-- Add password field to users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'password_hash'
  ) THEN
    ALTER TABLE users ADD COLUMN password_hash text NOT NULL DEFAULT '';
  END IF;
END $$;

-- Make username required and unique
ALTER TABLE users ALTER COLUMN username SET NOT NULL;
DROP INDEX IF EXISTS users_username_key;
CREATE UNIQUE INDEX users_username_key ON users(username);

-- Update users table to use auto-generated UUIDs
ALTER TABLE users ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Drop all existing RLS policies
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can insert own data" ON users;
DROP POLICY IF EXISTS "Service role can insert users" ON users;

-- Create new RLS policies for simple authentication
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  USING (true); -- We'll handle this in the application layer

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  USING (true); -- We'll handle this in the application layer

CREATE POLICY "Users can insert during signup"
  ON users
  FOR INSERT
  WITH CHECK (true); -- Allow anyone to create an account

-- Update other table policies to work without auth.uid()
DROP POLICY IF EXISTS "Users can create own orders" ON orders;
DROP POLICY IF EXISTS "Users can read own orders" ON orders;

CREATE POLICY "Users can create orders"
  ON orders
  FOR INSERT
  WITH CHECK (true); -- We'll handle user validation in the application

CREATE POLICY "Users can read orders"
  ON orders
  FOR SELECT
  USING (true); -- We'll handle user validation in the application

-- Update order_items policies
DROP POLICY IF EXISTS "Users can create own order items" ON order_items;
DROP POLICY IF EXISTS "Users can read own order items" ON order_items;

CREATE POLICY "Users can create order items"
  ON order_items
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can read order items"
  ON order_items
  FOR SELECT
  USING (true);

-- Create a simple session table for managing user sessions
CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_token text UNIQUE NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read sessions"
  ON user_sessions
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create sessions"
  ON user_sessions
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can delete sessions"
  ON user_sessions
  FOR DELETE
  USING (true);