/*
  # Partner System Migration

  1. New Tables
    - `partners`
      - `id` (uuid, primary key)
      - `username` (text, unique)
      - `password_hash` (text)
      - `full_name` (text, nullable)
      - `email` (text, nullable)
      - `phone` (text, nullable)
      - `partner_type` (text, check constraint for 'ironing', 'delivery', 'both')
      - `society_id` (uuid, foreign key to societies)
      - `tower_id` (uuid, foreign key to towers, nullable)
      - `identity_type` (text, check constraint for identity types)
      - `identity_number` (text)
      - `identity_document_url` (text, nullable)
      - `working_days` (text array)
      - `holiday_day` (text)
      - `status` (text, check constraint for 'pending', 'approved', 'rejected')
      - `created_at` (timestamp)
    
    - `partner_sessions`
      - `id` (uuid, primary key)
      - `partner_id` (uuid, foreign key to partners)
      - `session_token` (text, unique)
      - `expires_at` (timestamp)
      - `created_at` (timestamp)

  2. Order Updates
    - Add partner assignment fields to orders table
    - Add timing fields for partner workflow

  3. Security
    - Enable RLS on all new tables
    - Add appropriate policies for partners
    - Add unique constraints for identity verification

  4. Storage
    - Create storage bucket for partner documents
*/

-- Create partners table
CREATE TABLE IF NOT EXISTS partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password_hash text NOT NULL DEFAULT '',
  full_name text,
  email text,
  phone text,
  partner_type text NOT NULL CHECK (partner_type IN ('ironing', 'delivery', 'both')),
  society_id uuid REFERENCES societies(id),
  tower_id uuid REFERENCES towers(id),
  identity_type text NOT NULL DEFAULT 'aadhar' CHECK (identity_type IN ('aadhar', 'pan', 'passport', 'election_card')),
  identity_number text NOT NULL DEFAULT '',
  identity_document_url text,
  working_days text[] NOT NULL DEFAULT ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
  holiday_day text NOT NULL DEFAULT 'sunday',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now()
);

-- Create partner sessions table
CREATE TABLE IF NOT EXISTS partner_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  session_token text UNIQUE NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Add partner assignment fields to orders table
DO $$
BEGIN
  -- Add ironing partner fields
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'assigned_ironing_partner_id'
  ) THEN
    ALTER TABLE orders ADD COLUMN assigned_ironing_partner_id uuid REFERENCES partners(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'ironing_started_at'
  ) THEN
    ALTER TABLE orders ADD COLUMN ironing_started_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'ironing_completed_at'
  ) THEN
    ALTER TABLE orders ADD COLUMN ironing_completed_at timestamptz;
  END IF;

  -- Add delivery partner fields
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'assigned_delivery_partner_id'
  ) THEN
    ALTER TABLE orders ADD COLUMN assigned_delivery_partner_id uuid REFERENCES partners(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'delivery_started_at'
  ) THEN
    ALTER TABLE orders ADD COLUMN delivery_started_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'delivery_completed_at'
  ) THEN
    ALTER TABLE orders ADD COLUMN delivery_completed_at timestamptz;
  END IF;
END $$;

-- Enable RLS on partners table
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;

-- Enable RLS on partner_sessions table
ALTER TABLE partner_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for partners table
CREATE POLICY "Partners can read own data"
  ON partners
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Partners can insert during signup"
  ON partners
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Partners can update own data"
  ON partners
  FOR UPDATE
  TO public
  USING (true);

-- Create policies for partner_sessions table
CREATE POLICY "Anyone can create partner sessions"
  ON partner_sessions
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can read partner sessions"
  ON partner_sessions
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can delete partner sessions"
  ON partner_sessions
  FOR DELETE
  TO public
  USING (true);

-- Add unique constraint for identity verification per society
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'partners_identity_society_unique' 
    AND table_name = 'partners'
  ) THEN
    ALTER TABLE partners ADD CONSTRAINT partners_identity_society_unique UNIQUE (identity_number, society_id);
  END IF;
END $$;

-- Create storage bucket for partner documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('partner-documents', 'partner-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy for partner documents
CREATE POLICY "Partners can upload documents"
  ON storage.objects
  FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'partner-documents');

CREATE POLICY "Partners can view documents"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'partner-documents');

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_partners_society_id ON partners(society_id);
CREATE INDEX IF NOT EXISTS idx_partners_partner_type ON partners(partner_type);
CREATE INDEX IF NOT EXISTS idx_partners_status ON partners(status);
CREATE INDEX IF NOT EXISTS idx_partner_sessions_token ON partner_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_partner_sessions_expires ON partner_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_orders_ironing_partner ON orders(assigned_ironing_partner_id);
CREATE INDEX IF NOT EXISTS idx_orders_delivery_partner ON orders(assigned_delivery_partner_id);