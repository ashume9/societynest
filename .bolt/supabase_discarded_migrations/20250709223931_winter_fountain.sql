/*
  # Add Ramu User and Test Orders

  1. New User
    - Create 'ramu' user with complete profile
    - Add flat 103 in Tower A for Ramu
    - Set up user preferences

  2. Test Orders
    - Create orders in various states for testing
    - Include different service types and item counts
    - Set up proper order flow with timestamps
*/

-- Add new flat for Ramu if it doesn't exist
DO $$
DECLARE
  tower_a_id uuid;
BEGIN
  -- Find Tower A
  SELECT id INTO tower_a_id FROM towers WHERE name = 'Tower A' LIMIT 1;
  
  -- Only proceed if we found Tower A
  IF tower_a_id IS NOT NULL THEN
    -- Add flat 103 if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM flats WHERE tower_id = tower_a_id AND number = '103') THEN
      INSERT INTO flats (id, tower_id, number) 
      VALUES ('770e8400-e29b-41d4-a716-446655440006', tower_a_id, '103');
    END IF;
  END IF;
END $$;

-- Add Ramu user
DO $$
DECLARE
  society_id uuid;
  tower_id uuid;
  flat_id uuid;
BEGIN
  -- Find first society
  SELECT id INTO society_id FROM societies LIMIT 1;
  
  -- Find Tower A
  SELECT id INTO tower_id FROM towers WHERE name = 'Tower A' LIMIT 1;
  
  -- Find flat 103
  SELECT id INTO flat_id FROM flats WHERE tower_id = tower_id AND number = '103' LIMIT 1;
  
  -- Only proceed if we found all required references
  IF society_id IS NOT NULL AND tower_id IS NOT NULL AND flat_id IS NOT NULL THEN
    -- Add Ramu user if it doesn't exist
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
  END IF;
END $$;

-- Create test orders for Ramu
DO $$
DECLARE
  ramu_id uuid;
  partner_id uuid;
  
  -- Clothing type IDs
  shirt_id uuid;
  tshirt_id uuid;
  trouser_id uuid;
  jeans_id uuid;
  saree_id uuid;
  kurta_id uuid;
  
  -- Order IDs
  pending_order_id uuid := 'bb0e8400-e29b-41d4-a716-446655440101';
  picked_up_order_id uuid := 'bb0e8400-e29b-41d4-a716-446655440102';
  in_progress_order_id uuid := 'bb0e8400-e29b-41d4-a716-446655440103';
  ready_order_id uuid := 'bb0e8400-e29b-41d4-a716-446655440104';
  delivered_order_id uuid := 'bb0e8400-e29b-41d4-a716-446655440105';
BEGIN
  -- Get Ramu's user ID
  SELECT id INTO ramu_id FROM users WHERE username = 'ramu';
  
  -- Get first partner ID
  SELECT id INTO partner_id FROM partners WHERE partner_type IN ('both', 'ironing') LIMIT 1;
  
  -- Only proceed if we found Ramu and a partner
  IF ramu_id IS NOT NULL AND partner_id IS NOT NULL THEN
    -- Get clothing type IDs
    SELECT id INTO shirt_id FROM clothing_types WHERE name = 'Shirt' LIMIT 1;
    SELECT id INTO tshirt_id FROM clothing_types WHERE name = 'T-Shirt' LIMIT 1;
    SELECT id INTO trouser_id FROM clothing_types WHERE name = 'Trouser' LIMIT 1;
    SELECT id INTO jeans_id FROM clothing_types WHERE name = 'Jeans' LIMIT 1;
    SELECT id INTO saree_id FROM clothing_types WHERE name = 'Saree' LIMIT 1;
    SELECT id INTO kurta_id FROM clothing_types WHERE name = 'Kurta' LIMIT 1;
    
    -- Create orders if they don't exist
    
    -- 1. PENDING order
    IF NOT EXISTS (SELECT 1 FROM orders WHERE id = pending_order_id) THEN
      INSERT INTO orders (
        id,
        user_id,
        pickup_date,
        pickup_slot,
        service_type,
        total_amount,
        estimated_delivery,
        status,
        created_at
      ) VALUES (
        pending_order_id,
        ramu_id,
        CURRENT_DATE + INTERVAL '1 day',
        'morning',
        'normal',
        165,
        CURRENT_TIMESTAMP + INTERVAL '3 days',
        'pending',
        CURRENT_TIMESTAMP - INTERVAL '2 hours'
      );
      
      -- Add order items
      INSERT INTO order_items (id, order_id, clothing_type_id, quantity, rate, subtotal) VALUES
      ('cc0e8400-e29b-41d4-a716-446655440101', pending_order_id, shirt_id, 5, 15, 75),
      ('cc0e8400-e29b-41d4-a716-446655440102', pending_order_id, tshirt_id, 3, 12, 36),
      ('cc0e8400-e29b-41d4-a716-446655440103', pending_order_id, trouser_id, 3, 18, 54);
    END IF;
    
    -- 2. PICKED_UP order
    IF NOT EXISTS (SELECT 1 FROM orders WHERE id = picked_up_order_id) THEN
      INSERT INTO orders (
        id,
        user_id,
        pickup_date,
        pickup_slot,
        service_type,
        total_amount,
        estimated_delivery,
        status,
        created_at
      ) VALUES (
        picked_up_order_id,
        ramu_id,
        CURRENT_DATE,
        'evening',
        'priority',
        240,
        CURRENT_TIMESTAMP + INTERVAL '1 day',
        'picked_up',
        CURRENT_TIMESTAMP - INTERVAL '6 hours'
      );
      
      -- Add order items
      INSERT INTO order_items (id, order_id, clothing_type_id, quantity, rate, subtotal) VALUES
      ('cc0e8400-e29b-41d4-a716-446655440104', picked_up_order_id, shirt_id, 4, 20, 80),
      ('cc0e8400-e29b-41d4-a716-446655440105', picked_up_order_id, jeans_id, 2, 26, 52),
      ('cc0e8400-e29b-41d4-a716-446655440106', picked_up_order_id, saree_id, 2, 35, 70),
      ('cc0e8400-e29b-41d4-a716-446655440107', picked_up_order_id, kurta_id, 2, 22, 38);
    END IF;
    
    -- 3. IN_PROGRESS order
    IF NOT EXISTS (SELECT 1 FROM orders WHERE id = in_progress_order_id) THEN
      INSERT INTO orders (
        id,
        user_id,
        pickup_date,
        pickup_slot,
        service_type,
        total_amount,
        estimated_delivery,
        status,
        assigned_ironing_partner_id,
        ironing_started_at,
        created_at
      ) VALUES (
        in_progress_order_id,
        ramu_id,
        CURRENT_DATE - INTERVAL '1 day',
        'morning',
        'express',
        190,
        CURRENT_TIMESTAMP + INTERVAL '4 hours',
        'in_progress',
        partner_id,
        CURRENT_TIMESTAMP - INTERVAL '2 hours',
        CURRENT_TIMESTAMP - INTERVAL '1 day'
      );
      
      -- Add order items
      INSERT INTO order_items (id, order_id, clothing_type_id, quantity, rate, subtotal) VALUES
      ('cc0e8400-e29b-41d4-a716-446655440108', in_progress_order_id, shirt_id, 3, 25, 75),
      ('cc0e8400-e29b-41d4-a716-446655440109', in_progress_order_id, trouser_id, 2, 30, 60),
      ('cc0e8400-e29b-41d4-a716-446655440110', in_progress_order_id, tshirt_id, 2, 20, 40),
      ('cc0e8400-e29b-41d4-a716-446655440111', in_progress_order_id, kurta_id, 1, 15, 15);
    END IF;
    
    -- 4. READY order
    IF NOT EXISTS (SELECT 1 FROM orders WHERE id = ready_order_id) THEN
      INSERT INTO orders (
        id,
        user_id,
        pickup_date,
        pickup_slot,
        service_type,
        total_amount,
        estimated_delivery,
        status,
        assigned_ironing_partner_id,
        ironing_started_at,
        ironing_completed_at,
        created_at
      ) VALUES (
        ready_order_id,
        ramu_id,
        CURRENT_DATE - INTERVAL '2 days',
        'evening',
        'normal',
        110,
        CURRENT_TIMESTAMP + INTERVAL '1 day',
        'ready',
        partner_id,
        CURRENT_TIMESTAMP - INTERVAL '1 day',
        CURRENT_TIMESTAMP - INTERVAL '6 hours',
        CURRENT_TIMESTAMP - INTERVAL '2 days'
      );
      
      -- Add order items
      INSERT INTO order_items (id, order_id, clothing_type_id, quantity, rate, subtotal) VALUES
      ('cc0e8400-e29b-41d4-a716-446655440112', ready_order_id, kurta_id, 2, 15, 30),
      ('cc0e8400-e29b-41d4-a716-446655440113', ready_order_id, shirt_id, 3, 15, 45),
      ('cc0e8400-e29b-41d4-a716-446655440114', ready_order_id, tshirt_id, 2, 12, 24),
      ('cc0e8400-e29b-41d4-a716-446655440115', ready_order_id, jeans_id, 1, 11, 11);
    END IF;
    
    -- 5. DELIVERED order
    IF NOT EXISTS (SELECT 1 FROM orders WHERE id = delivered_order_id) THEN
      INSERT INTO orders (
        id,
        user_id,
        pickup_date,
        pickup_slot,
        service_type,
        total_amount,
        estimated_delivery,
        status,
        assigned_ironing_partner_id,
        ironing_started_at,
        ironing_completed_at,
        assigned_delivery_partner_id,
        delivery_started_at,
        delivery_completed_at,
        created_at
      ) VALUES (
        delivered_order_id,
        ramu_id,
        CURRENT_DATE - INTERVAL '5 days',
        'morning',
        'priority',
        160,
        CURRENT_TIMESTAMP - INTERVAL '2 days',
        'delivered',
        partner_id,
        CURRENT_TIMESTAMP - INTERVAL '4 days',
        CURRENT_TIMESTAMP - INTERVAL '3 days',
        partner_id,
        CURRENT_TIMESTAMP - INTERVAL '2 days',
        CURRENT_TIMESTAMP - INTERVAL '2 days' + INTERVAL '2 hours',
        CURRENT_TIMESTAMP - INTERVAL '5 days'
      );
      
      -- Add order items
      INSERT INTO order_items (id, order_id, clothing_type_id, quantity, rate, subtotal) VALUES
      ('cc0e8400-e29b-41d4-a716-446655440116', delivered_order_id, shirt_id, 2, 20, 40),
      ('cc0e8400-e29b-41d4-a716-446655440117', delivered_order_id, saree_id, 2, 35, 70),
      ('cc0e8400-e29b-41d4-a716-446655440118', delivered_order_id, trouser_id, 2, 25, 50);
    END IF;
  END IF;
END $$;

-- Create user session for Ramu for easy testing
DO $$
DECLARE
  ramu_id uuid;
BEGIN
  -- Get Ramu's user ID
  SELECT id INTO ramu_id FROM users WHERE username = 'ramu';
  
  -- Only proceed if we found Ramu
  IF ramu_id IS NOT NULL THEN
    -- Create session if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM user_sessions WHERE session_token = 'test-ramu-session-token-999') THEN
      INSERT INTO user_sessions (id, user_id, session_token, expires_at) 
      VALUES ('ee0e8400-e29b-41d4-a716-446655440001', ramu_id, 'test-ramu-session-token-999', '2025-01-23 23:59:59+00');
    END IF;
  END IF;
END $$;