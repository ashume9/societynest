/*
  # Update partner default status to approved

  1. Changes
    - Change default status for partners table from 'pending' to 'approved'
    - This allows partners to login immediately after registration without manual approval

  2. Security
    - Maintains existing check constraint for valid status values
    - No changes to RLS policies
*/

-- Update the default value for status column in partners table
ALTER TABLE partners ALTER COLUMN status SET DEFAULT 'approved';

-- Update any existing pending partners to approved status
UPDATE partners SET status = 'approved' WHERE status = 'pending';