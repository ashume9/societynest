/*
  # Create Sample Data for Testing Delivery Partner Dashboard

  1. Sample Data Creation
    - Creates test societies, towers, flats
    - Creates test users and partners
    - Creates test clothing types
    - Creates test orders in various states
    - Creates test order items

  2. Test Scenarios Covered
    - Global queue pending pickup orders
    - Global queue pending delivery orders
    - Pickup assignments for delivery partners
    - Delivery assignments for delivery partners
    - Completed pickup orders
    - Completed delivery orders
*/

-- Insert sample societies
INSERT INTO societies (id, name) VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'Green Valley Society'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Blue Ridge Apartments')
ON CONFLICT (id) DO NOTHING;

-- Insert sample towers
INSERT INTO towers (id, society_id, name) VALUES 
  ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Tower A'),
  ('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Tower B'),
  ('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'Tower 1')
ON CONFLICT (id) DO NOTHING;

-- Insert sample flats
INSERT INTO flats (id, tower_id, number) VALUES 
  ('770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '101'),
  ('770e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', '102'),
  ('770e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440001', '201'),
  ('770e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440002', '301'),
  ('770e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440003', '401')
ON CONFLICT (id) DO NOTHING;

-- Insert sample users
INSERT INTO users (id, username, password_hash, full_name, phone, society_id, tower_id, flat_id, adults, kids, pickup_slot, delivery_slot) VALUES 
  ('880e8400-e29b-41d4-a716-446655440001', 'john_doe', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'John Doe', '+91-9876543210', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 2, 1, 'morning', 'evening'),
  ('880e8400-e29b-41d4-a716-446655440002', 'jane_smith', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'Jane Smith', '+91-9876543211', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440002', 2, 0, 'evening', 'morning'),
  ('880e8400-e29b-41d4-a716-446655440003', 'mike_wilson', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'Mike Wilson', '+91-9876543212', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440003', 3, 2, 'morning', 'evening'),
  ('880e8400-e29b-41d4-a716-446655440004', 'sarah_jones', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'Sarah Jones', '+91-9876543213', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440004', 2, 1, 'evening', 'morning'),
  ('880e8400-e29b-41d4-a716-446655440005', 'david_brown', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'David Brown', '+91-9876543214', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440005', 1, 0, 'morning', 'evening')
ON CONFLICT (id) DO NOTHING;

-- Insert sample partners
INSERT INTO partners (id, username, password_hash, full_name, phone, partner_type, society_id, tower_id, identity_type, identity_number, working_days, holiday_day, status) VALUES 
  ('990e8400-e29b-41d4-a716-446655440001', 'iron_master', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'Ravi Kumar', '+91-9876543220', 'ironing', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'aadhar', '123456789012', ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'], 'sunday', 'approved'),
  ('990e8400-e29b-41d4-a716-446655440002', 'delivery_pro', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'Suresh Patel', '+91-9876543221', 'delivery', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'aadhar', '123456789013', ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'], 'sunday', 'approved'),
  ('990e8400-e29b-41d4-a716-446655440003', 'all_service', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'Amit Sharma', '+91-9876543222', 'both', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440002', 'aadhar', '123456789014', ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'], 'sunday', 'approved'),
  ('990e8400-e29b-41d4-a716-446655440004', 'pickup_expert', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'Rajesh Singh', '+91-9876543223', 'delivery', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440003', 'aadhar', '123456789015', ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'], 'sunday', 'approved')
ON CONFLICT (id) DO NOTHING;

-- Insert sample clothing types
INSERT INTO clothing_types (id, name, normal_rate, priority_rate, express_rate) VALUES 
  ('aa0e8400-e29b-41d4-a716-446655440001', 'Shirt', 15, 20, 25),
  ('aa0e8400-e29b-41d4-a716-446655440002', 'T-Shirt', 12, 16, 20),
  ('aa0e8400-e29b-41d4-a716-446655440003', 'Trouser', 18, 24, 30),
  ('aa0e8400-e29b-41d4-a716-446655440004', 'Jeans', 20, 26, 32),
  ('aa0e8400-e29b-41d4-a716-446655440005', 'Saree', 25, 35, 45),
  ('aa0e8400-e29b-41d4-a716-446655440006', 'Kurta', 16, 22, 28)
ON CONFLICT (id) DO NOTHING;

-- Insert sample orders in various states for testing

-- 1. Orders pending pickup (Global Queue - Pending Pickup)
INSERT INTO orders (id, user_id, pickup_date, pickup_slot, service_type, total_amount, estimated_delivery, status, created_at) VALUES 
  ('bb0e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001', '2025-01-16', 'morning', 'normal', 150, '2025-01-18 18:00:00+00', 'pending', '2025-01-15 10:30:00+00'),
  ('bb0e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440002', '2025-01-16', 'evening', 'priority', 280, '2025-01-17 19:00:00+00', 'pending', '2025-01-15 14:20:00+00'),
  ('bb0e8400-e29b-41d4-a716-446655440003', '880e8400-e29b-41d4-a716-446655440003', '2025-01-17', 'morning', 'express', 320, '2025-01-17 16:00:00+00', 'pending', '2025-01-15 16:45:00+00')
ON CONFLICT (id) DO NOTHING;

-- 2. Orders ready for delivery (Global Queue - Pending Delivery)
INSERT INTO orders (id, user_id, pickup_date, pickup_slot, service_type, total_amount, estimated_delivery, status, created_at, assigned_ironing_partner_id, ironing_started_at, ironing_completed_at) VALUES 
  ('bb0e8400-e29b-41d4-a716-446655440004', '880e8400-e29b-41d4-a716-446655440004', '2025-01-14', 'morning', 'normal', 200, '2025-01-16 18:00:00+00', 'ready', '2025-01-14 09:15:00+00', '990e8400-e29b-41d4-a716-446655440001', '2025-01-15 09:00:00+00', '2025-01-15 17:00:00+00'),
  ('bb0e8400-e29b-41d4-a716-446655440005', '880e8400-e29b-41d4-a716-446655440005', '2025-01-14', 'evening', 'priority', 180, '2025-01-15 19:00:00+00', 'ready', '2025-01-14 15:30:00+00', '990e8400-e29b-41d4-a716-446655440003', '2025-01-15 10:00:00+00', '2025-01-15 18:00:00+00')
ON CONFLICT (id) DO NOTHING;

-- 3. Orders assigned for pickup (Pickup/Delivery Assignments)
INSERT INTO orders (id, user_id, pickup_date, pickup_slot, service_type, total_amount, estimated_delivery, status, created_at, assigned_delivery_partner_id) VALUES 
  ('bb0e8400-e29b-41d4-a716-446655440006', '880e8400-e29b-41d4-a716-446655440001', '2025-01-16', 'morning', 'normal', 240, '2025-01-18 18:00:00+00', 'pending', '2025-01-15 11:00:00+00', '990e8400-e29b-41d4-a716-446655440002'),
  ('bb0e8400-e29b-41d4-a716-446655440007', '880e8400-e29b-41d4-a716-446655440002', '2025-01-16', 'evening', 'priority', 160, '2025-01-17 19:00:00+00', 'pending', '2025-01-15 13:45:00+00', '990e8400-e29b-41d4-a716-446655440003')
ON CONFLICT (id) DO NOTHING;

-- 4. Orders assigned for delivery (Pickup/Delivery Assignments)
INSERT INTO orders (id, user_id, pickup_date, pickup_slot, service_type, total_amount, estimated_delivery, status, created_at, assigned_ironing_partner_id, ironing_started_at, ironing_completed_at, assigned_delivery_partner_id) VALUES 
  ('bb0e8400-e29b-41d4-a716-446655440008', '880e8400-e29b-41d4-a716-446655440003', '2025-01-14', 'morning', 'normal', 300, '2025-01-16 18:00:00+00', 'ready', '2025-01-14 08:30:00+00', '990e8400-e29b-41d4-a716-446655440001', '2025-01-15 08:00:00+00', '2025-01-15 16:30:00+00', '990e8400-e29b-41d4-a716-446655440002'),
  ('bb0e8400-e29b-41d4-a716-446655440009', '880e8400-e29b-41d4-a716-446655440004', '2025-01-14', 'evening', 'express', 400, '2025-01-15 20:00:00+00', 'ready', '2025-01-14 16:00:00+00', '990e8400-e29b-41d4-a716-446655440003', '2025-01-15 11:00:00+00', '2025-01-15 19:00:00+00', '990e8400-e29b-41d4-a716-446655440004')
ON CONFLICT (id) DO NOTHING;

-- 5. Completed pickup orders (Completed Pickup and Deliveries)
INSERT INTO orders (id, user_id, pickup_date, pickup_slot, service_type, total_amount, estimated_delivery, status, created_at, assigned_delivery_partner_id, delivery_started_at) VALUES 
  ('bb0e8400-e29b-41d4-a716-446655440010', '880e8400-e29b-41d4-a716-446655440005', '2025-01-13', 'morning', 'normal', 220, '2025-01-15 18:00:00+00', 'picked_up', '2025-01-13 09:00:00+00', '990e8400-e29b-41d4-a716-446655440002', '2025-01-14 09:00:00+00'),
  ('bb0e8400-e29b-41d4-a716-446655440011', '880e8400-e29b-41d4-a716-446655440001', '2025-01-13', 'evening', 'priority', 180, '2025-01-14 19:00:00+00', 'picked_up', '2025-01-13 15:30:00+00', '990e8400-e29b-41d4-a716-446655440003', '2025-01-14 16:00:00+00')
ON CONFLICT (id) DO NOTHING;

-- 6. Completed delivery orders (Completed Pickup and Deliveries)
INSERT INTO orders (id, user_id, pickup_date, pickup_slot, service_type, total_amount, estimated_delivery, status, created_at, assigned_ironing_partner_id, ironing_started_at, ironing_completed_at, assigned_delivery_partner_id, delivery_started_at, delivery_completed_at) VALUES 
  ('bb0e8400-e29b-41d4-a716-446655440012', '880e8400-e29b-41d4-a716-446655440002', '2025-01-12', 'morning', 'normal', 350, '2025-01-14 18:00:00+00', 'delivered', '2025-01-12 10:00:00+00', '990e8400-e29b-41d4-a716-446655440001', '2025-01-13 09:00:00+00', '2025-01-13 17:00:00+00', '990e8400-e29b-41d4-a716-446655440002', '2025-01-14 09:00:00+00', '2025-01-14 18:30:00+00'),
  ('bb0e8400-e29b-41d4-a716-446655440013', '880e8400-e29b-41d4-a716-446655440003', '2025-01-12', 'evening', 'express', 480, '2025-01-13 20:00:00+00', 'delivered', '2025-01-12 16:00:00+00', '990e8400-e29b-41d4-a716-446655440003', '2025-01-13 12:00:00+00', '2025-01-13 16:00:00+00', '990e8400-e29b-41d4-a716-446655440004', '2025-01-13 17:00:00+00', '2025-01-13 19:45:00+00'),
  ('bb0e8400-e29b-41d4-a716-446655440014', '880e8400-e29b-41d4-a716-446655440004', '2025-01-11', 'morning', 'priority', 260, '2025-01-12 18:00:00+00', 'delivered', '2025-01-11 08:30:00+00', '990e8400-e29b-41d4-a716-446655440001', '2025-01-12 08:00:00+00', '2025-01-12 16:00:00+00', '990e8400-e29b-41d4-a716-446655440002', '2025-01-12 17:00:00+00', '2025-01-12 18:15:00+00')
ON CONFLICT (id) DO NOTHING;

-- Insert sample order items for all orders
INSERT INTO order_items (id, order_id, clothing_type_id, quantity, rate, subtotal) VALUES 
  -- Order 1 items
  ('cc0e8400-e29b-41d4-a716-446655440001', 'bb0e8400-e29b-41d4-a716-446655440001', 'aa0e8400-e29b-41d4-a716-446655440001', 3, 15, 45),
  ('cc0e8400-e29b-41d4-a716-446655440002', 'bb0e8400-e29b-41d4-a716-446655440001', 'aa0e8400-e29b-41d4-a716-446655440002', 5, 12, 60),
  ('cc0e8400-e29b-41d4-a716-446655440003', 'bb0e8400-e29b-41d4-a716-446655440001', 'aa0e8400-e29b-41d4-a716-446655440003', 2, 18, 36),
  
  -- Order 2 items
  ('cc0e8400-e29b-41d4-a716-446655440004', 'bb0e8400-e29b-41d4-a716-446655440002', 'aa0e8400-e29b-41d4-a716-446655440001', 4, 20, 80),
  ('cc0e8400-e29b-41d4-a716-446655440005', 'bb0e8400-e29b-41d4-a716-446655440002', 'aa0e8400-e29b-41d4-a716-446655440004', 3, 26, 78),
  ('cc0e8400-e29b-41d4-a716-446655440006', 'bb0e8400-e29b-41d4-a716-446655440002', 'aa0e8400-e29b-41d4-a716-446655440005', 2, 35, 70),
  
  -- Order 3 items
  ('cc0e8400-e29b-41d4-a716-446655440007', 'bb0e8400-e29b-41d4-a716-446655440003', 'aa0e8400-e29b-41d4-a716-446655440001', 5, 25, 125),
  ('cc0e8400-e29b-41d4-a716-446655440008', 'bb0e8400-e29b-41d4-a716-446655440003', 'aa0e8400-e29b-41d4-a716-446655440002', 4, 20, 80),
  ('cc0e8400-e29b-41d4-a716-446655440009', 'bb0e8400-e29b-41d4-a716-446655440003', 'aa0e8400-e29b-41d4-a716-446655440006', 4, 28, 112),
  
  -- Order 4 items
  ('cc0e8400-e29b-41d4-a716-446655440010', 'bb0e8400-e29b-41d4-a716-446655440004', 'aa0e8400-e29b-41d4-a716-446655440003', 4, 18, 72),
  ('cc0e8400-e29b-41d4-a716-446655440011', 'bb0e8400-e29b-41d4-a716-446655440004', 'aa0e8400-e29b-41d4-a716-446655440004', 2, 20, 40),
  ('cc0e8400-e29b-41d4-a716-446655440012', 'bb0e8400-e29b-41d4-a716-446655440004', 'aa0e8400-e29b-41d4-a716-446655440005', 2, 25, 50),
  
  -- Order 5 items
  ('cc0e8400-e29b-41d4-a716-446655440013', 'bb0e8400-e29b-41d4-a716-446655440005', 'aa0e8400-e29b-41d4-a716-446655440001', 3, 20, 60),
  ('cc0e8400-e29b-41d4-a716-446655440014', 'bb0e8400-e29b-41d4-a716-446655440005', 'aa0e8400-e29b-41d4-a716-446655440002', 4, 16, 64),
  ('cc0e8400-e29b-41d4-a716-446655440015', 'bb0e8400-e29b-41d4-a716-446655440005', 'aa0e8400-e29b-41d4-a716-446655440006', 2, 22, 44),
  
  -- Order 6 items
  ('cc0e8400-e29b-41d4-a716-446655440016', 'bb0e8400-e29b-41d4-a716-446655440006', 'aa0e8400-e29b-41d4-a716-446655440001', 6, 15, 90),
  ('cc0e8400-e29b-41d4-a716-446655440017', 'bb0e8400-e29b-41d4-a716-446655440006', 'aa0e8400-e29b-41d4-a716-446655440003', 4, 18, 72),
  ('cc0e8400-e29b-41d4-a716-446655440018', 'bb0e8400-e29b-41d4-a716-446655440006', 'aa0e8400-e29b-41d4-a716-446655440004', 2, 20, 40),
  
  -- Order 7 items
  ('cc0e8400-e29b-41d4-a716-446655440019', 'bb0e8400-e29b-41d4-a716-446655440007', 'aa0e8400-e29b-41d4-a716-446655440002', 5, 16, 80),
  ('cc0e8400-e29b-41d4-a716-446655440020', 'bb0e8400-e29b-41d4-a716-446655440007', 'aa0e8400-e29b-41d4-a716-446655440006', 3, 22, 66),
  
  -- Order 8 items
  ('cc0e8400-e29b-41d4-a716-446655440021', 'bb0e8400-e29b-41d4-a716-446655440008', 'aa0e8400-e29b-41d4-a716-446655440001', 8, 15, 120),
  ('cc0e8400-e29b-41d4-a716-446655440022', 'bb0e8400-e29b-41d4-a716-446655440008', 'aa0e8400-e29b-41d4-a716-446655440003', 5, 18, 90),
  ('cc0e8400-e29b-41d4-a716-446655440023', 'bb0e8400-e29b-41d4-a716-446655440008', 'aa0e8400-e29b-41d4-a716-446655440005', 2, 25, 50),
  
  -- Order 9 items
  ('cc0e8400-e29b-41d4-a716-446655440024', 'bb0e8400-e29b-41d4-a716-446655440009', 'aa0e8400-e29b-41d4-a716-446655440001', 6, 25, 150),
  ('cc0e8400-e29b-41d4-a716-446655440025', 'bb0e8400-e29b-41d4-a716-446655440009', 'aa0e8400-e29b-41d4-a716-446655440004', 4, 32, 128),
  ('cc0e8400-e29b-41d4-a716-446655440026', 'bb0e8400-e29b-41d4-a716-446655440009', 'aa0e8400-e29b-41d4-a716-446655440006', 4, 28, 112),
  
  -- Order 10 items
  ('cc0e8400-e29b-41d4-a716-446655440027', 'bb0e8400-e29b-41d4-a716-446655440010', 'aa0e8400-e29b-41d4-a716-446655440002', 8, 12, 96),
  ('cc0e8400-e29b-41d4-a716-446655440028', 'bb0e8400-e29b-41d4-a716-446655440010', 'aa0e8400-e29b-41d4-a716-446655440003', 3, 18, 54),
  ('cc0e8400-e29b-41d4-a716-446655440029', 'bb0e8400-e29b-41d4-a716-446655440010', 'aa0e8400-e29b-41d4-a716-446655440005', 2, 25, 50),
  
  -- Order 11 items
  ('cc0e8400-e29b-41d4-a716-446655440030', 'bb0e8400-e29b-41d4-a716-446655440011', 'aa0e8400-e29b-41d4-a716-446655440001', 4, 20, 80),
  ('cc0e8400-e29b-41d4-a716-446655440031', 'bb0e8400-e29b-41d4-a716-446655440011', 'aa0e8400-e29b-41d4-a716-446655440004', 2, 26, 52),
  ('cc0e8400-e29b-41d4-a716-446655440032', 'bb0e8400-e29b-41d4-a716-446655440011', 'aa0e8400-e29b-41d4-a716-446655440006', 2, 22, 44),
  
  -- Order 12 items
  ('cc0e8400-e29b-41d4-a716-446655440033', 'bb0e8400-e29b-41d4-a716-446655440012', 'aa0e8400-e29b-41d4-a716-446655440001', 10, 15, 150),
  ('cc0e8400-e29b-41d4-a716-446655440034', 'bb0e8400-e29b-41d4-a716-446655440012', 'aa0e8400-e29b-41d4-a716-446655440003', 5, 18, 90),
  ('cc0e8400-e29b-41d4-a716-446655440035', 'bb0e8400-e29b-41d4-a716-446655440012', 'aa0e8400-e29b-41d4-a716-446655440005', 3, 25, 75),
  
  -- Order 13 items
  ('cc0e8400-e29b-41d4-a716-446655440036', 'bb0e8400-e29b-41d4-a716-446655440013', 'aa0e8400-e29b-41d4-a716-446655440001', 8, 25, 200),
  ('cc0e8400-e29b-41d4-a716-446655440037', 'bb0e8400-e29b-41d4-a716-446655440013', 'aa0e8400-e29b-41d4-a716-446655440004', 4, 32, 128),
  ('cc0e8400-e29b-41d4-a716-446655440038', 'bb0e8400-e29b-41d4-a716-446655440013', 'aa0e8400-e29b-41d4-a716-446655440006', 5, 28, 140),
  
  -- Order 14 items
  ('cc0e8400-e29b-41d4-a716-446655440039', 'bb0e8400-e29b-41d4-a716-446655440014', 'aa0e8400-e29b-41d4-a716-446655440002', 6, 16, 96),
  ('cc0e8400-e29b-41d4-a716-446655440040', 'bb0e8400-e29b-41d4-a716-446655440014', 'aa0e8400-e29b-41d4-a716-446655440003', 4, 24, 96),
  ('cc0e8400-e29b-41d4-a716-446655440041', 'bb0e8400-e29b-41d4-a716-446655440014', 'aa0e8400-e29b-41d4-a716-446655440005', 2, 35, 70)
ON CONFLICT (id) DO NOTHING;

-- Create some partner sessions for testing
INSERT INTO partner_sessions (id, partner_id, session_token, expires_at) VALUES 
  ('dd0e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440002', 'test-delivery-session-token-123', '2025-01-23 23:59:59+00'),
  ('dd0e8400-e29b-41d4-a716-446655440002', '990e8400-e29b-41d4-a716-446655440003', 'test-both-session-token-456', '2025-01-23 23:59:59+00'),
  ('dd0e8400-e29b-41d4-a716-446655440003', '990e8400-e29b-41d4-a716-446655440004', 'test-pickup-session-token-789', '2025-01-23 23:59:59+00')
ON CONFLICT (id) DO NOTHING;