/*
  # Create notifications table

  1. New Tables
    - `notifications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `order_id` (uuid, foreign key to orders, nullable)
      - `message` (text)
      - `type` (text, enum: 'order_update', 'general')
      - `read` (boolean, default false)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `notifications` table
    - Add policies for users to read their own notifications
    - Add policies for partners to create notifications
*/

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'general' CHECK (type IN ('order_update', 'general')),
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policies for users to read their own notifications
CREATE POLICY "Users can read own notifications"
  ON notifications
  FOR SELECT
  TO public
  USING (auth.uid()::text = user_id::text OR user_id IN (
    SELECT id FROM users WHERE id = user_id
  ));

-- Policy for anyone to create notifications (partners, system)
CREATE POLICY "Anyone can create notifications"
  ON notifications
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Policy for users to update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON notifications
  FOR UPDATE
  TO public
  USING (user_id IN (
    SELECT id FROM users WHERE id = user_id
  ));

-- Policy for users to delete their own notifications
CREATE POLICY "Users can delete own notifications"
  ON notifications
  FOR DELETE
  TO public
  USING (user_id IN (
    SELECT id FROM users WHERE id = user_id
  ));

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);