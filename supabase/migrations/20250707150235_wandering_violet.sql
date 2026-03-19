/*
  # Fix user creation database error

  1. Changes
    - Add trigger function to automatically create user profile when auth user is created
    - Update RLS policies to allow user creation
    - Ensure proper constraints and defaults

  2. Security
    - Maintain RLS policies for data protection
    - Allow users to create their own profiles during signup
*/

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Only create profile if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = NEW.id) THEN
    INSERT INTO public.users (
      id,
      username,
      phone,
      society_id,
      tower_id,
      flat_id,
      adults,
      kids,
      pickup_slot,
      delivery_slot
    ) VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
      NEW.raw_user_meta_data->>'phone',
      (NEW.raw_user_meta_data->>'society_id')::uuid,
      (NEW.raw_user_meta_data->>'tower_id')::uuid,
      (NEW.raw_user_meta_data->>'flat_id')::uuid,
      COALESCE((NEW.raw_user_meta_data->>'adults')::integer, 2),
      COALESCE((NEW.raw_user_meta_data->>'kids')::integer, 0),
      COALESCE(NEW.raw_user_meta_data->>'pickup_slot', 'morning'),
      COALESCE(NEW.raw_user_meta_data->>'delivery_slot', 'evening')
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update RLS policies to allow user creation during signup
DROP POLICY IF EXISTS "Users can insert own data" ON users;
CREATE POLICY "Users can insert own data"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Allow service role to insert users (for the trigger)
DROP POLICY IF EXISTS "Service role can insert users" ON users;
CREATE POLICY "Service role can insert users"
  ON users
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Ensure username uniqueness constraint allows nulls
DROP INDEX IF EXISTS users_username_key;
CREATE UNIQUE INDEX users_username_key ON users(username) WHERE username IS NOT NULL;

-- Make username nullable temporarily for auto-creation
ALTER TABLE users ALTER COLUMN username DROP NOT NULL;
ALTER TABLE users ALTER COLUMN phone DROP NOT NULL;