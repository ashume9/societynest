/*
  # Update partner status default value

  1. Changes
    - Change default status for partners from 'pending' to 'approved'
    - This allows partners to be automatically approved upon registration

  2. Security
    - Maintains existing check constraint for valid status values
    - No changes to RLS policies
*/

-- Update the default value for the status column in partners table
ALTER TABLE partners ALTER COLUMN status SET DEFAULT 'approved';