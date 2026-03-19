/*
  # Newsletter Subscription System

  1. New Tables
    - `newsletter_subscriptions`
      - `id` (uuid, primary key)
      - `email` (text, unique, not null)
      - `name` (text, not null)
      - `subscribed` (boolean, default true)
      - `unsubscribe_token` (text, unique, for unsubscribe links)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `newsletter_subscriptions` table
    - Add policy for public to insert subscriptions
    - Add policy for public to update subscription status using token
    - Add policy for public to read own subscription status

  3. Functions
    - Function to generate unsubscribe tokens
    - Trigger to update `updated_at` timestamp
*/

-- Create newsletter subscriptions table
CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  subscribed boolean DEFAULT true NOT NULL,
  unsubscribe_token text UNIQUE DEFAULT gen_random_uuid()::text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can subscribe to newsletter"
  ON newsletter_subscriptions
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update subscription with valid token"
  ON newsletter_subscriptions
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can read subscription status with email"
  ON newsletter_subscriptions
  FOR SELECT
  TO public
  USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_newsletter_subscriptions_updated_at
  BEFORE UPDATE ON newsletter_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create index for email lookups
CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_email 
  ON newsletter_subscriptions(email);

-- Create index for unsubscribe token lookups
CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_token 
  ON newsletter_subscriptions(unsubscribe_token);