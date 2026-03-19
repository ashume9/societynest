/*
  # Add Test Partner for Ramu

  1. New Data
    - Create a test partner with username 'ramu_partner'
    - Create a partner session for easy testing
    - Assign to first available society and tower

  2. Purpose
    - Provide a test account for partner dashboard testing
    - Enable easy login with predefined credentials
    - Support testing of both ironing and delivery features
*/

-- Add a test partner for Ramu
DO $$
DECLARE
  first_society_id uuid;
  first_tower_id uuid;
BEGIN
  -- Get the first society
  SELECT id INTO first_society_id FROM societies ORDER BY created_at LIMIT 1;
  
  -- Get the first tower in that society
  SELECT id INTO first_tower_id FROM towers WHERE society_id = first_society_id ORDER BY created_at LIMIT 1;
  
  -- Create partner if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM partners WHERE username = 'ramu_partner') THEN
    INSERT INTO partners (
      id,
      username,
      password_hash,
      full_name,
      email,
      phone,
      partner_type,
      society_id,
      tower_id,
      identity_type,
      identity_number,
      working_days,
      holiday_day,
      status
    ) VALUES (
      '990e8400-e29b-41d4-a716-446655440099',
      'ramu_partner',
      'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', -- 'secret123'
      'Ramu Partner',
      'ramu.partner@example.com',
      '+91-9876543299',
      'both',
      first_society_id,
      first_tower_id,
      'aadhar',
      '123456789099',
      ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
      'sunday',
      'approved'
    );
  END IF;
END $$;

-- Create partner session for easy testing
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM partner_sessions WHERE session_token = 'test-ramu-partner-session-token-999') 
     AND EXISTS (SELECT 1 FROM partners WHERE id = '990e8400-e29b-41d4-a716-446655440099') THEN
    INSERT INTO partner_sessions (id, partner_id, session_token, expires_at) 
    VALUES ('dd0e8400-e29b-41d4-a716-446655440099', '990e8400-e29b-41d4-a716-446655440099', 'test-ramu-partner-session-token-999', '2025-01-23 23:59:59+00');
  END IF;
END $$;