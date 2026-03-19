/*
  # Add Ramu Partner for Testing

  1. New Data
    - Creates a test partner 'ramu_partner' with 'both' type
    - Creates a partner session for easy testing
    - Uses the first available society and tower

  2. Test Scenarios
    - Partner login and authentication
    - Partner dashboard access
    - Order assignment and management
*/

-- Add a test partner for Ramu
DO $$
DECLARE
  society_record record;
  tower_record record;
  partner_id uuid := '990e8400-e29b-41d4-a716-446655440099';
BEGIN
  -- Get the first society
  SELECT * INTO society_record FROM societies LIMIT 1;
  
  -- Get the first tower in that society
  SELECT * INTO tower_record FROM towers WHERE society_id = society_record.id LIMIT 1;
  
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
      partner_id,
      'ramu_partner',
      'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', -- 'secret123'
      'Ramu Partner',
      'ramu.partner@example.com',
      '+91-9876543299',
      'both',
      society_record.id,
      tower_record.id,
      'aadhar',
      '123456789099',
      ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
      'sunday',
      'approved'
    );
  END IF;
  
  -- Create partner session for easy testing
  IF NOT EXISTS (SELECT 1 FROM partner_sessions WHERE session_token = 'test-ramu-partner-session-token-999') 
     AND EXISTS (SELECT 1 FROM partners WHERE id = partner_id) THEN
    INSERT INTO partner_sessions (id, partner_id, session_token, expires_at) 
    VALUES ('dd0e8400-e29b-41d4-a716-446655440099', partner_id, 'test-ramu-partner-session-token-999', '2025-01-23 23:59:59+00');
  END IF;
END $$;