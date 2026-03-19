/*
  # Add comprehensive test data for Ramu user

  1. New Data Created
    - Test orders for Ramu user in all possible states
    - Orders for both ironing and delivery services
    - Complete order items with proper calculations
    - Orders assigned to various partners

  2. Test Scenarios Covered
    - Pending pickup orders
    - Picked up orders waiting for ironing
    - Orders in progress (being ironed)
    - Orders ready for delivery
    - Delivered orders (completed)
    - Orders assigned to Ramu partner

  3. Data Structure
    - Orders with different service types (normal, priority, express)
    - Various clothing items with different quantities
    - Orders in different stages of the workflow
*/

-- Add test orders for Ramu user
DO $$
DECLARE
  society_record record;
  tower_record record;
  flat_record record;
  user_id uuid;
  ramu_partner_id uuid;
  iron_partner_id uuid;
  delivery_partner_id uuid;
  
  -- Order IDs for different statuses
  pending_order_id uuid := gen_random_uuid();
  picked_up_order_id uuid := gen_random_uuid();
  in_progress_order_id uuid := gen_random_uuid();
  ready_order_id uuid := gen_random_uuid();
  delivered_order_id uuid := gen_random_uuid();
  
  -- Order IDs for partner assignments
  assigned_pickup_id uuid := gen_random_uuid();
  assigned_delivery_id uuid := gen_random_uuid();
  completed_pickup_id uuid := gen_random_uuid();
  completed_delivery_id uuid := gen_random_uuid();
  
  -- Clothing type IDs
  shirt_id uuid;
  trouser_id uuid;
  tshirt_id uuid;
  jeans_id uuid;
  saree_id uuid;
  kurta_id uuid;
BEGIN
  -- Get first society
  SELECT * INTO society_record FROM societies LIMIT 1;
  
  -- Get first tower in that society (using table alias to avoid ambiguity)
  SELECT t.* INTO tower_record 
  FROM towers t 
  WHERE t.society_id = society_record.id 
  LIMIT 1;
  
  -- Get first flat in that tower
  SELECT f.* INTO flat_record 
  FROM flats f 
  WHERE f.tower_id = tower_record.id 
  LIMIT 1;
  
  -- Get or create Ramu user
  SELECT id INTO user_id FROM users WHERE username = 'ramu';
  
  IF user_id IS NULL THEN
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
      'ramu',
      'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', -- 'secret123'
      'Ramu Kumar',
      '+91-9876543200',
      society_record.id,
      tower_record.id,
      flat_record.id,
      2,
      1,
      'morning',
      'evening'
    ) RETURNING id INTO user_id;
  END IF;
  
  -- Get partners
  SELECT id INTO ramu_partner_id FROM partners WHERE username = 'ramu_partner' LIMIT 1;
  SELECT id INTO iron_partner_id FROM partners WHERE partner_type IN ('ironing', 'both') AND username != 'ramu_partner' LIMIT 1;
  SELECT id INTO delivery_partner_id FROM partners WHERE partner_type IN ('delivery', 'both') AND username != 'ramu_partner' LIMIT 1;
  
  -- Get clothing types
  SELECT id INTO shirt_id FROM clothing_types WHERE name = 'Shirt' LIMIT 1;
  SELECT id INTO trouser_id FROM clothing_types WHERE name = 'Trouser' LIMIT 1;
  SELECT id INTO tshirt_id FROM clothing_types WHERE name = 'T-Shirt' LIMIT 1;
  SELECT id INTO jeans_id FROM clothing_types WHERE name = 'Jeans' LIMIT 1;
  SELECT id INTO saree_id FROM clothing_types WHERE name = 'Saree' LIMIT 1;
  SELECT id INTO kurta_id FROM clothing_types WHERE name = 'Kurta' LIMIT 1;
  
  -- 1. PENDING order (waiting for pickup)
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
      user_id,
      CURRENT_DATE + INTERVAL '1 day',
      'morning',
      'normal',
      165,
      CURRENT_TIMESTAMP + INTERVAL '3 days',
      'pending',
      CURRENT_TIMESTAMP - INTERVAL '3 hours'
    );
    
    -- Add order items
    INSERT INTO order_items (order_id, clothing_type_id, quantity, rate, subtotal)
    VALUES 
      (pending_order_id, shirt_id, 5, 15, 75),
      (pending_order_id, trouser_id, 3, 18, 54),
      (pending_order_id, tshirt_id, 3, 12, 36);
  END IF;
  
  -- 2. PICKED_UP order (waiting for ironing assignment)
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
      created_at,
      assigned_delivery_partner_id,
      delivery_started_at
    ) VALUES (
      picked_up_order_id,
      user_id,
      CURRENT_DATE - INTERVAL '1 day',
      'evening',
      'priority',
      210,
      CURRENT_TIMESTAMP + INTERVAL '1 day',
      'picked_up',
      CURRENT_TIMESTAMP - INTERVAL '1 day',
      delivery_partner_id,
      CURRENT_TIMESTAMP - INTERVAL '12 hours'
    );
    
    -- Add order items
    INSERT INTO order_items (order_id, clothing_type_id, quantity, rate, subtotal)
    VALUES 
      (picked_up_order_id, shirt_id, 4, 20, 80),
      (picked_up_order_id, jeans_id, 3, 26, 78),
      (picked_up_order_id, saree_id, 1, 35, 35),
      (picked_up_order_id, kurta_id, 1, 22, 17);
  END IF;
  
  -- 3. IN_PROGRESS order (being ironed)
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
      created_at,
      assigned_delivery_partner_id,
      delivery_started_at,
      assigned_ironing_partner_id,
      ironing_started_at
    ) VALUES (
      in_progress_order_id,
      user_id,
      CURRENT_DATE - INTERVAL '2 days',
      'morning',
      'express',
      250,
      CURRENT_TIMESTAMP + INTERVAL '4 hours',
      'in_progress',
      CURRENT_TIMESTAMP - INTERVAL '2 days',
      delivery_partner_id,
      CURRENT_TIMESTAMP - INTERVAL '1 day',
      iron_partner_id,
      CURRENT_TIMESTAMP - INTERVAL '6 hours'
    );
    
    -- Add order items
    INSERT INTO order_items (order_id, clothing_type_id, quantity, rate, subtotal)
    VALUES 
      (in_progress_order_id, shirt_id, 3, 25, 75),
      (in_progress_order_id, trouser_id, 2, 30, 60),
      (in_progress_order_id, saree_id, 2, 45, 90),
      (in_progress_order_id, kurta_id, 1, 28, 25);
  END IF;
  
  -- 4. READY order (ironing complete, waiting for delivery)
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
      created_at,
      assigned_delivery_partner_id,
      delivery_started_at,
      assigned_ironing_partner_id,
      ironing_started_at,
      ironing_completed_at
    ) VALUES (
      ready_order_id,
      user_id,
      CURRENT_DATE - INTERVAL '3 days',
      'evening',
      'normal',
      180,
      CURRENT_TIMESTAMP + INTERVAL '8 hours',
      'ready',
      CURRENT_TIMESTAMP - INTERVAL '3 days',
      delivery_partner_id,
      CURRENT_TIMESTAMP - INTERVAL '2 days',
      iron_partner_id,
      CURRENT_TIMESTAMP - INTERVAL '1 day',
      CURRENT_TIMESTAMP - INTERVAL '4 hours'
    );
    
    -- Add order items
    INSERT INTO order_items (order_id, clothing_type_id, quantity, rate, subtotal)
    VALUES 
      (ready_order_id, shirt_id, 6, 15, 90),
      (ready_order_id, trouser_id, 3, 18, 54),
      (ready_order_id, tshirt_id, 3, 12, 36);
  END IF;
  
  -- 5. DELIVERED order (completed)
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
      created_at,
      assigned_delivery_partner_id,
      delivery_started_at,
      delivery_completed_at,
      assigned_ironing_partner_id,
      ironing_started_at,
      ironing_completed_at
    ) VALUES (
      delivered_order_id,
      user_id,
      CURRENT_DATE - INTERVAL '5 days',
      'morning',
      'priority',
      320,
      CURRENT_TIMESTAMP - INTERVAL '3 days',
      'delivered',
      CURRENT_TIMESTAMP - INTERVAL '5 days',
      delivery_partner_id,
      CURRENT_TIMESTAMP - INTERVAL '3 days',
      CURRENT_TIMESTAMP - INTERVAL '3 days' + INTERVAL '2 hours',
      iron_partner_id,
      CURRENT_TIMESTAMP - INTERVAL '4 days',
      CURRENT_TIMESTAMP - INTERVAL '3 days' + INTERVAL '6 hours'
    );
    
    -- Add order items
    INSERT INTO order_items (order_id, clothing_type_id, quantity, rate, subtotal)
    VALUES 
      (delivered_order_id, shirt_id, 5, 20, 100),
      (delivered_order_id, jeans_id, 3, 26, 78),
      (delivered_order_id, saree_id, 2, 35, 70),
      (delivered_order_id, kurta_id, 4, 22, 72);
  END IF;
  
  -- 6. PENDING order assigned to Ramu partner for pickup
  IF NOT EXISTS (SELECT 1 FROM orders WHERE id = assigned_pickup_id) AND ramu_partner_id IS NOT NULL THEN
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
      assigned_pickup_id,
      user_id,
      CURRENT_DATE,
      'evening',
      'normal',
      145,
      CURRENT_TIMESTAMP + INTERVAL '2 days',
      'pending',
      CURRENT_TIMESTAMP - INTERVAL '6 hours',
      ramu_partner_id
    );
    
    -- Add order items
    INSERT INTO order_items (order_id, clothing_type_id, quantity, rate, subtotal)
    VALUES 
      (assigned_pickup_id, shirt_id, 4, 15, 60),
      (assigned_pickup_id, trouser_id, 3, 18, 54),
      (assigned_pickup_id, tshirt_id, 3, 12, 31);
  END IF;
  
  -- 7. READY order assigned to Ramu partner for delivery
  IF NOT EXISTS (SELECT 1 FROM orders WHERE id = assigned_delivery_id) AND ramu_partner_id IS NOT NULL THEN
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
      assigned_ironing_partner_id,
      ironing_started_at,
      ironing_completed_at
    ) VALUES (
      assigned_delivery_id,
      user_id,
      CURRENT_DATE - INTERVAL '2 days',
      'morning',
      'priority',
      230,
      CURRENT_TIMESTAMP + INTERVAL '6 hours',
      'ready',
      CURRENT_TIMESTAMP - INTERVAL '2 days',
      ramu_partner_id,
      iron_partner_id,
      CURRENT_TIMESTAMP - INTERVAL '1 day',
      CURRENT_TIMESTAMP - INTERVAL '6 hours'
    );
    
    -- Add order items
    INSERT INTO order_items (order_id, clothing_type_id, quantity, rate, subtotal)
    VALUES 
      (assigned_delivery_id, shirt_id, 4, 20, 80),
      (assigned_delivery_id, jeans_id, 3, 26, 78),
      (assigned_delivery_id, saree_id, 1, 35, 35),
      (assigned_delivery_id, kurta_id, 2, 22, 37);
  END IF;
  
  -- 8. PICKED_UP order completed by Ramu partner
  IF NOT EXISTS (SELECT 1 FROM orders WHERE id = completed_pickup_id) AND ramu_partner_id IS NOT NULL THEN
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
      completed_pickup_id,
      user_id,
      CURRENT_DATE - INTERVAL '1 day',
      'morning',
      'normal',
      175,
      CURRENT_TIMESTAMP + INTERVAL '2 days',
      'picked_up',
      CURRENT_TIMESTAMP - INTERVAL '1 day',
      ramu_partner_id,
      CURRENT_TIMESTAMP - INTERVAL '12 hours'
    );
    
    -- Add order items
    INSERT INTO order_items (order_id, clothing_type_id, quantity, rate, subtotal)
    VALUES 
      (completed_pickup_id, shirt_id, 5, 15, 75),
      (completed_pickup_id, trouser_id, 3, 18, 54),
      (completed_pickup_id, tshirt_id, 4, 12, 46);
  END IF;
  
  -- 9. DELIVERED order completed by Ramu partner
  IF NOT EXISTS (SELECT 1 FROM orders WHERE id = completed_delivery_id) AND ramu_partner_id IS NOT NULL THEN
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
      delivery_started_at,
      delivery_completed_at,
      assigned_ironing_partner_id,
      ironing_started_at,
      ironing_completed_at
    ) VALUES (
      completed_delivery_id,
      user_id,
      CURRENT_DATE - INTERVAL '4 days',
      'evening',
      'express',
      290,
      CURRENT_TIMESTAMP - INTERVAL '2 days',
      'delivered',
      CURRENT_TIMESTAMP - INTERVAL '4 days',
      ramu_partner_id,
      CURRENT_TIMESTAMP - INTERVAL '2 days',
      CURRENT_TIMESTAMP - INTERVAL '2 days' + INTERVAL '3 hours',
      iron_partner_id,
      CURRENT_TIMESTAMP - INTERVAL '3 days',
      CURRENT_TIMESTAMP - INTERVAL '2 days' + INTERVAL '8 hours'
    );
    
    -- Add order items
    INSERT INTO order_items (order_id, clothing_type_id, quantity, rate, subtotal)
    VALUES 
      (completed_delivery_id, shirt_id, 4, 25, 100),
      (completed_delivery_id, jeans_id, 2, 32, 64),
      (completed_delivery_id, saree_id, 1, 45, 45),
      (completed_delivery_id, kurta_id, 3, 28, 81);
  END IF;
  
  -- Create user session for Ramu for easy testing
  IF NOT EXISTS (SELECT 1 FROM user_sessions WHERE session_token = 'test-ramu-user-session-token-123') 
     AND EXISTS (SELECT 1 FROM users WHERE id = user_id) THEN
    INSERT INTO user_sessions (id, user_id, session_token, expires_at) 
    VALUES (gen_random_uuid(), user_id, 'test-ramu-user-session-token-123', '2025-01-23 23:59:59+00');
  END IF;
  
  RAISE NOTICE 'Created test data for Ramu user with orders in all statuses';
  RAISE NOTICE 'Created orders assigned to Ramu partner for testing partner dashboard';
END $$;