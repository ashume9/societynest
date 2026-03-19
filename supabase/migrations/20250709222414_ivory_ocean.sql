/*
  # Sample Data Migration for Testing

  This migration creates comprehensive sample data for testing the partner dashboard and order management system.

  ## New Data Created
  1. **Societies**: Green Valley Society, Blue Ridge Apartments
  2. **Towers**: Tower A, Tower B, Tower 1
  3. **Flats**: Various apartment numbers (101, 102, 201, 301, 401)
  4. **Users**: 5 test users with complete profiles
  5. **Partners**: 4 partners (ironing, delivery, both types)
  6. **Clothing Types**: 6 types with different rates
  7. **Orders**: 14 orders covering all workflow states
  8. **Order Items**: Detailed items for each order
  9. **Partner Sessions**: Test sessions for partner login

  ## Test Scenarios
  - Global Queue - Pending Pickup (3 orders)
  - Global Queue - Pending Delivery (2 orders) 
  - Pickup/Delivery Assignments (4 orders)
  - Completed Pickup and Deliveries (5 orders)

  ## Login Credentials
  - Password for all accounts: `secret123`
  - Partner usernames: `delivery_pro`, `all_service`, `pickup_expert`
  - User usernames: `john_doe`, `jane_smith`, `mike_wilson`, `sarah_jones`, `david_brown`
*/

-- Insert societies with conditional logic
DO $$
BEGIN
  -- Check if societies exist before inserting
  IF NOT EXISTS (SELECT 1 FROM societies WHERE name = 'Green Valley Society') THEN
    INSERT INTO societies (id, name) VALUES ('550e8400-e29b-41d4-a716-446655440001', 'Green Valley Society');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM societies WHERE name = 'Blue Ridge Apartments') THEN
    INSERT INTO societies (id, name) VALUES ('550e8400-e29b-41d4-a716-446655440002', 'Blue Ridge Apartments');
  END IF;
END $$;

-- Insert towers with conditional logic
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM societies WHERE id = '550e8400-e29b-41d4-a716-446655440001') 
     AND NOT EXISTS (SELECT 1 FROM towers WHERE society_id = '550e8400-e29b-41d4-a716-446655440001' AND name = 'Tower A') THEN
    INSERT INTO towers (id, society_id, name) VALUES ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Tower A');
  END IF;
  
  IF EXISTS (SELECT 1 FROM societies WHERE id = '550e8400-e29b-41d4-a716-446655440001') 
     AND NOT EXISTS (SELECT 1 FROM towers WHERE society_id = '550e8400-e29b-41d4-a716-446655440001' AND name = 'Tower B') THEN
    INSERT INTO towers (id, society_id, name) VALUES ('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Tower B');
  END IF;
  
  IF EXISTS (SELECT 1 FROM societies WHERE id = '550e8400-e29b-41d4-a716-446655440002') 
     AND NOT EXISTS (SELECT 1 FROM towers WHERE society_id = '550e8400-e29b-41d4-a716-446655440002' AND name = 'Tower 1') THEN
    INSERT INTO towers (id, society_id, name) VALUES ('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'Tower 1');
  END IF;
END $$;

-- Insert flats with conditional logic
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM towers WHERE id = '660e8400-e29b-41d4-a716-446655440001') 
     AND NOT EXISTS (SELECT 1 FROM flats WHERE tower_id = '660e8400-e29b-41d4-a716-446655440001' AND number = '101') THEN
    INSERT INTO flats (id, tower_id, number) VALUES ('770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '101');
  END IF;
  
  IF EXISTS (SELECT 1 FROM towers WHERE id = '660e8400-e29b-41d4-a716-446655440001') 
     AND NOT EXISTS (SELECT 1 FROM flats WHERE tower_id = '660e8400-e29b-41d4-a716-446655440001' AND number = '102') THEN
    INSERT INTO flats (id, tower_id, number) VALUES ('770e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', '102');
  END IF;
  
  IF EXISTS (SELECT 1 FROM towers WHERE id = '660e8400-e29b-41d4-a716-446655440001') 
     AND NOT EXISTS (SELECT 1 FROM flats WHERE tower_id = '660e8400-e29b-41d4-a716-446655440001' AND number = '201') THEN
    INSERT INTO flats (id, tower_id, number) VALUES ('770e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440001', '201');
  END IF;
  
  IF EXISTS (SELECT 1 FROM towers WHERE id = '660e8400-e29b-41d4-a716-446655440002') 
     AND NOT EXISTS (SELECT 1 FROM flats WHERE tower_id = '660e8400-e29b-41d4-a716-446655440002' AND number = '301') THEN
    INSERT INTO flats (id, tower_id, number) VALUES ('770e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440002', '301');
  END IF;
  
  IF EXISTS (SELECT 1 FROM towers WHERE id = '660e8400-e29b-41d4-a716-446655440003') 
     AND NOT EXISTS (SELECT 1 FROM flats WHERE tower_id = '660e8400-e29b-41d4-a716-446655440003' AND number = '401') THEN
    INSERT INTO flats (id, tower_id, number) VALUES ('770e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440003', '401');
  END IF;
END $$;

-- Insert users with conditional logic
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE username = 'john_doe') 
     AND EXISTS (SELECT 1 FROM societies WHERE id = '550e8400-e29b-41d4-a716-446655440001')
     AND EXISTS (SELECT 1 FROM towers WHERE id = '660e8400-e29b-41d4-a716-446655440001')
     AND EXISTS (SELECT 1 FROM flats WHERE id = '770e8400-e29b-41d4-a716-446655440001') THEN
    INSERT INTO users (id, username, password_hash, full_name, phone, society_id, tower_id, flat_id, adults, kids, pickup_slot, delivery_slot) 
    VALUES ('880e8400-e29b-41d4-a716-446655440001', 'john_doe', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'John Doe', '+91-9876543210', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 2, 1, 'morning', 'evening');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM users WHERE username = 'jane_smith') 
     AND EXISTS (SELECT 1 FROM societies WHERE id = '550e8400-e29b-41d4-a716-446655440001')
     AND EXISTS (SELECT 1 FROM towers WHERE id = '660e8400-e29b-41d4-a716-446655440001')
     AND EXISTS (SELECT 1 FROM flats WHERE id = '770e8400-e29b-41d4-a716-446655440002') THEN
    INSERT INTO users (id, username, password_hash, full_name, phone, society_id, tower_id, flat_id, adults, kids, pickup_slot, delivery_slot) 
    VALUES ('880e8400-e29b-41d4-a716-446655440002', 'jane_smith', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'Jane Smith', '+91-9876543211', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440002', 2, 0, 'evening', 'morning');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM users WHERE username = 'mike_wilson') 
     AND EXISTS (SELECT 1 FROM societies WHERE id = '550e8400-e29b-41d4-a716-446655440001')
     AND EXISTS (SELECT 1 FROM towers WHERE id = '660e8400-e29b-41d4-a716-446655440001')
     AND EXISTS (SELECT 1 FROM flats WHERE id = '770e8400-e29b-41d4-a716-446655440003') THEN
    INSERT INTO users (id, username, password_hash, full_name, phone, society_id, tower_id, flat_id, adults, kids, pickup_slot, delivery_slot) 
    VALUES ('880e8400-e29b-41d4-a716-446655440003', 'mike_wilson', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'Mike Wilson', '+91-9876543212', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440003', 3, 2, 'morning', 'evening');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM users WHERE username = 'sarah_jones') 
     AND EXISTS (SELECT 1 FROM societies WHERE id = '550e8400-e29b-41d4-a716-446655440001')
     AND EXISTS (SELECT 1 FROM towers WHERE id = '660e8400-e29b-41d4-a716-446655440002')
     AND EXISTS (SELECT 1 FROM flats WHERE id = '770e8400-e29b-41d4-a716-446655440004') THEN
    INSERT INTO users (id, username, password_hash, full_name, phone, society_id, tower_id, flat_id, adults, kids, pickup_slot, delivery_slot) 
    VALUES ('880e8400-e29b-41d4-a716-446655440004', 'sarah_jones', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'Sarah Jones', '+91-9876543213', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440004', 2, 1, 'evening', 'morning');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM users WHERE username = 'david_brown') 
     AND EXISTS (SELECT 1 FROM societies WHERE id = '550e8400-e29b-41d4-a716-446655440002')
     AND EXISTS (SELECT 1 FROM towers WHERE id = '660e8400-e29b-41d4-a716-446655440003')
     AND EXISTS (SELECT 1 FROM flats WHERE id = '770e8400-e29b-41d4-a716-446655440005') THEN
    INSERT INTO users (id, username, password_hash, full_name, phone, society_id, tower_id, flat_id, adults, kids, pickup_slot, delivery_slot) 
    VALUES ('880e8400-e29b-41d4-a716-446655440005', 'david_brown', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'David Brown', '+91-9876543214', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440005', 1, 0, 'morning', 'evening');
  END IF;
END $$;

-- Insert partners with conditional logic
DO $$
BEGIN
  -- Check for existing partners by username
  IF NOT EXISTS (SELECT 1 FROM partners WHERE username = 'iron_master') 
     AND EXISTS (SELECT 1 FROM societies WHERE id = '550e8400-e29b-41d4-a716-446655440001')
     AND EXISTS (SELECT 1 FROM towers WHERE id = '660e8400-e29b-41d4-a716-446655440001') THEN
    INSERT INTO partners (id, username, password_hash, full_name, phone, partner_type, society_id, tower_id, identity_type, identity_number, working_days, holiday_day, status) 
    VALUES ('990e8400-e29b-41d4-a716-446655440001', 'iron_master', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'Ravi Kumar', '+91-9876543220', 'ironing', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'aadhar', '123456789012', ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'], 'sunday', 'approved');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM partners WHERE username = 'delivery_pro') 
     AND EXISTS (SELECT 1 FROM societies WHERE id = '550e8400-e29b-41d4-a716-446655440001')
     AND EXISTS (SELECT 1 FROM towers WHERE id = '660e8400-e29b-41d4-a716-446655440001') THEN
    INSERT INTO partners (id, username, password_hash, full_name, phone, partner_type, society_id, tower_id, identity_type, identity_number, working_days, holiday_day, status) 
    VALUES ('990e8400-e29b-41d4-a716-446655440002', 'delivery_pro', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'Suresh Patel', '+91-9876543221', 'delivery', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'aadhar', '123456789013', ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'], 'sunday', 'approved');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM partners WHERE username = 'all_service') 
     AND EXISTS (SELECT 1 FROM societies WHERE id = '550e8400-e29b-41d4-a716-446655440001')
     AND EXISTS (SELECT 1 FROM towers WHERE id = '660e8400-e29b-41d4-a716-446655440002') THEN
    INSERT INTO partners (id, username, password_hash, full_name, phone, partner_type, society_id, tower_id, identity_type, identity_number, working_days, holiday_day, status) 
    VALUES ('990e8400-e29b-41d4-a716-446655440003', 'all_service', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'Amit Sharma', '+91-9876543222', 'both', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440002', 'aadhar', '123456789014', ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'], 'sunday', 'approved');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM partners WHERE username = 'pickup_expert') 
     AND EXISTS (SELECT 1 FROM societies WHERE id = '550e8400-e29b-41d4-a716-446655440002')
     AND EXISTS (SELECT 1 FROM towers WHERE id = '660e8400-e29b-41d4-a716-446655440003') THEN
    INSERT INTO partners (id, username, password_hash, full_name, phone, partner_type, society_id, tower_id, identity_type, identity_number, working_days, holiday_day, status) 
    VALUES ('990e8400-e29b-41d4-a716-446655440004', 'pickup_expert', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'Rajesh Singh', '+91-9876543223', 'delivery', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440003', 'aadhar', '123456789015', ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'], 'sunday', 'approved');
  END IF;
END $$;

-- Insert clothing types with conditional logic
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM clothing_types WHERE name = 'Shirt') THEN
    INSERT INTO clothing_types (id, name, normal_rate, priority_rate, express_rate) VALUES ('aa0e8400-e29b-41d4-a716-446655440001', 'Shirt', 15, 20, 25);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM clothing_types WHERE name = 'T-Shirt') THEN
    INSERT INTO clothing_types (id, name, normal_rate, priority_rate, express_rate) VALUES ('aa0e8400-e29b-41d4-a716-446655440002', 'T-Shirt', 12, 16, 20);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM clothing_types WHERE name = 'Trouser') THEN
    INSERT INTO clothing_types (id, name, normal_rate, priority_rate, express_rate) VALUES ('aa0e8400-e29b-41d4-a716-446655440003', 'Trouser', 18, 24, 30);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM clothing_types WHERE name = 'Jeans') THEN
    INSERT INTO clothing_types (id, name, normal_rate, priority_rate, express_rate) VALUES ('aa0e8400-e29b-41d4-a716-446655440004', 'Jeans', 20, 26, 32);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM clothing_types WHERE name = 'Saree') THEN
    INSERT INTO clothing_types (id, name, normal_rate, priority_rate, express_rate) VALUES ('aa0e8400-e29b-41d4-a716-446655440005', 'Saree', 25, 35, 45);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM clothing_types WHERE name = 'Kurta') THEN
    INSERT INTO clothing_types (id, name, normal_rate, priority_rate, express_rate) VALUES ('aa0e8400-e29b-41d4-a716-446655440006', 'Kurta', 16, 22, 28);
  END IF;
END $$;

-- Insert orders with conditional logic
DO $$
BEGIN
  -- Orders pending pickup (Global Queue - Pending Pickup)
  IF NOT EXISTS (SELECT 1 FROM orders WHERE id = 'bb0e8400-e29b-41d4-a716-446655440001') 
     AND EXISTS (SELECT 1 FROM users WHERE id = '880e8400-e29b-41d4-a716-446655440001') THEN
    INSERT INTO orders (id, user_id, pickup_date, pickup_slot, service_type, total_amount, estimated_delivery, status, created_at) 
    VALUES ('bb0e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001', '2025-01-16', 'morning', 'normal', 150, '2025-01-18 18:00:00+00', 'pending', '2025-01-15 10:30:00+00');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM orders WHERE id = 'bb0e8400-e29b-41d4-a716-446655440002') 
     AND EXISTS (SELECT 1 FROM users WHERE id = '880e8400-e29b-41d4-a716-446655440002') THEN
    INSERT INTO orders (id, user_id, pickup_date, pickup_slot, service_type, total_amount, estimated_delivery, status, created_at) 
    VALUES ('bb0e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440002', '2025-01-16', 'evening', 'priority', 280, '2025-01-17 19:00:00+00', 'pending', '2025-01-15 14:20:00+00');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM orders WHERE id = 'bb0e8400-e29b-41d4-a716-446655440003') 
     AND EXISTS (SELECT 1 FROM users WHERE id = '880e8400-e29b-41d4-a716-446655440003') THEN
    INSERT INTO orders (id, user_id, pickup_date, pickup_slot, service_type, total_amount, estimated_delivery, status, created_at) 
    VALUES ('bb0e8400-e29b-41d4-a716-446655440003', '880e8400-e29b-41d4-a716-446655440003', '2025-01-17', 'morning', 'express', 320, '2025-01-17 16:00:00+00', 'pending', '2025-01-15 16:45:00+00');
  END IF;
  
  -- Orders ready for delivery (Global Queue - Pending Delivery)
  IF NOT EXISTS (SELECT 1 FROM orders WHERE id = 'bb0e8400-e29b-41d4-a716-446655440004') 
     AND EXISTS (SELECT 1 FROM users WHERE id = '880e8400-e29b-41d4-a716-446655440004')
     AND EXISTS (SELECT 1 FROM partners WHERE id = '990e8400-e29b-41d4-a716-446655440001') THEN
    INSERT INTO orders (id, user_id, pickup_date, pickup_slot, service_type, total_amount, estimated_delivery, status, created_at, assigned_ironing_partner_id, ironing_started_at, ironing_completed_at) 
    VALUES ('bb0e8400-e29b-41d4-a716-446655440004', '880e8400-e29b-41d4-a716-446655440004', '2025-01-14', 'morning', 'normal', 200, '2025-01-16 18:00:00+00', 'ready', '2025-01-14 09:15:00+00', '990e8400-e29b-41d4-a716-446655440001', '2025-01-15 09:00:00+00', '2025-01-15 17:00:00+00');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM orders WHERE id = 'bb0e8400-e29b-41d4-a716-446655440005') 
     AND EXISTS (SELECT 1 FROM users WHERE id = '880e8400-e29b-41d4-a716-446655440005')
     AND EXISTS (SELECT 1 FROM partners WHERE id = '990e8400-e29b-41d4-a716-446655440003') THEN
    INSERT INTO orders (id, user_id, pickup_date, pickup_slot, service_type, total_amount, estimated_delivery, status, created_at, assigned_ironing_partner_id, ironing_started_at, ironing_completed_at) 
    VALUES ('bb0e8400-e29b-41d4-a716-446655440005', '880e8400-e29b-41d4-a716-446655440005', '2025-01-14', 'evening', 'priority', 180, '2025-01-15 19:00:00+00', 'ready', '2025-01-14 15:30:00+00', '990e8400-e29b-41d4-a716-446655440003', '2025-01-15 10:00:00+00', '2025-01-15 18:00:00+00');
  END IF;
  
  -- Orders assigned for pickup (Pickup/Delivery Assignments)
  IF NOT EXISTS (SELECT 1 FROM orders WHERE id = 'bb0e8400-e29b-41d4-a716-446655440006') 
     AND EXISTS (SELECT 1 FROM users WHERE id = '880e8400-e29b-41d4-a716-446655440001')
     AND EXISTS (SELECT 1 FROM partners WHERE id = '990e8400-e29b-41d4-a716-446655440002') THEN
    INSERT INTO orders (id, user_id, pickup_date, pickup_slot, service_type, total_amount, estimated_delivery, status, created_at, assigned_delivery_partner_id) 
    VALUES ('bb0e8400-e29b-41d4-a716-446655440006', '880e8400-e29b-41d4-a716-446655440001', '2025-01-16', 'morning', 'normal', 240, '2025-01-18 18:00:00+00', 'pending', '2025-01-15 11:00:00+00', '990e8400-e29b-41d4-a716-446655440002');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM orders WHERE id = 'bb0e8400-e29b-41d4-a716-446655440007') 
     AND EXISTS (SELECT 1 FROM users WHERE id = '880e8400-e29b-41d4-a716-446655440002')
     AND EXISTS (SELECT 1 FROM partners WHERE id = '990e8400-e29b-41d4-a716-446655440003') THEN
    INSERT INTO orders (id, user_id, pickup_date, pickup_slot, service_type, total_amount, estimated_delivery, status, created_at, assigned_delivery_partner_id) 
    VALUES ('bb0e8400-e29b-41d4-a716-446655440007', '880e8400-e29b-41d4-a716-446655440002', '2025-01-16', 'evening', 'priority', 160, '2025-01-17 19:00:00+00', 'pending', '2025-01-15 13:45:00+00', '990e8400-e29b-41d4-a716-446655440003');
  END IF;
  
  -- Orders assigned for delivery (Pickup/Delivery Assignments)
  IF NOT EXISTS (SELECT 1 FROM orders WHERE id = 'bb0e8400-e29b-41d4-a716-446655440008') 
     AND EXISTS (SELECT 1 FROM users WHERE id = '880e8400-e29b-41d4-a716-446655440003')
     AND EXISTS (SELECT 1 FROM partners WHERE id = '990e8400-e29b-41d4-a716-446655440001')
     AND EXISTS (SELECT 1 FROM partners WHERE id = '990e8400-e29b-41d4-a716-446655440002') THEN
    INSERT INTO orders (id, user_id, pickup_date, pickup_slot, service_type, total_amount, estimated_delivery, status, created_at, assigned_ironing_partner_id, ironing_started_at, ironing_completed_at, assigned_delivery_partner_id) 
    VALUES ('bb0e8400-e29b-41d4-a716-446655440008', '880e8400-e29b-41d4-a716-446655440003', '2025-01-14', 'morning', 'normal', 300, '2025-01-16 18:00:00+00', 'ready', '2025-01-14 08:30:00+00', '990e8400-e29b-41d4-a716-446655440001', '2025-01-15 08:00:00+00', '2025-01-15 16:30:00+00', '990e8400-e29b-41d4-a716-446655440002');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM orders WHERE id = 'bb0e8400-e29b-41d4-a716-446655440009') 
     AND EXISTS (SELECT 1 FROM users WHERE id = '880e8400-e29b-41d4-a716-446655440004')
     AND EXISTS (SELECT 1 FROM partners WHERE id = '990e8400-e29b-41d4-a716-446655440003')
     AND EXISTS (SELECT 1 FROM partners WHERE id = '990e8400-e29b-41d4-a716-446655440004') THEN
    INSERT INTO orders (id, user_id, pickup_date, pickup_slot, service_type, total_amount, estimated_delivery, status, created_at, assigned_ironing_partner_id, ironing_started_at, ironing_completed_at, assigned_delivery_partner_id) 
    VALUES ('bb0e8400-e29b-41d4-a716-446655440009', '880e8400-e29b-41d4-a716-446655440004', '2025-01-14', 'evening', 'express', 400, '2025-01-15 20:00:00+00', 'ready', '2025-01-14 16:00:00+00', '990e8400-e29b-41d4-a716-446655440003', '2025-01-15 11:00:00+00', '2025-01-15 19:00:00+00', '990e8400-e29b-41d4-a716-446655440004');
  END IF;
  
  -- Completed pickup orders (Completed Pickup and Deliveries)
  IF NOT EXISTS (SELECT 1 FROM orders WHERE id = 'bb0e8400-e29b-41d4-a716-446655440010') 
     AND EXISTS (SELECT 1 FROM users WHERE id = '880e8400-e29b-41d4-a716-446655440005')
     AND EXISTS (SELECT 1 FROM partners WHERE id = '990e8400-e29b-41d4-a716-446655440002') THEN
    INSERT INTO orders (id, user_id, pickup_date, pickup_slot, service_type, total_amount, estimated_delivery, status, created_at, assigned_delivery_partner_id, delivery_started_at) 
    VALUES ('bb0e8400-e29b-41d4-a716-446655440010', '880e8400-e29b-41d4-a716-446655440005', '2025-01-13', 'morning', 'normal', 220, '2025-01-15 18:00:00+00', 'picked_up', '2025-01-13 09:00:00+00', '990e8400-e29b-41d4-a716-446655440002', '2025-01-14 09:00:00+00');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM orders WHERE id = 'bb0e8400-e29b-41d4-a716-446655440011') 
     AND EXISTS (SELECT 1 FROM users WHERE id = '880e8400-e29b-41d4-a716-446655440001')
     AND EXISTS (SELECT 1 FROM partners WHERE id = '990e8400-e29b-41d4-a716-446655440003') THEN
    INSERT INTO orders (id, user_id, pickup_date, pickup_slot, service_type, total_amount, estimated_delivery, status, created_at, assigned_delivery_partner_id, delivery_started_at) 
    VALUES ('bb0e8400-e29b-41d4-a716-446655440011', '880e8400-e29b-41d4-a716-446655440001', '2025-01-13', 'evening', 'priority', 180, '2025-01-14 19:00:00+00', 'picked_up', '2025-01-13 15:30:00+00', '990e8400-e29b-41d4-a716-446655440003', '2025-01-14 16:00:00+00');
  END IF;
  
  -- Completed delivery orders (Completed Pickup and Deliveries)
  IF NOT EXISTS (SELECT 1 FROM orders WHERE id = 'bb0e8400-e29b-41d4-a716-446655440012') 
     AND EXISTS (SELECT 1 FROM users WHERE id = '880e8400-e29b-41d4-a716-446655440002')
     AND EXISTS (SELECT 1 FROM partners WHERE id = '990e8400-e29b-41d4-a716-446655440001')
     AND EXISTS (SELECT 1 FROM partners WHERE id = '990e8400-e29b-41d4-a716-446655440002') THEN
    INSERT INTO orders (id, user_id, pickup_date, pickup_slot, service_type, total_amount, estimated_delivery, status, created_at, assigned_ironing_partner_id, ironing_started_at, ironing_completed_at, assigned_delivery_partner_id, delivery_started_at, delivery_completed_at) 
    VALUES ('bb0e8400-e29b-41d4-a716-446655440012', '880e8400-e29b-41d4-a716-446655440002', '2025-01-12', 'morning', 'normal', 350, '2025-01-14 18:00:00+00', 'delivered', '2025-01-12 10:00:00+00', '990e8400-e29b-41d4-a716-446655440001', '2025-01-13 09:00:00+00', '2025-01-13 17:00:00+00', '990e8400-e29b-41d4-a716-446655440002', '2025-01-14 09:00:00+00', '2025-01-14 18:30:00+00');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM orders WHERE id = 'bb0e8400-e29b-41d4-a716-446655440013') 
     AND EXISTS (SELECT 1 FROM users WHERE id = '880e8400-e29b-41d4-a716-446655440003')
     AND EXISTS (SELECT 1 FROM partners WHERE id = '990e8400-e29b-41d4-a716-446655440003')
     AND EXISTS (SELECT 1 FROM partners WHERE id = '990e8400-e29b-41d4-a716-446655440004') THEN
    INSERT INTO orders (id, user_id, pickup_date, pickup_slot, service_type, total_amount, estimated_delivery, status, created_at, assigned_ironing_partner_id, ironing_started_at, ironing_completed_at, assigned_delivery_partner_id, delivery_started_at, delivery_completed_at) 
    VALUES ('bb0e8400-e29b-41d4-a716-446655440013', '880e8400-e29b-41d4-a716-446655440003', '2025-01-12', 'evening', 'express', 480, '2025-01-13 20:00:00+00', 'delivered', '2025-01-12 16:00:00+00', '990e8400-e29b-41d4-a716-446655440003', '2025-01-13 12:00:00+00', '2025-01-13 16:00:00+00', '990e8400-e29b-41d4-a716-446655440004', '2025-01-13 17:00:00+00', '2025-01-13 19:45:00+00');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM orders WHERE id = 'bb0e8400-e29b-41d4-a716-446655440014') 
     AND EXISTS (SELECT 1 FROM users WHERE id = '880e8400-e29b-41d4-a716-446655440004')
     AND EXISTS (SELECT 1 FROM partners WHERE id = '990e8400-e29b-41d4-a716-446655440001')
     AND EXISTS (SELECT 1 FROM partners WHERE id = '990e8400-e29b-41d4-a716-446655440002') THEN
    INSERT INTO orders (id, user_id, pickup_date, pickup_slot, service_type, total_amount, estimated_delivery, status, created_at, assigned_ironing_partner_id, ironing_started_at, ironing_completed_at, assigned_delivery_partner_id, delivery_started_at, delivery_completed_at) 
    VALUES ('bb0e8400-e29b-41d4-a716-446655440014', '880e8400-e29b-41d4-a716-446655440004', '2025-01-11', 'morning', 'priority', 260, '2025-01-12 18:00:00+00', 'delivered', '2025-01-11 08:30:00+00', '990e8400-e29b-41d4-a716-446655440001', '2025-01-12 08:00:00+00', '2025-01-12 16:00:00+00', '990e8400-e29b-41d4-a716-446655440002', '2025-01-12 17:00:00+00', '2025-01-12 18:15:00+00');
  END IF;
END $$;

-- Insert order items with conditional logic
DO $$
BEGIN
  -- Order 1 items (₹150 total)
  IF NOT EXISTS (SELECT 1 FROM order_items WHERE id = 'cc0e8400-e29b-41d4-a716-446655440001') 
     AND EXISTS (SELECT 1 FROM orders WHERE id = 'bb0e8400-e29b-41d4-a716-446655440001')
     AND EXISTS (SELECT 1 FROM clothing_types WHERE id = 'aa0e8400-e29b-41d4-a716-446655440001') THEN
    INSERT INTO order_items (id, order_id, clothing_type_id, quantity, rate, subtotal) 
    VALUES ('cc0e8400-e29b-41d4-a716-446655440001', 'bb0e8400-e29b-41d4-a716-446655440001', 'aa0e8400-e29b-41d4-a716-446655440001', 3, 15, 45);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM order_items WHERE id = 'cc0e8400-e29b-41d4-a716-446655440002') 
     AND EXISTS (SELECT 1 FROM orders WHERE id = 'bb0e8400-e29b-41d4-a716-446655440001')
     AND EXISTS (SELECT 1 FROM clothing_types WHERE id = 'aa0e8400-e29b-41d4-a716-446655440002') THEN
    INSERT INTO order_items (id, order_id, clothing_type_id, quantity, rate, subtotal) 
    VALUES ('cc0e8400-e29b-41d4-a716-446655440002', 'bb0e8400-e29b-41d4-a716-446655440001', 'aa0e8400-e29b-41d4-a716-446655440002', 5, 12, 60);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM order_items WHERE id = 'cc0e8400-e29b-41d4-a716-446655440003') 
     AND EXISTS (SELECT 1 FROM orders WHERE id = 'bb0e8400-e29b-41d4-a716-446655440001')
     AND EXISTS (SELECT 1 FROM clothing_types WHERE id = 'aa0e8400-e29b-41d4-a716-446655440003') THEN
    INSERT INTO order_items (id, order_id, clothing_type_id, quantity, rate, subtotal) 
    VALUES ('cc0e8400-e29b-41d4-a716-446655440003', 'bb0e8400-e29b-41d4-a716-446655440001', 'aa0e8400-e29b-41d4-a716-446655440003', 2, 18, 36);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM order_items WHERE id = 'cc0e8400-e29b-41d4-a716-446655440004') 
     AND EXISTS (SELECT 1 FROM orders WHERE id = 'bb0e8400-e29b-41d4-a716-446655440001')
     AND EXISTS (SELECT 1 FROM clothing_types WHERE id = 'aa0e8400-e29b-41d4-a716-446655440006') THEN
    INSERT INTO order_items (id, order_id, clothing_type_id, quantity, rate, subtotal) 
    VALUES ('cc0e8400-e29b-41d4-a716-446655440004', 'bb0e8400-e29b-41d4-a716-446655440001', 'aa0e8400-e29b-41d4-a716-446655440006', 1, 16, 9);
  END IF;
  
  -- Order 2 items (₹280 total)
  IF NOT EXISTS (SELECT 1 FROM order_items WHERE id = 'cc0e8400-e29b-41d4-a716-446655440005') 
     AND EXISTS (SELECT 1 FROM orders WHERE id = 'bb0e8400-e29b-41d4-a716-446655440002')
     AND EXISTS (SELECT 1 FROM clothing_types WHERE id = 'aa0e8400-e29b-41d4-a716-446655440001') THEN
    INSERT INTO order_items (id, order_id, clothing_type_id, quantity, rate, subtotal) 
    VALUES ('cc0e8400-e29b-41d4-a716-446655440005', 'bb0e8400-e29b-41d4-a716-446655440002', 'aa0e8400-e29b-41d4-a716-446655440001', 4, 20, 80);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM order_items WHERE id = 'cc0e8400-e29b-41d4-a716-446655440006') 
     AND EXISTS (SELECT 1 FROM orders WHERE id = 'bb0e8400-e29b-41d4-a716-446655440002')
     AND EXISTS (SELECT 1 FROM clothing_types WHERE id = 'aa0e8400-e29b-41d4-a716-446655440004') THEN
    INSERT INTO order_items (id, order_id, clothing_type_id, quantity, rate, subtotal) 
    VALUES ('cc0e8400-e29b-41d4-a716-446655440006', 'bb0e8400-e29b-41d4-a716-446655440002', 'aa0e8400-e29b-41d4-a716-446655440004', 3, 26, 78);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM order_items WHERE id = 'cc0e8400-e29b-41d4-a716-446655440007') 
     AND EXISTS (SELECT 1 FROM orders WHERE id = 'bb0e8400-e29b-41d4-a716-446655440002')
     AND EXISTS (SELECT 1 FROM clothing_types WHERE id = 'aa0e8400-e29b-41d4-a716-446655440005') THEN
    INSERT INTO order_items (id, order_id, clothing_type_id, quantity, rate, subtotal) 
    VALUES ('cc0e8400-e29b-41d4-a716-446655440007', 'bb0e8400-e29b-41d4-a716-446655440002', 'aa0e8400-e29b-41d4-a716-446655440005', 2, 35, 70);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM order_items WHERE id = 'cc0e8400-e29b-41d4-a716-446655440008') 
     AND EXISTS (SELECT 1 FROM orders WHERE id = 'bb0e8400-e29b-41d4-a716-446655440002')
     AND EXISTS (SELECT 1 FROM clothing_types WHERE id = 'aa0e8400-e29b-41d4-a716-446655440006') THEN
    INSERT INTO order_items (id, order_id, clothing_type_id, quantity, rate, subtotal) 
    VALUES ('cc0e8400-e29b-41d4-a716-446655440008', 'bb0e8400-e29b-41d4-a716-446655440002', 'aa0e8400-e29b-41d4-a716-446655440006', 2, 22, 44);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM order_items WHERE id = 'cc0e8400-e29b-41d4-a716-446655440009') 
     AND EXISTS (SELECT 1 FROM orders WHERE id = 'bb0e8400-e29b-41d4-a716-446655440002')
     AND EXISTS (SELECT 1 FROM clothing_types WHERE id = 'aa0e8400-e29b-41d4-a716-446655440002') THEN
    INSERT INTO order_items (id, order_id, clothing_type_id, quantity, rate, subtotal) 
    VALUES ('cc0e8400-e29b-41d4-a716-446655440009', 'bb0e8400-e29b-41d4-a716-446655440002', 'aa0e8400-e29b-41d4-a716-446655440002', 1, 16, 8);
  END IF;
END $$;

-- Create partner sessions for testing, but only if partner exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM partner_sessions WHERE session_token = 'test-delivery-session-token-123') 
     AND EXISTS (SELECT 1 FROM partners WHERE id = '990e8400-e29b-41d4-a716-446655440002') THEN
    INSERT INTO partner_sessions (id, partner_id, session_token, expires_at) 
    VALUES ('dd0e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440002', 'test-delivery-session-token-123', '2025-01-23 23:59:59+00');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM partner_sessions WHERE session_token = 'test-both-session-token-456') 
     AND EXISTS (SELECT 1 FROM partners WHERE id = '990e8400-e29b-41d4-a716-446655440003') THEN
    INSERT INTO partner_sessions (id, partner_id, session_token, expires_at) 
    VALUES ('dd0e8400-e29b-41d4-a716-446655440002', '990e8400-e29b-41d4-a716-446655440003', 'test-both-session-token-456', '2025-01-23 23:59:59+00');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM partner_sessions WHERE session_token = 'test-pickup-session-token-789') 
     AND EXISTS (SELECT 1 FROM partners WHERE id = '990e8400-e29b-41d4-a716-446655440004') THEN
    INSERT INTO partner_sessions (id, partner_id, session_token, expires_at) 
    VALUES ('dd0e8400-e29b-41d4-a716-446655440003', '990e8400-e29b-41d4-a716-446655440004', 'test-pickup-session-token-789', '2025-01-23 23:59:59+00');
  END IF;
END $$;