/*
  # Add test orders for delivery partners

  1. Test Data
    - Creates test user 'birendra_suthar' if not exists
    - Creates 4 test orders in different states:
      - 2 pending pickup orders (global queue)
      - 1 assigned pickup order
      - 1 completed pickup order
    - Adds order items for each order

  2. Order States
    - Pending: Orders waiting for pickup assignment
    - Assigned: Orders assigned to delivery partner for pickup
    - Picked up: Orders completed pickup, ready for ironing
*/

-- Add test orders for delivery partners
DO $$
DECLARE
  v_society_id uuid;
  v_tower_id uuid;
  v_flat_id uuid;
  v_user_id uuid;
  v_partner_id uuid;
  
  -- Order IDs
  order1_id uuid := gen_random_uuid();
  order2_id uuid := gen_random_uuid();
  order3_id uuid := gen_random_uuid();
  order4_id uuid := gen_random_uuid();
  
  -- Clothing type IDs
  v_shirt_id uuid;
  v_trouser_id uuid;
  v_tshirt_id uuid;
  v_jeans_id uuid;
BEGIN
  -- Get first society
  SELECT id INTO v_society_id FROM societies LIMIT 1;
  
  -- Get first tower for the society
  SELECT id INTO v_tower_id FROM towers WHERE society_id = v_society_id LIMIT 1;
  
  -- Get first flat for the tower
  SELECT id INTO v_flat_id FROM flats WHERE tower_id = v_tower_id LIMIT 1;
  
  -- Get or create test user
  SELECT id INTO v_user_id FROM users WHERE username = 'birendra_suthar';
  
  IF v_user_id IS NULL THEN
    INSERT INTO users (
      id,
      username,
      password_hash,
      full_name,
      phone,
      society_id,
      tower_id,
      flat_id,
      adults,
      kids,
      pickup_slot,
      delivery_slot
    ) VALUES (
      gen_random_uuid(),
      'birendra_suthar',
      'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', -- 'secret123'
      'Birendra Suthar',
      '09581002105',
      v_society_id,
      v_tower_id,
      v_flat_id,
      2,
      1,
      'morning',
      'evening'
    ) RETURNING id INTO v_user_id;
  END IF;
  
  -- Get delivery partner
  SELECT id INTO v_partner_id FROM partners WHERE partner_type IN ('delivery', 'both') LIMIT 1;
  
  -- Get clothing types
  SELECT id INTO v_shirt_id FROM clothing_types WHERE name = 'Shirt' LIMIT 1;
  SELECT id INTO v_trouser_id FROM clothing_types WHERE name = 'Trouser' LIMIT 1;
  SELECT id INTO v_tshirt_id FROM clothing_types WHERE name = 'T-Shirt' LIMIT 1;
  SELECT id INTO v_jeans_id FROM clothing_types WHERE name = 'Jeans' LIMIT 1;
  
  -- Create pending pickup orders (Global Queue)
  IF NOT EXISTS (SELECT 1 FROM orders WHERE id = order1_id) THEN
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
      order1_id,
      v_user_id,
      CURRENT_DATE + INTERVAL '1 day',
      'morning',
      'priority',
      165,
      CURRENT_TIMESTAMP + INTERVAL '2 days',
      'pending',
      CURRENT_TIMESTAMP - INTERVAL '2 hours'
    );
    
    -- Add order items
    INSERT INTO order_items (order_id, clothing_type_id, quantity, rate, subtotal)
    VALUES 
      (order1_id, v_shirt_id, 3, 20, 60),
      (order1_id, v_trouser_id, 3, 25, 75),
      (order1_id, v_tshirt_id, 2, 15, 30);
  END IF;
  
  -- Create another pending pickup order (Global Queue)
  IF NOT EXISTS (SELECT 1 FROM orders WHERE id = order2_id) THEN
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
      order2_id,
      v_user_id,
      CURRENT_DATE + INTERVAL '1 day',
      'evening',
      'priority',
      140,
      CURRENT_TIMESTAMP + INTERVAL '2 days',
      'pending',
      CURRENT_TIMESTAMP - INTERVAL '4 hours'
    );
    
    -- Add order items
    INSERT INTO order_items (order_id, clothing_type_id, quantity, rate, subtotal)
    VALUES 
      (order2_id, v_shirt_id, 2, 20, 40),
      (order2_id, v_jeans_id, 2, 26, 52),
      (order2_id, v_tshirt_id, 3, 16, 48);
  END IF;
  
  -- Create assigned pickup order (My Assignments)
  IF NOT EXISTS (SELECT 1 FROM orders WHERE id = order3_id) AND v_partner_id IS NOT NULL THEN
    INSERT INTO orders (
      id,
      user_id,
      pickup_date,
      pickup_slot,
      service_type,
      total_amount,
      estimated_delivery,
      status,
      created_at,
      assigned_delivery_partner_id
    ) VALUES (
      order3_id,
      v_user_id,
      CURRENT_DATE,
      'morning',
      'normal',
      120,
      CURRENT_TIMESTAMP + INTERVAL '2 days',
      'pending',
      CURRENT_TIMESTAMP - INTERVAL '1 day',
      v_partner_id
    );
    
    -- Add order items
    INSERT INTO order_items (order_id, clothing_type_id, quantity, rate, subtotal)
    VALUES 
      (order3_id, v_shirt_id, 4, 15, 60),
      (order3_id, v_trouser_id, 2, 18, 36),
      (order3_id, v_tshirt_id, 2, 12, 24);
  END IF;
  
  -- Create completed pickup order (Completed)
  IF NOT EXISTS (SELECT 1 FROM orders WHERE id = order4_id) AND v_partner_id IS NOT NULL THEN
    INSERT INTO orders (
      id,
      user_id,
      pickup_date,
      pickup_slot,
      service_type,
      total_amount,
      estimated_delivery,
      status,
      created_at,
      assigned_delivery_partner_id,
      delivery_started_at
    ) VALUES (
      order4_id,
      v_user_id,
      CURRENT_DATE - INTERVAL '1 day',
      'evening',
      'express',
      190,
      CURRENT_TIMESTAMP + INTERVAL '1 day',
      'picked_up',
      CURRENT_TIMESTAMP - INTERVAL '2 days',
      v_partner_id,
      CURRENT_TIMESTAMP - INTERVAL '1 day'
    );
    
    -- Add order items
    INSERT INTO order_items (order_id, clothing_type_id, quantity, rate, subtotal)
    VALUES 
      (order4_id, v_shirt_id, 3, 25, 75),
      (order4_id, v_jeans_id, 2, 32, 64),
      (order4_id, v_tshirt_id, 3, 17, 51);
  END IF;
  
  -- Create ready for delivery order (Global Delivery Queue)
  IF v_partner_id IS NOT NULL THEN
    INSERT INTO orders (
      user_id,
      pickup_date,
      pickup_slot,
      service_type,
      total_amount,
      estimated_delivery,
      status,
      created_at,
      assigned_ironing_partner_id,
      ironing_started_at,
      ironing_completed_at
    ) VALUES (
      v_user_id,
      CURRENT_DATE - INTERVAL '2 days',
      'morning',
      'normal',
      180,
      CURRENT_TIMESTAMP + INTERVAL '1 day',
      'ready',
      CURRENT_TIMESTAMP - INTERVAL '3 days',
      v_partner_id,
      CURRENT_TIMESTAMP - INTERVAL '2 days',
      CURRENT_TIMESTAMP - INTERVAL '1 day'
    );
    
    -- Get the last inserted order ID
    INSERT INTO order_items (order_id, clothing_type_id, quantity, rate, subtotal)
    SELECT 
      (SELECT id FROM orders WHERE user_id = v_user_id AND status = 'ready' ORDER BY created_at DESC LIMIT 1),
      v_shirt_id, 4, 15, 60
    UNION ALL
    SELECT 
      (SELECT id FROM orders WHERE user_id = v_user_id AND status = 'ready' ORDER BY created_at DESC LIMIT 1),
      v_trouser_id, 3, 18, 54
    UNION ALL
    SELECT 
      (SELECT id FROM orders WHERE user_id = v_user_id AND status = 'ready' ORDER BY created_at DESC LIMIT 1),
      v_jeans_id, 2, 33, 66;
  END IF;
  
  -- Create delivered order (Completed)
  IF v_partner_id IS NOT NULL THEN
    INSERT INTO orders (
      user_id,
      pickup_date,
      pickup_slot,
      service_type,
      total_amount,
      estimated_delivery,
      status,
      created_at,
      assigned_delivery_partner_id,
      delivery_started_at,
      delivery_completed_at,
      assigned_ironing_partner_id,
      ironing_started_at,
      ironing_completed_at
    ) VALUES (
      v_user_id,
      CURRENT_DATE - INTERVAL '5 days',
      'evening',
      'priority',
      220,
      CURRENT_TIMESTAMP - INTERVAL '2 days',
      'delivered',
      CURRENT_TIMESTAMP - INTERVAL '6 days',
      v_partner_id,
      CURRENT_TIMESTAMP - INTERVAL '4 days',
      CURRENT_TIMESTAMP - INTERVAL '3 days',
      v_partner_id,
      CURRENT_TIMESTAMP - INTERVAL '5 days',
      CURRENT_TIMESTAMP - INTERVAL '4 days'
    );
    
    -- Get the last inserted order ID
    INSERT INTO order_items (order_id, clothing_type_id, quantity, rate, subtotal)
    SELECT 
      (SELECT id FROM orders WHERE user_id = v_user_id AND status = 'delivered' ORDER BY created_at DESC LIMIT 1),
      v_shirt_id, 5, 20, 100
    UNION ALL
    SELECT 
      (SELECT id FROM orders WHERE user_id = v_user_id AND status = 'delivered' ORDER BY created_at DESC LIMIT 1),
      v_trouser_id, 4, 25, 100
    UNION ALL
    SELECT 
      (SELECT id FROM orders WHERE user_id = v_user_id AND status = 'delivered' ORDER BY created_at DESC LIMIT 1),
      v_tshirt_id, 2, 10, 20;
  END IF;
END $$;