/*
  # Add Ramu User and Test Orders

  1. New User
    - Create 'ramu' user with complete profile
    - Add test orders for this user
    - Ensure proper relationships with societies, towers, and flats

  2. Test Data
    - Orders in various states (pending, in_progress, ready, delivered)
    - Proper order items with realistic quantities and rates
    - Relationships with existing partners
*/

-- First add a flat for Ramu if it doesn't exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM towers WHERE id = '660e8400-e29b-41d4-a716-446655440001') 
     AND NOT EXISTS (SELECT 1 FROM flats WHERE tower_id = '660e8400-e29b-41d4-a716-446655440001' AND number = '103') THEN
    INSERT INTO flats (id, tower_id, number) 
    VALUES ('770e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440001', '103');
  END IF;
END $$;

-- Add Ramu user if it doesn't exist
DO $$
DECLARE
  society_id uuid;
  tower_id uuid;
  flat_id uuid;
BEGIN
  -- Get the first society if needed
  SELECT id INTO society_id FROM societies ORDER BY created_at LIMIT 1;
  
  -- Get the first tower in that society if needed
  SELECT id INTO tower_id FROM towers WHERE society_id = society_id ORDER BY created_at LIMIT 1;
  
  -- Get flat 103 or the first flat in that tower if needed
  SELECT id INTO flat_id FROM flats WHERE tower_id = tower_id AND number = '103' LIMIT 1;
  IF flat_id IS NULL THEN
    SELECT id INTO flat_id FROM flats WHERE tower_id = tower_id ORDER BY created_at LIMIT 1;
  END IF;
  
  -- Create Ramu user if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM users WHERE username = 'ramu') THEN
    INSERT INTO users (
      id, 
      username, 
      password_hash, 
      full_name, 
      email, 
      phone, 
      society_id, 
      tower_id, 
      flat_id, 
      adults, 
      kids, 
      pickup_slot, 
      delivery_slot
    ) VALUES (
      '880e8400-e29b-41d4-a716-446655440006', 
      'ramu', 
      'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', -- 'secret123'
      'Ramu Krishnan', 
      'ramu.krishnan@example.com', 
      '+91-9876543215', 
      society_id, 
      tower_id, 
      flat_id, 
      2, 
      1, 
      'morning', 
      'evening'
    );
  END IF;
END $$;

-- Create test orders for Ramu
DO $$
DECLARE
  ramu_id uuid;
  partner_id uuid;
  ironing_partner_id uuid;
  delivery_partner_id uuid;
  shirt_id uuid;
  trouser_id uuid;
  saree_id uuid;
  kurta_id uuid;
BEGIN
  -- Get Ramu's user ID
  SELECT id INTO ramu_id FROM users WHERE username = 'ramu';
  
  -- Get partner IDs
  SELECT id INTO ironing_partner_id FROM partners WHERE partner_type IN ('ironing', 'both') LIMIT 1;
  SELECT id INTO delivery_partner_id FROM partners WHERE partner_type IN ('delivery', 'both') LIMIT 1;
  
  -- If we couldn't find specific partners, use any partner
  IF ironing_partner_id IS NULL THEN
    SELECT id INTO ironing_partner_id FROM partners LIMIT 1;
  END IF;
  
  IF delivery_partner_id IS NULL THEN
    SELECT id INTO delivery_partner_id FROM partners LIMIT 1;
  END IF;
  
  -- Get clothing type IDs
  SELECT id INTO shirt_id FROM clothing_types WHERE name = 'Shirt' LIMIT 1;
  SELECT id INTO trouser_id FROM clothing_types WHERE name = 'Trouser' LIMIT 1;
  SELECT id INTO saree_id FROM clothing_types WHERE name = 'Saree' LIMIT 1;
  SELECT id INTO kurta_id FROM clothing_types WHERE name = 'Kurta' LIMIT 1;
  
  -- Only proceed if we have all the necessary data
  IF ramu_id IS NOT NULL AND ironing_partner_id IS NOT NULL AND delivery_partner_id IS NOT NULL 
     AND shirt_id IS NOT NULL AND trouser_id IS NOT NULL THEN
    
    -- 1. Create a pending order
    IF NOT EXISTS (SELECT 1 FROM orders WHERE id = 'bb0e8400-e29b-41d4-a716-446655440101') THEN
      INSERT INTO orders (
        id, user_id, pickup_date, pickup_slot, service_type, total_amount, 
        estimated_delivery, status, created_at
      ) VALUES (
        'bb0e8400-e29b-41d4-a716-446655440101', ramu_id, CURRENT_DATE + INTERVAL '1 day', 
        'morning', 'normal', 165, CURRENT_TIMESTAMP + INTERVAL '3 days', 
        'pending', CURRENT_TIMESTAMP - INTERVAL '2 hours'
      );
      
      -- Add order items
      INSERT INTO order_items (id, order_id, clothing_type_id, quantity, rate, subtotal) VALUES
      ('cc0e8400-e29b-41d4-a716-446655440101', 'bb0e8400-e29b-41d4-a716-446655440101', shirt_id, 5, 15, 75),
      ('cc0e8400-e29b-41d4-a716-446655440102', 'bb0e8400-e29b-41d4-a716-446655440101', trouser_id, 5, 18, 90);
    END IF;
    
    -- 2. Create a picked_up order (ready for ironing)
    IF NOT EXISTS (SELECT 1 FROM orders WHERE id = 'bb0e8400-e29b-41d4-a716-446655440102') THEN
      INSERT INTO orders (
        id, user_id, pickup_date, pickup_slot, service_type, total_amount, 
        estimated_delivery, status, created_at, assigned_delivery_partner_id, delivery_started_at
      ) VALUES (
        'bb0e8400-e29b-41d4-a716-446655440102', ramu_id, CURRENT_DATE, 
        'morning', 'priority', 130, CURRENT_TIMESTAMP + INTERVAL '1 day', 
        'picked_up', CURRENT_TIMESTAMP - INTERVAL '6 hours',
        delivery_partner_id, CURRENT_TIMESTAMP - INTERVAL '4 hours'
      );
      
      -- Add order items
      INSERT INTO order_items (id, order_id, clothing_type_id, quantity, rate, subtotal) VALUES
      ('cc0e8400-e29b-41d4-a716-446655440103', 'bb0e8400-e29b-41d4-a716-446655440102', shirt_id, 2, 20, 40),
      ('cc0e8400-e29b-41d4-a716-446655440104', 'bb0e8400-e29b-41d4-a716-446655440102', saree_id, 1, 60, 60),
      ('cc0e8400-e29b-41d4-a716-446655440105', 'bb0e8400-e29b-41d4-a716-446655440102', kurta_id, 1, 30, 30);
    END IF;
    
    -- 3. Create an in_progress order (being ironed)
    IF NOT EXISTS (SELECT 1 FROM orders WHERE id = 'bb0e8400-e29b-41d4-a716-446655440103') THEN
      INSERT INTO orders (
        id, user_id, pickup_date, pickup_slot, service_type, total_amount, 
        estimated_delivery, status, created_at, assigned_ironing_partner_id, ironing_started_at
      ) VALUES (
        'bb0e8400-e29b-41d4-a716-446655440103', ramu_id, CURRENT_DATE - INTERVAL '1 day', 
        'evening', 'express', 190, CURRENT_TIMESTAMP + INTERVAL '4 hours', 
        'in_progress', CURRENT_TIMESTAMP - INTERVAL '1 day',
        ironing_partner_id, CURRENT_TIMESTAMP - INTERVAL '2 hours'
      );
      
      -- Add order items
      INSERT INTO order_items (id, order_id, clothing_type_id, quantity, rate, subtotal) VALUES
      ('cc0e8400-e29b-41d4-a716-446655440106', 'bb0e8400-e29b-41d4-a716-446655440103', shirt_id, 4, 25, 100),
      ('cc0e8400-e29b-41d4-a716-446655440107', 'bb0e8400-e29b-41d4-a716-446655440103', trouser_id, 3, 30, 90);
    END IF;
    
    -- 4. Create a ready order (ironing completed, ready for delivery)
    IF NOT EXISTS (SELECT 1 FROM orders WHERE id = 'bb0e8400-e29b-41d4-a716-446655440104') THEN
      INSERT INTO orders (
        id, user_id, pickup_date, pickup_slot, service_type, total_amount, 
        estimated_delivery, status, created_at, 
        assigned_ironing_partner_id, ironing_started_at, ironing_completed_at
      ) VALUES (
        'bb0e8400-e29b-41d4-a716-446655440104', ramu_id, CURRENT_DATE - INTERVAL '2 days', 
        'morning', 'normal', 110, CURRENT_TIMESTAMP + INTERVAL '6 hours', 
        'ready', CURRENT_TIMESTAMP - INTERVAL '2 days',
        ironing_partner_id, CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP - INTERVAL '6 hours'
      );
      
      -- Add order items
      INSERT INTO order_items (id, order_id, clothing_type_id, quantity, rate, subtotal) VALUES
      ('cc0e8400-e29b-41d4-a716-446655440108', 'bb0e8400-e29b-41d4-a716-446655440104', kurta_id, 2, 25, 50),
      ('cc0e8400-e29b-41d4-a716-446655440109', 'bb0e8400-e29b-41d4-a716-446655440104', shirt_id, 4, 15, 60);
    END IF;
    
    -- 5. Create a delivered order (completed)
    IF NOT EXISTS (SELECT 1 FROM orders WHERE id = 'bb0e8400-e29b-41d4-a716-446655440105') THEN
      INSERT INTO orders (
        id, user_id, pickup_date, pickup_slot, service_type, total_amount, 
        estimated_delivery, status, created_at, 
        assigned_ironing_partner_id, ironing_started_at, ironing_completed_at,
        assigned_delivery_partner_id, delivery_started_at, delivery_completed_at
      ) VALUES (
        'bb0e8400-e29b-41d4-a716-446655440105', ramu_id, CURRENT_DATE - INTERVAL '5 days', 
        'evening', 'priority', 160, CURRENT_TIMESTAMP - INTERVAL '2 days', 
        'delivered', CURRENT_TIMESTAMP - INTERVAL '5 days',
        ironing_partner_id, CURRENT_TIMESTAMP - INTERVAL '4 days', CURRENT_TIMESTAMP - INTERVAL '3 days',
        delivery_partner_id, CURRENT_TIMESTAMP - INTERVAL '2 days', CURRENT_TIMESTAMP - INTERVAL '2 days' + INTERVAL '2 hours'
      );
      
      -- Add order items
      INSERT INTO order_items (id, order_id, clothing_type_id, quantity, rate, subtotal) VALUES
      ('cc0e8400-e29b-41d4-a716-446655440110', 'bb0e8400-e29b-41d4-a716-446655440105', shirt_id, 2, 20, 40),
      ('cc0e8400-e29b-41d4-a716-446655440111', 'bb0e8400-e29b-41d4-a716-446655440105', saree_id, 2, 60, 120);
    END IF;
  END IF;
END $$;

-- Create user session for Ramu for easy testing
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM user_sessions WHERE session_token = 'test-ramu-session-token-999') 
     AND EXISTS (SELECT 1 FROM users WHERE id = '880e8400-e29b-41d4-a716-446655440006') THEN
    INSERT INTO user_sessions (id, user_id, session_token, expires_at) 
    VALUES ('ee0e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440006', 'test-ramu-session-token-999', '2025-01-23 23:59:59+00');
  END IF;
END $$;