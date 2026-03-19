/*
  # Add Test Orders for Delivery Partners

  1. New Data
    - Creates test user 'birendra_suthar' if not exists
    - Creates 4 test orders in various states
    - Adds order items for each order
  
  2. Test Scenarios
    - Pending pickup orders (2)
    - Assigned pickup order (1)
    - Completed pickup order (1)
  
  3. Purpose
    - Provides test data for delivery partner dashboard
    - Covers all order statuses for testing
*/

-- Add test orders for delivery partners
DO $$
DECLARE
  society_record record;
  tower_record record;
  flat_record record;
  user_id uuid;
  partner_id uuid;
  
  -- Order IDs
  order1_id uuid := gen_random_uuid();
  order2_id uuid := gen_random_uuid();
  order3_id uuid := gen_random_uuid();
  order4_id uuid := gen_random_uuid();
  
  -- Clothing type IDs
  shirt_id uuid;
  trouser_id uuid;
  tshirt_id uuid;
  jeans_id uuid;
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
  
  -- Get or create test user
  SELECT id INTO user_id FROM users WHERE username = 'birendra_suthar';
  
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
      'birendra_suthar',
      'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', -- 'secret123'
      'Birendra Suthar',
      '09581002105',
      society_record.id,
      tower_record.id,
      flat_record.id,
      2,
      1,
      'morning',
      'evening'
    ) RETURNING id INTO user_id;
  END IF;
  
  -- Get delivery partner
  SELECT id INTO partner_id FROM partners WHERE partner_type IN ('delivery', 'both') LIMIT 1;
  
  -- Get clothing types
  SELECT id INTO shirt_id FROM clothing_types WHERE name = 'Shirt' LIMIT 1;
  SELECT id INTO trouser_id FROM clothing_types WHERE name = 'Trouser' LIMIT 1;
  SELECT id INTO tshirt_id FROM clothing_types WHERE name = 'T-Shirt' LIMIT 1;
  SELECT id INTO jeans_id FROM clothing_types WHERE name = 'Jeans' LIMIT 1;
  
  -- Create pending pickup orders
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
      user_id,
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
      (order1_id, shirt_id, 3, 20, 60),
      (order1_id, trouser_id, 3, 25, 75),
      (order1_id, tshirt_id, 2, 15, 30);
  END IF;
  
  -- Create another pending pickup order
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
      user_id,
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
      (order2_id, shirt_id, 2, 20, 40),
      (order2_id, jeans_id, 2, 26, 52),
      (order2_id, tshirt_id, 3, 16, 48);
  END IF;
  
  -- Create assigned pickup order
  IF NOT EXISTS (SELECT 1 FROM orders WHERE id = order3_id) AND partner_id IS NOT NULL THEN
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
      user_id,
      CURRENT_DATE,
      'morning',
      'normal',
      120,
      CURRENT_TIMESTAMP + INTERVAL '2 days',
      'pending',
      CURRENT_TIMESTAMP - INTERVAL '1 day',
      partner_id
    );
    
    -- Add order items
    INSERT INTO order_items (order_id, clothing_type_id, quantity, rate, subtotal)
    VALUES 
      (order3_id, shirt_id, 4, 15, 60),
      (order3_id, trouser_id, 2, 18, 36),
      (order3_id, tshirt_id, 2, 12, 24);
  END IF;
  
  -- Create completed pickup order
  IF NOT EXISTS (SELECT 1 FROM orders WHERE id = order4_id) AND partner_id IS NOT NULL THEN
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
      user_id,
      CURRENT_DATE - INTERVAL '1 day',
      'evening',
      'express',
      190,
      CURRENT_TIMESTAMP + INTERVAL '1 day',
      'picked_up',
      CURRENT_TIMESTAMP - INTERVAL '2 days',
      partner_id,
      CURRENT_TIMESTAMP - INTERVAL '1 day'
    );
    
    -- Add order items
    INSERT INTO order_items (order_id, clothing_type_id, quantity, rate, subtotal)
    VALUES 
      (order4_id, shirt_id, 3, 25, 75),
      (order4_id, jeans_id, 2, 32, 64),
      (order4_id, tshirt_id, 3, 17, 51);
  END IF;
END $$;