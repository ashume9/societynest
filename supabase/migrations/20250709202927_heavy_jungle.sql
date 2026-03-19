/*
  # Add Ramu User and Sample Orders

  1. New User
    - `ramu` user with complete profile in Green Valley Society
    - Tower A, Flat 103 (new flat)
    - Phone and preferences set

  2. Sample Orders for Testing
    - Multiple orders in different states for comprehensive testing
    - Orders spanning all workflow stages
    - Realistic order items and amounts

  3. Additional Test Data
    - New flat for Ramu
    - Orders covering all partner dashboard scenarios
    - Complete order items with proper calculations
*/

-- Add new flat for Ramu
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM towers WHERE id = '660e8400-e29b-41d4-a716-446655440001') 
     AND NOT EXISTS (SELECT 1 FROM flats WHERE tower_id = '660e8400-e29b-41d4-a716-446655440001' AND number = '103') THEN
    INSERT INTO flats (id, tower_id, number) 
    VALUES ('770e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440001', '103');
  END IF;
END $$;

-- Add Ramu user
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE username = 'ramu') 
     AND EXISTS (SELECT 1 FROM societies WHERE id = '550e8400-e29b-41d4-a716-446655440001')
     AND EXISTS (SELECT 1 FROM towers WHERE id = '660e8400-e29b-41d4-a716-446655440001')
     AND EXISTS (SELECT 1 FROM flats WHERE id = '770e8400-e29b-41d4-a716-446655440006') THEN
    INSERT INTO users (id, username, password_hash, full_name, email, phone, society_id, tower_id, flat_id, adults, kids, pickup_slot, delivery_slot) 
    VALUES ('880e8400-e29b-41d4-a716-446655440006', 'ramu', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'Ramu Krishnan', 'ramu.krishnan@email.com', '+91-9876543215', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440006', 2, 1, 'morning', 'evening');
  END IF;
END $$;

-- Add comprehensive sample orders for Ramu to test all scenarios
DO $$
BEGIN
  -- 1. Pending pickup order (Global Queue - Pending Pickup)
  IF NOT EXISTS (SELECT 1 FROM orders WHERE id = 'bb0e8400-e29b-41d4-a716-446655440015') 
     AND EXISTS (SELECT 1 FROM users WHERE id = '880e8400-e29b-41d4-a716-446655440006') THEN
    INSERT INTO orders (id, user_id, pickup_date, pickup_slot, service_type, total_amount, estimated_delivery, status, created_at) 
    VALUES ('bb0e8400-e29b-41d4-a716-446655440015', '880e8400-e29b-41d4-a716-446655440006', '2025-01-16', 'morning', 'normal', 195, '2025-01-18 18:00:00+00', 'pending', '2025-01-15 09:30:00+00');
  END IF;
  
  -- 2. Ready for delivery order (Global Queue - Pending Delivery)
  IF NOT EXISTS (SELECT 1 FROM orders WHERE id = 'bb0e8400-e29b-41d4-a716-446655440016') 
     AND EXISTS (SELECT 1 FROM users WHERE id = '880e8400-e29b-41d4-a716-446655440006')
     AND EXISTS (SELECT 1 FROM partners WHERE id = '990e8400-e29b-41d4-a716-446655440001') THEN
    INSERT INTO orders (id, user_id, pickup_date, pickup_slot, service_type, total_amount, estimated_delivery, status, created_at, assigned_ironing_partner_id, ironing_started_at, ironing_completed_at) 
    VALUES ('bb0e8400-e29b-41d4-a716-446655440016', '880e8400-e29b-41d4-a716-446655440006', '2025-01-14', 'evening', 'priority', 240, '2025-01-15 19:00:00+00', 'ready', '2025-01-14 16:30:00+00', '990e8400-e29b-41d4-a716-446655440001', '2025-01-15 08:30:00+00', '2025-01-15 16:30:00+00');
  END IF;
  
  -- 3. Assigned for pickup (Pickup/Delivery Assignments)
  IF NOT EXISTS (SELECT 1 FROM orders WHERE id = 'bb0e8400-e29b-41d4-a716-446655440017') 
     AND EXISTS (SELECT 1 FROM users WHERE id = '880e8400-e29b-41d4-a716-446655440006')
     AND EXISTS (SELECT 1 FROM partners WHERE id = '990e8400-e29b-41d4-a716-446655440002') THEN
    INSERT INTO orders (id, user_id, pickup_date, pickup_slot, service_type, total_amount, estimated_delivery, status, created_at, assigned_delivery_partner_id) 
    VALUES ('bb0e8400-e29b-41d4-a716-446655440017', '880e8400-e29b-41d4-a716-446655440006', '2025-01-16', 'evening', 'express', 380, '2025-01-16 22:00:00+00', 'pending', '2025-01-15 12:30:00+00', '990e8400-e29b-41d4-a716-446655440002');
  END IF;
  
  -- 4. Assigned for delivery (Pickup/Delivery Assignments)
  IF NOT EXISTS (SELECT 1 FROM orders WHERE id = 'bb0e8400-e29b-41d4-a716-446655440018') 
     AND EXISTS (SELECT 1 FROM users WHERE id = '880e8400-e29b-41d4-a716-446655440006')
     AND EXISTS (SELECT 1 FROM partners WHERE id = '990e8400-e29b-41d4-a716-446655440001')
     AND EXISTS (SELECT 1 FROM partners WHERE id = '990e8400-e29b-41d4-a716-446655440003') THEN
    INSERT INTO orders (id, user_id, pickup_date, pickup_slot, service_type, total_amount, estimated_delivery, status, created_at, assigned_ironing_partner_id, ironing_started_at, ironing_completed_at, assigned_delivery_partner_id) 
    VALUES ('bb0e8400-e29b-41d4-a716-446655440018', '880e8400-e29b-41d4-a716-446655440006', '2025-01-14', 'morning', 'priority', 320, '2025-01-15 18:00:00+00', 'ready', '2025-01-14 07:45:00+00', '990e8400-e29b-41d4-a716-446655440001', '2025-01-14 14:00:00+00', '2025-01-15 15:30:00+00', '990e8400-e29b-41d4-a716-446655440003');
  END IF;
  
  -- 5. Pickup in progress (Pickup/Delivery Assignments)
  IF NOT EXISTS (SELECT 1 FROM orders WHERE id = 'bb0e8400-e29b-41d4-a716-446655440019') 
     AND EXISTS (SELECT 1 FROM users WHERE id = '880e8400-e29b-41d4-a716-446655440006')
     AND EXISTS (SELECT 1 FROM partners WHERE id = '990e8400-e29b-41d4-a716-446655440002') THEN
    INSERT INTO orders (id, user_id, pickup_date, pickup_slot, service_type, total_amount, estimated_delivery, status, created_at, assigned_delivery_partner_id, delivery_started_at) 
    VALUES ('bb0e8400-e29b-41d4-a716-446655440019', '880e8400-e29b-41d4-a716-446655440006', '2025-01-15', 'morning', 'normal', 165, '2025-01-17 18:00:00+00', 'pending', '2025-01-14 20:15:00+00', '990e8400-e29b-41d4-a716-446655440002', '2025-01-15 09:15:00+00');
  END IF;
  
  -- 6. Delivery in progress (Pickup/Delivery Assignments)
  IF NOT EXISTS (SELECT 1 FROM orders WHERE id = 'bb0e8400-e29b-41d4-a716-446655440020') 
     AND EXISTS (SELECT 1 FROM users WHERE id = '880e8400-e29b-41d4-a716-446655440006')
     AND EXISTS (SELECT 1 FROM partners WHERE id = '990e8400-e29b-41d4-a716-446655440001')
     AND EXISTS (SELECT 1 FROM partners WHERE id = '990e8400-e29b-41d4-a716-446655440003') THEN
    INSERT INTO orders (id, user_id, pickup_date, pickup_slot, service_type, total_amount, estimated_delivery, status, created_at, assigned_ironing_partner_id, ironing_started_at, ironing_completed_at, assigned_delivery_partner_id, delivery_started_at) 
    VALUES ('bb0e8400-e29b-41d4-a716-446655440020', '880e8400-e29b-41d4-a716-446655440006', '2025-01-13', 'evening', 'priority', 290, '2025-01-14 19:00:00+00', 'ready', '2025-01-13 17:00:00+00', '990e8400-e29b-41d4-a716-446655440001', '2025-01-14 09:00:00+00', '2025-01-14 17:00:00+00', '990e8400-e29b-41d4-a716-446655440003', '2025-01-15 16:30:00+00');
  END IF;
  
  -- 7. Completed pickup (Completed Pickup and Deliveries)
  IF NOT EXISTS (SELECT 1 FROM orders WHERE id = 'bb0e8400-e29b-41d4-a716-446655440021') 
     AND EXISTS (SELECT 1 FROM users WHERE id = '880e8400-e29b-41d4-a716-446655440006')
     AND EXISTS (SELECT 1 FROM partners WHERE id = '990e8400-e29b-41d4-a716-446655440002') THEN
    INSERT INTO orders (id, user_id, pickup_date, pickup_slot, service_type, total_amount, estimated_delivery, status, created_at, assigned_delivery_partner_id, delivery_started_at) 
    VALUES ('bb0e8400-e29b-41d4-a716-446655440021', '880e8400-e29b-41d4-a716-446655440006', '2025-01-12', 'morning', 'normal', 210, '2025-01-14 18:00:00+00', 'picked_up', '2025-01-12 08:00:00+00', '990e8400-e29b-41d4-a716-446655440002', '2025-01-13 08:30:00+00');
  END IF;
  
  -- 8. Completed delivery (Completed Pickup and Deliveries)
  IF NOT EXISTS (SELECT 1 FROM orders WHERE id = 'bb0e8400-e29b-41d4-a716-446655440022') 
     AND EXISTS (SELECT 1 FROM users WHERE id = '880e8400-e29b-41d4-a716-446655440006')
     AND EXISTS (SELECT 1 FROM partners WHERE id = '990e8400-e29b-41d4-a716-446655440001')
     AND EXISTS (SELECT 1 FROM partners WHERE id = '990e8400-e29b-41d4-a716-446655440003') THEN
    INSERT INTO orders (id, user_id, pickup_date, pickup_slot, service_type, total_amount, estimated_delivery, status, created_at, assigned_ironing_partner_id, ironing_started_at, ironing_completed_at, assigned_delivery_partner_id, delivery_started_at, delivery_completed_at) 
    VALUES ('bb0e8400-e29b-41d4-a716-446655440022', '880e8400-e29b-41d4-a716-446655440006', '2025-01-11', 'evening', 'express', 450, '2025-01-12 20:00:00+00', 'delivered', '2025-01-11 18:30:00+00', '990e8400-e29b-41d4-a716-446655440001', '2025-01-12 10:00:00+00', '2025-01-12 14:00:00+00', '990e8400-e29b-41d4-a716-446655440003', '2025-01-12 15:00:00+00', '2025-01-12 19:30:00+00');
  END IF;
  
  -- 9. Another completed delivery (Completed Pickup and Deliveries)
  IF NOT EXISTS (SELECT 1 FROM orders WHERE id = 'bb0e8400-e29b-41d4-a716-446655440023') 
     AND EXISTS (SELECT 1 FROM users WHERE id = '880e8400-e29b-41d4-a716-446655440006')
     AND EXISTS (SELECT 1 FROM partners WHERE id = '990e8400-e29b-41d4-a716-446655440001')
     AND EXISTS (SELECT 1 FROM partners WHERE id = '990e8400-e29b-41d4-a716-446655440002') THEN
    INSERT INTO orders (id, user_id, pickup_date, pickup_slot, service_type, total_amount, estimated_delivery, status, created_at, assigned_ironing_partner_id, ironing_started_at, ironing_completed_at, assigned_delivery_partner_id, delivery_started_at, delivery_completed_at) 
    VALUES ('bb0e8400-e29b-41d4-a716-446655440023', '880e8400-e29b-41d4-a716-446655440006', '2025-01-10', 'morning', 'priority', 275, '2025-01-11 18:00:00+00', 'delivered', '2025-01-10 09:15:00+00', '990e8400-e29b-41d4-a716-446655440001', '2025-01-11 08:00:00+00', '2025-01-11 16:00:00+00', '990e8400-e29b-41d4-a716-446655440002', '2025-01-11 17:00:00+00', '2025-01-11 18:45:00+00');
  END IF;
END $$;

-- Add order items for Ramu's orders
DO $$
BEGIN
  -- Order 15 items (₹195 total) - Pending pickup
  IF NOT EXISTS (SELECT 1 FROM order_items WHERE id = 'cc0e8400-e29b-41d4-a716-446655440061') 
     AND EXISTS (SELECT 1 FROM orders WHERE id = 'bb0e8400-e29b-41d4-a716-446655440015')
     AND EXISTS (SELECT 1 FROM clothing_types WHERE id = 'aa0e8400-e29b-41d4-a716-446655440001') THEN
    INSERT INTO order_items (id, order_id, clothing_type_id, quantity, rate, subtotal) 
    VALUES ('cc0e8400-e29b-41d4-a716-446655440061', 'bb0e8400-e29b-41d4-a716-446655440015', 'aa0e8400-e29b-41d4-a716-446655440001', 5, 15, 75);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM order_items WHERE id = 'cc0e8400-e29b-41d4-a716-446655440062') 
     AND EXISTS (SELECT 1 FROM orders WHERE id = 'bb0e8400-e29b-41d4-a716-446655440015')
     AND EXISTS (SELECT 1 FROM clothing_types WHERE id = 'aa0e8400-e29b-41d4-a716-446655440003') THEN
    INSERT INTO order_items (id, order_id, clothing_type_id, quantity, rate, subtotal) 
    VALUES ('cc0e8400-e29b-41d4-a716-446655440062', 'bb0e8400-e29b-41d4-a716-446655440015', 'aa0e8400-e29b-41d4-a716-446655440003', 3, 18, 54);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM order_items WHERE id = 'cc0e8400-e29b-41d4-a716-446655440063') 
     AND EXISTS (SELECT 1 FROM orders WHERE id = 'bb0e8400-e29b-41d4-a716-446655440015')
     AND EXISTS (SELECT 1 FROM clothing_types WHERE id = 'aa0e8400-e29b-41d4-a716-446655440002') THEN
    INSERT INTO order_items (id, order_id, clothing_type_id, quantity, rate, subtotal) 
    VALUES ('cc0e8400-e29b-41d4-a716-446655440063', 'bb0e8400-e29b-41d4-a716-446655440015', 'aa0e8400-e29b-41d4-a716-446655440002', 4, 12, 48);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM order_items WHERE id = 'cc0e8400-e29b-41d4-a716-446655440064') 
     AND EXISTS (SELECT 1 FROM orders WHERE id = 'bb0e8400-e29b-41d4-a716-446655440015')
     AND EXISTS (SELECT 1 FROM clothing_types WHERE id = 'aa0e8400-e29b-41d4-a716-446655440006') THEN
    INSERT INTO order_items (id, order_id, clothing_type_id, quantity, rate, subtotal) 
    VALUES ('cc0e8400-e29b-41d4-a716-446655440064', 'bb0e8400-e29b-41d4-a716-446655440015', 'aa0e8400-e29b-41d4-a716-446655440006', 1, 16, 18);
  END IF;
  
  -- Order 16 items (₹240 total) - Ready for delivery
  IF NOT EXISTS (SELECT 1 FROM order_items WHERE id = 'cc0e8400-e29b-41d4-a716-446655440065') 
     AND EXISTS (SELECT 1 FROM orders WHERE id = 'bb0e8400-e29b-41d4-a716-446655440016')
     AND EXISTS (SELECT 1 FROM clothing_types WHERE id = 'aa0e8400-e29b-41d4-a716-446655440001') THEN
    INSERT INTO order_items (id, order_id, clothing_type_id, quantity, rate, subtotal) 
    VALUES ('cc0e8400-e29b-41d4-a716-446655440065', 'bb0e8400-e29b-41d4-a716-446655440016', 'aa0e8400-e29b-41d4-a716-446655440001', 4, 20, 80);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM order_items WHERE id = 'cc0e8400-e29b-41d4-a716-446655440066') 
     AND EXISTS (SELECT 1 FROM orders WHERE id = 'bb0e8400-e29b-41d4-a716-446655440016')
     AND EXISTS (SELECT 1 FROM clothing_types WHERE id = 'aa0e8400-e29b-41d4-a716-446655440004') THEN
    INSERT INTO order_items (id, order_id, clothing_type_id, quantity, rate, subtotal) 
    VALUES ('cc0e8400-e29b-41d4-a716-446655440066', 'bb0e8400-e29b-41d4-a716-446655440016', 'aa0e8400-e29b-41d4-a716-446655440004', 2, 26, 52);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM order_items WHERE id = 'cc0e8400-e29b-41d4-a716-446655440067') 
     AND EXISTS (SELECT 1 FROM orders WHERE id = 'bb0e8400-e29b-41d4-a716-446655440016')
     AND EXISTS (SELECT 1 FROM clothing_types WHERE id = 'aa0e8400-e29b-41d4-a716-446655440005') THEN
    INSERT INTO order_items (id, order_id, clothing_type_id, quantity, rate, subtotal) 
    VALUES ('cc0e8400-e29b-41d4-a716-446655440067', 'bb0e8400-e29b-41d4-a716-446655440016', 'aa0e8400-e29b-41d4-a716-446655440005', 2, 35, 70);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM order_items WHERE id = 'cc0e8400-e29b-41d4-a716-446655440068') 
     AND EXISTS (SELECT 1 FROM orders WHERE id = 'bb0e8400-e29b-41d4-a716-446655440016')
     AND EXISTS (SELECT 1 FROM clothing_types WHERE id = 'aa0e8400-e29b-41d4-a716-446655440006') THEN
    INSERT INTO order_items (id, order_id, clothing_type_id, quantity, rate, subtotal) 
    VALUES ('cc0e8400-e29b-41d4-a716-446655440068', 'bb0e8400-e29b-41d4-a716-446655440016', 'aa0e8400-e29b-41d4-a716-446655440006', 2, 22, 38);
  END IF;
  
  -- Order 17 items (₹380 total) - Assigned for pickup (express)
  IF NOT EXISTS (SELECT 1 FROM order_items WHERE id = 'cc0e8400-e29b-41d4-a716-446655440069') 
     AND EXISTS (SELECT 1 FROM orders WHERE id = 'bb0e8400-e29b-41d4-a716-446655440017')
     AND EXISTS (SELECT 1 FROM clothing_types WHERE id = 'aa0e8400-e29b-41d4-a716-446655440001') THEN
    INSERT INTO order_items (id, order_id, clothing_type_id, quantity, rate, subtotal) 
    VALUES ('cc0e8400-e29b-41d4-a716-446655440069', 'bb0e8400-e29b-41d4-a716-446655440017', 'aa0e8400-e29b-41d4-a716-446655440001', 6, 25, 150);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM order_items WHERE id = 'cc0e8400-e29b-41d4-a716-446655440070') 
     AND EXISTS (SELECT 1 FROM orders WHERE id = 'bb0e8400-e29b-41d4-a716-446655440017')
     AND EXISTS (SELECT 1 FROM clothing_types WHERE id = 'aa0e8400-e29b-41d4-a716-446655440004') THEN
    INSERT INTO order_items (id, order_id, clothing_type_id, quantity, rate, subtotal) 
    VALUES ('cc0e8400-e29b-41d4-a716-446655440070', 'bb0e8400-e29b-41d4-a716-446655440017', 'aa0e8400-e29b-41d4-a716-446655440004', 3, 32, 96);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM order_items WHERE id = 'cc0e8400-e29b-41d4-a716-446655440071') 
     AND EXISTS (SELECT 1 FROM orders WHERE id = 'bb0e8400-e29b-41d4-a716-446655440017')
     AND EXISTS (SELECT 1 FROM clothing_types WHERE id = 'aa0e8400-e29b-41d4-a716-446655440005') THEN
    INSERT INTO order_items (id, order_id, clothing_type_id, quantity, rate, subtotal) 
    VALUES ('cc0e8400-e29b-41d4-a716-446655440071', 'bb0e8400-e29b-41d4-a716-446655440017', 'aa0e8400-e29b-41d4-a716-446655440005', 3, 45, 134);
  END IF;
  
  -- Order 18 items (₹320 total) - Assigned for delivery (priority)
  IF NOT EXISTS (SELECT 1 FROM order_items WHERE id = 'cc0e8400-e29b-41d4-a716-446655440072') 
     AND EXISTS (SELECT 1 FROM orders WHERE id = 'bb0e8400-e29b-41d4-a716-446655440018')
     AND EXISTS (SELECT 1 FROM clothing_types WHERE id = 'aa0e8400-e29b-41d4-a716-446655440001') THEN
    INSERT INTO order_items (id, order_id, clothing_type_id, quantity, rate, subtotal) 
    VALUES ('cc0e8400-e29b-41d4-a716-446655440072', 'bb0e8400-e29b-41d4-a716-446655440018', 'aa0e8400-e29b-41d4-a716-446655440001', 7, 20, 140);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM order_items WHERE id = 'cc0e8400-e29b-41d4-a716-446655440073') 
     AND EXISTS (SELECT 1 FROM orders WHERE id = 'bb0e8400-e29b-41d4-a716-446655440018')
     AND EXISTS (SELECT 1 FROM clothing_types WHERE id = 'aa0e8400-e29b-41d4-a716-446655440003') THEN
    INSERT INTO order_items (id, order_id, clothing_type_id, quantity, rate, subtotal) 
    VALUES ('cc0e8400-e29b-41d4-a716-446655440073', 'bb0e8400-e29b-41d4-a716-446655440018', 'aa0e8400-e29b-41d4-a716-446655440003', 4, 24, 96);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM order_items WHERE id = 'cc0e8400-e29b-41d4-a716-446655440074') 
     AND EXISTS (SELECT 1 FROM orders WHERE id = 'bb0e8400-e29b-41d4-a716-446655440018')
     AND EXISTS (SELECT 1 FROM clothing_types WHERE id = 'aa0e8400-e29b-41d4-a716-446655440006') THEN
    INSERT INTO order_items (id, order_id, clothing_type_id, quantity, rate, subtotal) 
    VALUES ('cc0e8400-e29b-41d4-a716-446655440074', 'bb0e8400-e29b-41d4-a716-446655440018', 'aa0e8400-e29b-41d4-a716-446655440006', 4, 22, 84);
  END IF;
  
  -- Order 19 items (₹165 total) - Pickup in progress
  IF NOT EXISTS (SELECT 1 FROM order_items WHERE id = 'cc0e8400-e29b-41d4-a716-446655440075') 
     AND EXISTS (SELECT 1 FROM orders WHERE id = 'bb0e8400-e29b-41d4-a716-446655440019')
     AND EXISTS (SELECT 1 FROM clothing_types WHERE id = 'aa0e8400-e29b-41d4-a716-446655440001') THEN
    INSERT INTO order_items (id, order_id, clothing_type_id, quantity, rate, subtotal) 
    VALUES ('cc0e8400-e29b-41d4-a716-446655440075', 'bb0e8400-e29b-41d4-a716-446655440019', 'aa0e8400-e29b-41d4-a716-446655440001', 4, 15, 60);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM order_items WHERE id = 'cc0e8400-e29b-41d4-a716-446655440076') 
     AND EXISTS (SELECT 1 FROM orders WHERE id = 'bb0e8400-e29b-41d4-a716-446655440019')
     AND EXISTS (SELECT 1 FROM clothing_types WHERE id = 'aa0e8400-e29b-41d4-a716-446655440002') THEN
    INSERT INTO order_items (id, order_id, clothing_type_id, quantity, rate, subtotal) 
    VALUES ('cc0e8400-e29b-41d4-a716-446655440076', 'bb0e8400-e29b-41d4-a716-446655440019', 'aa0e8400-e29b-41d4-a716-446655440002', 6, 12, 72);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM order_items WHERE id = 'cc0e8400-e29b-41d4-a716-446655440077') 
     AND EXISTS (SELECT 1 FROM orders WHERE id = 'bb0e8400-e29b-41d4-a716-446655440019')
     AND EXISTS (SELECT 1 FROM clothing_types WHERE id = 'aa0e8400-e29b-41d4-a716-446655440003') THEN
    INSERT INTO order_items (id, order_id, clothing_type_id, quantity, rate, subtotal) 
    VALUES ('cc0e8400-e29b-41d4-a716-446655440077', 'bb0e8400-e29b-41d4-a716-446655440019', 'aa0e8400-e29b-41d4-a716-446655440003', 2, 18, 33);
  END IF;
  
  -- Order 20 items (₹290 total) - Delivery in progress
  IF NOT EXISTS (SELECT 1 FROM order_items WHERE id = 'cc0e8400-e29b-41d4-a716-446655440078') 
     AND EXISTS (SELECT 1 FROM orders WHERE id = 'bb0e8400-e29b-41d4-a716-446655440020')
     AND EXISTS (SELECT 1 FROM clothing_types WHERE id = 'aa0e8400-e29b-41d4-a716-446655440001') THEN
    INSERT INTO order_items (id, order_id, clothing_type_id, quantity, rate, subtotal) 
    VALUES ('cc0e8400-e29b-41d4-a716-446655440078', 'bb0e8400-e29b-41d4-a716-446655440020', 'aa0e8400-e29b-41d4-a716-446655440001', 5, 20, 100);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM order_items WHERE id = 'cc0e8400-e29b-41d4-a716-446655440079') 
     AND EXISTS (SELECT 1 FROM orders WHERE id = 'bb0e8400-e29b-41d4-a716-446655440020')
     AND EXISTS (SELECT 1 FROM clothing_types WHERE id = 'aa0e8400-e29b-41d4-a716-446655440004') THEN
    INSERT INTO order_items (id, order_id, clothing_type_id, quantity, rate, subtotal) 
    VALUES ('cc0e8400-e29b-41d4-a716-446655440079', 'bb0e8400-e29b-41d4-a716-446655440020', 'aa0e8400-e29b-41d4-a716-446655440004', 3, 26, 78);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM order_items WHERE id = 'cc0e8400-e29b-41d4-a716-446655440080') 
     AND EXISTS (SELECT 1 FROM orders WHERE id = 'bb0e8400-e29b-41d4-a716-446655440020')
     AND EXISTS (SELECT 1 FROM clothing_types WHERE id = 'aa0e8400-e29b-41d4-a716-446655440005') THEN
    INSERT INTO order_items (id, order_id, clothing_type_id, quantity, rate, subtotal) 
    VALUES ('cc0e8400-e29b-41d4-a716-446655440080', 'bb0e8400-e29b-41d4-a716-446655440020', 'aa0e8400-e29b-41d4-a716-446655440005', 2, 35, 70);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM order_items WHERE id = 'cc0e8400-e29b-41d4-a716-446655440081') 
     AND EXISTS (SELECT 1 FROM orders WHERE id = 'bb0e8400-e29b-41d4-a716-446655440020')
     AND EXISTS (SELECT 1 FROM clothing_types WHERE id = 'aa0e8400-e29b-41d4-a716-446655440006') THEN
    INSERT INTO order_items (id, order_id, clothing_type_id, quantity, rate, subtotal) 
    VALUES ('cc0e8400-e29b-41d4-a716-446655440081', 'bb0e8400-e29b-41d4-a716-446655440020', 'aa0e8400-e29b-41d4-a716-446655440006', 2, 22, 42);
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