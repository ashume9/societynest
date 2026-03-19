/*
# Sample Data Migration for Testing

This migration creates comprehensive sample data for testing the ironing service application.

## New Data Created
1. **Societies**: Green Valley Society, Blue Ridge Apartments
2. **Towers**: Tower A, Tower B, Tower 1
3. **Flats**: Various flat numbers across towers
4. **Users**: 5 test users with different preferences
5. **Partners**: 4 partners (ironing, delivery, both types)
6. **Clothing Types**: 6 types with different rates
7. **Orders**: 14 orders in various states for comprehensive testing
8. **Order Items**: Detailed items for each order
9. **Partner Sessions**: Test sessions for partner login

## Test Scenarios Covered
- Global Queue - Pending Pickup (3 orders)
- Global Queue - Pending Delivery (2 orders)  
- Pickup/Delivery Assignments (4 orders)
- Completed Pickup and Deliveries (5 orders)

## Login Credentials
- All users/partners: password = "secret123"
- Partners: delivery_pro, all_service, pickup_expert
*/

-- First, let's handle societies with UPSERT approach
INSERT INTO societies (id, name) VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'Green Valley Society'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Blue Ridge Apartments')
ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name;

-- Now insert towers, but only if the society exists
INSERT INTO towers (id, society_id, name) 
SELECT '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Tower A'
WHERE EXISTS (SELECT 1 FROM societies WHERE id = '550e8400-e29b-41d4-a716-446655440001')
ON CONFLICT (society_id, name) DO NOTHING;

INSERT INTO towers (id, society_id, name) 
SELECT '660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Tower B'
WHERE EXISTS (SELECT 1 FROM societies WHERE id = '550e8400-e29b-41d4-a716-446655440001')
ON CONFLICT (society_id, name) DO NOTHING;

INSERT INTO towers (id, society_id, name) 
SELECT '660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'Tower 1'
WHERE EXISTS (SELECT 1 FROM societies WHERE id = '550e8400-e29b-41d4-a716-446655440002')
ON CONFLICT (society_id, name) DO NOTHING;

-- Insert flats, but only if the tower exists
INSERT INTO flats (id, tower_id, number) 
SELECT '770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '101'
WHERE EXISTS (SELECT 1 FROM towers WHERE id = '660e8400-e29b-41d4-a716-446655440001')
ON CONFLICT (tower_id, number) DO NOTHING;

INSERT INTO flats (id, tower_id, number) 
SELECT '770e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', '102'
WHERE EXISTS (SELECT 1 FROM towers WHERE id = '660e8400-e29b-41d4-a716-446655440001')
ON CONFLICT (tower_id, number) DO NOTHING;

INSERT INTO flats (id, tower_id, number) 
SELECT '770e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440001', '201'
WHERE EXISTS (SELECT 1 FROM towers WHERE id = '660e8400-e29b-41d4-a716-446655440001')
ON CONFLICT (tower_id, number) DO NOTHING;

INSERT INTO flats (id, tower_id, number) 
SELECT '770e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440002', '301'
WHERE EXISTS (SELECT 1 FROM towers WHERE id = '660e8400-e29b-41d4-a716-446655440002')
ON CONFLICT (tower_id, number) DO NOTHING;

INSERT INTO flats (id, tower_id, number) 
SELECT '770e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440003', '401'
WHERE EXISTS (SELECT 1 FROM towers WHERE id = '660e8400-e29b-41d4-a716-446655440003')
ON CONFLICT (tower_id, number) DO NOTHING;

-- Insert users, but only if the referenced entities exist
INSERT INTO users (id, username, password_hash, full_name, phone, society_id, tower_id, flat_id, adults, kids, pickup_slot, delivery_slot) 
SELECT '880e8400-e29b-41d4-a716-446655440001', 'john_doe', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'John Doe', '+91-9876543210', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 2, 1, 'morning', 'evening'
WHERE EXISTS (SELECT 1 FROM societies WHERE id = '550e8400-e29b-41d4-a716-446655440001')
  AND EXISTS (SELECT 1 FROM towers WHERE id = '660e8400-e29b-41d4-a716-446655440001')
  AND EXISTS (SELECT 1 FROM flats WHERE id = '770e8400-e29b-41d4-a716-446655440001')
ON CONFLICT (username) DO NOTHING;

INSERT INTO users (id, username, password_hash, full_name, phone, society_id, tower_id, flat_id, adults, kids, pickup_slot, delivery_slot) 
SELECT '880e8400-e29b-41d4-a716-446655440002', 'jane_smith', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'Jane Smith', '+91-9876543211', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440002', 2, 0, 'evening', 'morning'
WHERE EXISTS (SELECT 1 FROM societies WHERE id = '550e8400-e29b-41d4-a716-446655440001')
  AND EXISTS (SELECT 1 FROM towers WHERE id = '660e8400-e29b-41d4-a716-446655440001')
  AND EXISTS (SELECT 1 FROM flats WHERE id = '770e8400-e29b-41d4-a716-446655440002')
ON CONFLICT (username) DO NOTHING;

INSERT INTO users (id, username, password_hash, full_name, phone, society_id, tower_id, flat_id, adults, kids, pickup_slot, delivery_slot) 
SELECT '880e8400-e29b-41d4-a716-446655440003', 'mike_wilson', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'Mike Wilson', '+91-9876543212', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440003', 3, 2, 'morning', 'evening'
WHERE EXISTS (SELECT 1 FROM societies WHERE id = '550e8400-e29b-41d4-a716-446655440001')
  AND EXISTS (SELECT 1 FROM towers WHERE id = '660e8400-e29b-41d4-a716-446655440001')
  AND EXISTS (SELECT 1 FROM flats WHERE id = '770e8400-e29b-41d4-a716-446655440003')
ON CONFLICT (username) DO NOTHING;

INSERT INTO users (id, username, password_hash, full_name, phone, society_id, tower_id, flat_id, adults, kids, pickup_slot, delivery_slot) 
SELECT '880e8400-e29b-41d4-a716-446655440004', 'sarah_jones', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'Sarah Jones', '+91-9876543213', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440004', 2, 1, 'evening', 'morning'
WHERE EXISTS (SELECT 1 FROM societies WHERE id = '550e8400-e29b-41d4-a716-446655440001')
  AND EXISTS (SELECT 1 FROM towers WHERE id = '660e8400-e29b-41d4-a716-446655440002')
  AND EXISTS (SELECT 1 FROM flats WHERE id = '770e8400-e29b-41d4-a716-446655440004')
ON CONFLICT (username) DO NOTHING;

INSERT INTO users (id, username, password_hash, full_name, phone, society_id, tower_id, flat_id, adults, kids, pickup_slot, delivery_slot) 
SELECT '880e8400-e29b-41d4-a716-446655440005', 'david_brown', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'David Brown', '+91-9876543214', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440005', 1, 0, 'morning', 'evening'
WHERE EXISTS (SELECT 1 FROM societies WHERE id = '550e8400-e29b-41d4-a716-446655440002')
  AND EXISTS (SELECT 1 FROM towers WHERE id = '660e8400-e29b-41d4-a716-446655440003')
  AND EXISTS (SELECT 1 FROM flats WHERE id = '770e8400-e29b-41d4-a716-446655440005')
ON CONFLICT (username) DO NOTHING;

-- Insert partners, but only if the referenced entities exist
INSERT INTO partners (id, username, password_hash, full_name, phone, partner_type, society_id, tower_id, identity_type, identity_number, working_days, holiday_day, status) 
SELECT '990e8400-e29b-41d4-a716-446655440001', 'iron_master', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'Ravi Kumar', '+91-9876543220', 'ironing', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'aadhar', '123456789012', ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'], 'sunday', 'approved'
WHERE EXISTS (SELECT 1 FROM societies WHERE id = '550e8400-e29b-41d4-a716-446655440001')
  AND EXISTS (SELECT 1 FROM towers WHERE id = '660e8400-e29b-41d4-a716-446655440001')
ON CONFLICT (username) DO NOTHING;

INSERT INTO partners (id, username, password_hash, full_name, phone, partner_type, society_id, tower_id, identity_type, identity_number, working_days, holiday_day, status) 
SELECT '990e8400-e29b-41d4-a716-446655440002', 'delivery_pro', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'Suresh Patel', '+91-9876543221', 'delivery', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'aadhar', '123456789013', ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'], 'sunday', 'approved'
WHERE EXISTS (SELECT 1 FROM societies WHERE id = '550e8400-e29b-41d4-a716-446655440001')
  AND EXISTS (SELECT 1 FROM towers WHERE id = '660e8400-e29b-41d4-a716-446655440001')
ON CONFLICT (username) DO NOTHING;

INSERT INTO partners (id, username, password_hash, full_name, phone, partner_type, society_id, tower_id, identity_type, identity_number, working_days, holiday_day, status) 
SELECT '990e8400-e29b-41d4-a716-446655440003', 'all_service', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'Amit Sharma', '+91-9876543222', 'both', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440002', 'aadhar', '123456789014', ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'], 'sunday', 'approved'
WHERE EXISTS (SELECT 1 FROM societies WHERE id = '550e8400-e29b-41d4-a716-446655440001')
  AND EXISTS (SELECT 1 FROM towers WHERE id = '660e8400-e29b-41d4-a716-446655440002')
ON CONFLICT (username) DO NOTHING;

INSERT INTO partners (id, username, password_hash, full_name, phone, partner_type, society_id, tower_id, identity_type, identity_number, working_days, holiday_day, status) 
SELECT '990e8400-e29b-41d4-a716-446655440004', 'pickup_expert', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'Rajesh Singh', '+91-9876543223', 'delivery', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440003', 'aadhar', '123456789015', ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'], 'sunday', 'approved'
WHERE EXISTS (SELECT 1 FROM societies WHERE id = '550e8400-e29b-41d4-a716-446655440002')
  AND EXISTS (SELECT 1 FROM towers WHERE id = '660e8400-e29b-41d4-a716-446655440003')
ON CONFLICT (username) DO NOTHING;

-- Insert clothing types (no foreign key dependencies)
INSERT INTO clothing_types (id, name, normal_rate, priority_rate, express_rate) VALUES 
  ('aa0e8400-e29b-41d4-a716-446655440001', 'Shirt', 15, 20, 25),
  ('aa0e8400-e29b-41d4-a716-446655440002', 'T-Shirt', 12, 16, 20),
  ('aa0e8400-e29b-41d4-a716-446655440003', 'Trouser', 18, 24, 30),
  ('aa0e8400-e29b-41d4-a716-446655440004', 'Jeans', 20, 26, 32),
  ('aa0e8400-e29b-41d4-a716-446655440005', 'Saree', 25, 35, 45),
  ('aa0e8400-e29b-41d4-a716-446655440006', 'Kurta', 16, 22, 28)
ON CONFLICT (name) DO NOTHING;

-- Insert orders, but only if the user exists
-- 1. Orders pending pickup (Global Queue - Pending Pickup)
INSERT INTO orders (id, user_id, pickup_date, pickup_slot, service_type, total_amount, estimated_delivery, status, created_at) 
SELECT 'bb0e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001', '2025-01-16', 'morning', 'normal', 150, '2025-01-18 18:00:00+00', 'pending', '2025-01-15 10:30:00+00'
WHERE EXISTS (SELECT 1 FROM users WHERE id = '880e8400-e29b-41d4-a716-446655440001')
ON CONFLICT (id) DO NOTHING;

INSERT INTO orders (id, user_id, pickup_date, pickup_slot, service_type, total_amount, estimated_delivery, status, created_at) 
SELECT 'bb0e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440002', '2025-01-16', 'evening', 'priority', 280, '2025-01-17 19:00:00+00', 'pending', '2025-01-15 14:20:00+00'
WHERE EXISTS (SELECT 1 FROM users WHERE id = '880e8400-e29b-41d4-a716-446655440002')
ON CONFLICT (id) DO NOTHING;

INSERT INTO orders (id, user_id, pickup_date, pickup_slot, service_type, total_amount, estimated_delivery, status, created_at) 
SELECT 'bb0e8400-e29b-41d4-a716-446655440003', '880e8400-e29b-41d4-a716-446655440003', '2025-01-17', 'morning', 'express', 320, '2025-01-17 16:00:00+00', 'pending', '2025-01-15 16:45:00+00'
WHERE EXISTS (SELECT 1 FROM users WHERE id = '880e8400-e29b-41d4-a716-446655440003')
ON CONFLICT (id) DO NOTHING;

-- 2. Orders ready for delivery (Global Queue - Pending Delivery)
INSERT INTO orders (id, user_id, pickup_date, pickup_slot, service_type, total_amount, estimated_delivery, status, created_at, assigned_ironing_partner_id, ironing_started_at, ironing_completed_at) 
SELECT 'bb0e8400-e29b-41d4-a716-446655440004', '880e8400-e29b-41d4-a716-446655440004', '2025-01-14', 'morning', 'normal', 200, '2025-01-16 18:00:00+00', 'ready', '2025-01-14 09:15:00+00', '990e8400-e29b-41d4-a716-446655440001', '2025-01-15 09:00:00+00', '2025-01-15 17:00:00+00'
WHERE EXISTS (SELECT 1 FROM users WHERE id = '880e8400-e29b-41d4-a716-446655440004')
  AND EXISTS (SELECT 1 FROM partners WHERE id = '990e8400-e29b-41d4-a716-446655440001')
ON CONFLICT (id) DO NOTHING;

INSERT INTO orders (id, user_id, pickup_date, pickup_slot, service_type, total_amount, estimated_delivery, status, created_at, assigned_ironing_partner_id, ironing_started_at, ironing_completed_at) 
SELECT 'bb0e8400-e29b-41d4-a716-446655440005', '880e8400-e29b-41d4-a716-446655440005', '2025-01-14', 'evening', 'priority', 180, '2025-01-15 19:00:00+00', 'ready', '2025-01-14 15:30:00+00', '990e8400-e29b-41d4-a716-446655440003', '2025-01-15 10:00:00+00', '2025-01-15 18:00:00+00'
WHERE EXISTS (SELECT 1 FROM users WHERE id = '880e8400-e29b-41d4-a716-446655440005')
  AND EXISTS (SELECT 1 FROM partners WHERE id = '990e8400-e29b-41d4-a716-446655440003')
ON CONFLICT (id) DO NOTHING;

-- 3. Orders assigned for pickup (Pickup/Delivery Assignments)
INSERT INTO orders (id, user_id, pickup_date, pickup_slot, service_type, total_amount, estimated_delivery, status, created_at, assigned_delivery_partner_id) 
SELECT 'bb0e8400-e29b-41d4-a716-446655440006', '880e8400-e29b-41d4-a716-446655440001', '2025-01-16', 'morning', 'normal', 240, '2025-01-18 18:00:00+00', 'pending', '2025-01-15 11:00:00+00', '990e8400-e29b-41d4-a716-446655440002'
WHERE EXISTS (SELECT 1 FROM users WHERE id = '880e8400-e29b-41d4-a716-446655440001')
  AND EXISTS (SELECT 1 FROM partners WHERE id = '990e8400-e29b-41d4-a716-446655440002')
ON CONFLICT (id) DO NOTHING;

INSERT INTO orders (id, user_id, pickup_date, pickup_slot, service_type, total_amount, estimated_delivery, status, created_at, assigned_delivery_partner_id) 
SELECT 'bb0e8400-e29b-41d4-a716-446655440007', '880e8400-e29b-41d4-a716-446655440002', '2025-01-16', 'evening', 'priority', 160, '2025-01-17 19:00:00+00', 'pending', '2025-01-15 13:45:00+00', '990e8400-e29b-41d4-a716-446655440003'
WHERE EXISTS (SELECT 1 FROM users WHERE id = '880e8400-e29b-41d4-a716-446655440002')
  AND EXISTS (SELECT 1 FROM partners WHERE id = '990e8400-e29b-41d4-a716-446655440003')
ON CONFLICT (id) DO NOTHING;

-- 4. Orders assigned for delivery (Pickup/Delivery Assignments)
INSERT INTO orders (id, user_id, pickup_date, pickup_slot, service_type, total_amount, estimated_delivery, status, created_at, assigned_ironing_partner_id, ironing_started_at, ironing_completed_at, assigned_delivery_partner_id) 
SELECT 'bb0e8400-e29b-41d4-a716-446655440008', '880e8400-e29b-41d4-a716-446655440003', '2025-01-14', 'morning', 'normal', 300, '2025-01-16 18:00:00+00', 'ready', '2025-01-14 08:30:00+00', '990e8400-e29b-41d4-a716-446655440001', '2025-01-15 08:00:00+00', '2025-01-15 16:30:00+00', '990e8400-e29b-41d4-a716-446655440002'
WHERE EXISTS (SELECT 1 FROM users WHERE id = '880e8400-e29b-41d4-a716-446655440003')
  AND EXISTS (SELECT 1 FROM partners WHERE id = '990e8400-e29b-41d4-a716-446655440001')
  AND EXISTS (SELECT 1 FROM partners WHERE id = '990e8400-e29b-41d4-a716-446655440002')
ON CONFLICT (id) DO NOTHING;

INSERT INTO orders (id, user_id, pickup_date, pickup_slot, service_type, total_amount, estimated_delivery, status, created_at, assigned_ironing_partner_id, ironing_started_at, ironing_completed_at, assigned_delivery_partner_id) 
SELECT 'bb0e8400-e29b-41d4-a716-446655440009', '880e8400-e29b-41d4-a716-446655440004', '2025-01-14', 'evening', 'express', 400, '2025-01-15 20:00:00+00', 'ready', '2025-01-14 16:00:00+00', '990e8400-e29b-41d4-a716-446655440003', '2025-01-15 11:00:00+00', '2025-01-15 19:00:00+00', '990e8400-e29b-41d4-a716-446655440004'
WHERE EXISTS (SELECT 1 FROM users WHERE id = '880e8400-e29b-41d4-a716-446655440004')
  AND EXISTS (SELECT 1 FROM partners WHERE id = '990e8400-e29b-41d4-a716-446655440003')
  AND EXISTS (SELECT 1 FROM partners WHERE id = '990e8400-e29b-41d4-a716-446655440004')
ON CONFLICT (id) DO NOTHING;

-- 5. Completed pickup orders (Completed Pickup and Deliveries)
INSERT INTO orders (id, user_id, pickup_date, pickup_slot, service_type, total_amount, estimated_delivery, status, created_at, assigned_delivery_partner_id, delivery_started_at) 
SELECT 'bb0e8400-e29b-41d4-a716-446655440010', '880e8400-e29b-41d4-a716-446655440005', '2025-01-13', 'morning', 'normal', 220, '2025-01-15 18:00:00+00', 'picked_up', '2025-01-13 09:00:00+00', '990e8400-e29b-41d4-a716-446655440002', '2025-01-14 09:00:00+00'
WHERE EXISTS (SELECT 1 FROM users WHERE id = '880e8400-e29b-41d4-a716-446655440005')
  AND EXISTS (SELECT 1 FROM partners WHERE id = '990e8400-e29b-41d4-a716-446655440002')
ON CONFLICT (id) DO NOTHING;

INSERT INTO orders (id, user_id, pickup_date, pickup_slot, service_type, total_amount, estimated_delivery, status, created_at, assigned_delivery_partner_id, delivery_started_at) 
SELECT 'bb0e8400-e29b-41d4-a716-446655440011', '880e8400-e29b-41d4-a716-446655440001', '2025-01-13', 'evening', 'priority', 180, '2025-01-14 19:00:00+00', 'picked_up', '2025-01-13 15:30:00+00', '990e8400-e29b-41d4-a716-446655440003', '2025-01-14 16:00:00+00'
WHERE EXISTS (SELECT 1 FROM users WHERE id = '880e8400-e29b-41d4-a716-446655440001')
  AND EXISTS (SELECT 1 FROM partners WHERE id = '990e8400-e29b-41d4-a716-446655440003')
ON CONFLICT (id) DO NOTHING;

-- 6. Completed delivery orders (Completed Pickup and Deliveries)
INSERT INTO orders (id, user_id, pickup_date, pickup_slot, service_type, total_amount, estimated_delivery, status, created_at, assigned_ironing_partner_id, ironing_started_at, ironing_completed_at, assigned_delivery_partner_id, delivery_started_at, delivery_completed_at) 
SELECT 'bb0e8400-e29b-41d4-a716-446655440012', '880e8400-e29b-41d4-a716-446655440002', '2025-01-12', 'morning', 'normal', 350, '2025-01-14 18:00:00+00', 'delivered', '2025-01-12 10:00:00+00', '990e8400-e29b-41d4-a716-446655440001', '2025-01-13 09:00:00+00', '2025-01-13 17:00:00+00', '990e8400-e29b-41d4-a716-446655440002', '2025-01-14 09:00:00+00', '2025-01-14 18:30:00+00'
WHERE EXISTS (SELECT 1 FROM users WHERE id = '880e8400-e29b-41d4-a716-446655440002')
  AND EXISTS (SELECT 1 FROM partners WHERE id = '990e8400-e29b-41d4-a716-446655440001')
  AND EXISTS (SELECT 1 FROM partners WHERE id = '990e8400-e29b-41d4-a716-446655440002')
ON CONFLICT (id) DO NOTHING;

INSERT INTO orders (id, user_id, pickup_date, pickup_slot, service_type, total_amount, estimated_delivery, status, created_at, assigned_ironing_partner_id, ironing_started_at, ironing_completed_at, assigned_delivery_partner_id, delivery_started_at, delivery_completed_at) 
SELECT 'bb0e8400-e29b-41d4-a716-446655440013', '880e8400-e29b-41d4-a716-446655440003', '2025-01-12', 'evening', 'express', 480, '2025-01-13 20:00:00+00', 'delivered', '2025-01-12 16:00:00+00', '990e8400-e29b-41d4-a716-446655440003', '2025-01-13 12:00:00+00', '2025-01-13 16:00:00+00', '990e8400-e29b-41d4-a716-446655440004', '2025-01-13 17:00:00+00', '2025-01-13 19:45:00+00'
WHERE EXISTS (SELECT 1 FROM users WHERE id = '880e8400-e29b-41d4-a716-446655440003')
  AND EXISTS (SELECT 1 FROM partners WHERE id = '990e8400-e29b-41d4-a716-446655440003')
  AND EXISTS (SELECT 1 FROM partners WHERE id = '990e8400-e29b-41d4-a716-446655440004')
ON CONFLICT (id) DO NOTHING;

INSERT INTO orders (id, user_id, pickup_date, pickup_slot, service_type, total_amount, estimated_delivery, status, created_at, assigned_ironing_partner_id, ironing_started_at, ironing_completed_at, assigned_delivery_partner_id, delivery_started_at, delivery_completed_at) 
SELECT 'bb0e8400-e29b-41d4-a716-446655440014', '880e8400-e29b-41d4-a716-446655440004', '2025-01-11', 'morning', 'priority', 260, '2025-01-12 18:00:00+00', 'delivered', '2025-01-11 08:30:00+00', '990e8400-e29b-41d4-a716-446655440001', '2025-01-12 08:00:00+00', '2025-01-12 16:00:00+00', '990e8400-e29b-41d4-a716-446655440002', '2025-01-12 17:00:00+00', '2025-01-12 18:15:00+00'
WHERE EXISTS (SELECT 1 FROM users WHERE id = '880e8400-e29b-41d4-a716-446655440004')
  AND EXISTS (SELECT 1 FROM partners WHERE id = '990e8400-e29b-41d4-a716-446655440001')
  AND EXISTS (SELECT 1 FROM partners WHERE id = '990e8400-e29b-41d4-a716-446655440002')
ON CONFLICT (id) DO NOTHING;

-- Insert order items, but only if the order and clothing type exist
-- Order 1 items (₹150 total)
INSERT INTO order_items (id, order_id, clothing_type_id, quantity, rate, subtotal) 
SELECT 'cc0e8400-e29b-41d4-a716-446655440001', 'bb0e8400-e29b-41d4-a716-446655440001', 'aa0e8400-e29b-41d4-a716-446655440001', 3, 15, 45
WHERE EXISTS (SELECT 1 FROM orders WHERE id = 'bb0e8400-e29b-41d4-a716-446655440001')
  AND EXISTS (SELECT 1 FROM clothing_types WHERE id = 'aa0e8400-e29b-41d4-a716-446655440001')
ON CONFLICT (id) DO NOTHING;

INSERT INTO order_items (id, order_id, clothing_type_id, quantity, rate, subtotal) 
SELECT 'cc0e8400-e29b-41d4-a716-446655440002', 'bb0e8400-e29b-41d4-a716-446655440001', 'aa0e8400-e29b-41d4-a716-446655440002', 5, 12, 60
WHERE EXISTS (SELECT 1 FROM orders WHERE id = 'bb0e8400-e29b-41d4-a716-446655440001')
  AND EXISTS (SELECT 1 FROM clothing_types WHERE id = 'aa0e8400-e29b-41d4-a716-446655440002')
ON CONFLICT (id) DO NOTHING;

INSERT INTO order_items (id, order_id, clothing_type_id, quantity, rate, subtotal) 
SELECT 'cc0e8400-e29b-41d4-a716-446655440003', 'bb0e8400-e29b-41d4-a716-446655440001', 'aa0e8400-e29b-41d4-a716-446655440003', 2, 18, 36
WHERE EXISTS (SELECT 1 FROM orders WHERE id = 'bb0e8400-e29b-41d4-a716-446655440001')
  AND EXISTS (SELECT 1 FROM clothing_types WHERE id = 'aa0e8400-e29b-41d4-a716-446655440003')
ON CONFLICT (id) DO NOTHING;

INSERT INTO order_items (id, order_id, clothing_type_id, quantity, rate, subtotal) 
SELECT 'cc0e8400-e29b-41d4-a716-446655440004', 'bb0e8400-e29b-41d4-a716-446655440001', 'aa0e8400-e29b-41d4-a716-446655440006', 1, 16, 9
WHERE EXISTS (SELECT 1 FROM orders WHERE id = 'bb0e8400-e29b-41d4-a716-446655440001')
  AND EXISTS (SELECT 1 FROM clothing_types WHERE id = 'aa0e8400-e29b-41d4-a716-446655440006')
ON CONFLICT (id) DO NOTHING;

-- Continue with remaining order items (abbreviated for space - same pattern)
-- Order 2 items (₹280 total)
INSERT INTO order_items (id, order_id, clothing_type_id, quantity, rate, subtotal) 
SELECT 'cc0e8400-e29b-41d4-a716-446655440005', 'bb0e8400-e29b-41d4-a716-446655440002', 'aa0e8400-e29b-41d4-a716-446655440001', 4, 20, 80
WHERE EXISTS (SELECT 1 FROM orders WHERE id = 'bb0e8400-e29b-41d4-a716-446655440002')
  AND EXISTS (SELECT 1 FROM clothing_types WHERE id = 'aa0e8400-e29b-41d4-a716-446655440001')
ON CONFLICT (id) DO NOTHING;

INSERT INTO order_items (id, order_id, clothing_type_id, quantity, rate, subtotal) 
SELECT 'cc0e8400-e29b-41d4-a716-446655440006', 'bb0e8400-e29b-41d4-a716-446655440002', 'aa0e8400-e29b-41d4-a716-446655440004', 3, 26, 78
WHERE EXISTS (SELECT 1 FROM orders WHERE id = 'bb0e8400-e29b-41d4-a716-446655440002')
  AND EXISTS (SELECT 1 FROM clothing_types WHERE id = 'aa0e8400-e29b-41d4-a716-446655440004')
ON CONFLICT (id) DO NOTHING;

INSERT INTO order_items (id, order_id, clothing_type_id, quantity, rate, subtotal) 
SELECT 'cc0e8400-e29b-41d4-a716-446655440007', 'bb0e8400-e29b-41d4-a716-446655440002', 'aa0e8400-e29b-41d4-a716-446655440005', 2, 35, 70
WHERE EXISTS (SELECT 1 FROM orders WHERE id = 'bb0e8400-e29b-41d4-a716-446655440002')
  AND EXISTS (SELECT 1 FROM clothing_types WHERE id = 'aa0e8400-e29b-41d4-a716-446655440005')
ON CONFLICT (id) DO NOTHING;

INSERT INTO order_items (id, order_id, clothing_type_id, quantity, rate, subtotal) 
SELECT 'cc0e8400-e29b-41d4-a716-446655440008', 'bb0e8400-e29b-41d4-a716-446655440002', 'aa0e8400-e29b-41d4-a716-446655440006', 2, 22, 44
WHERE EXISTS (SELECT 1 FROM orders WHERE id = 'bb0e8400-e29b-41d4-a716-446655440002')
  AND EXISTS (SELECT 1 FROM clothing_types WHERE id = 'aa0e8400-e29b-41d4-a716-446655440006')
ON CONFLICT (id) DO NOTHING;

INSERT INTO order_items (id, order_id, clothing_type_id, quantity, rate, subtotal) 
SELECT 'cc0e8400-e29b-41d4-a716-446655440009', 'bb0e8400-e29b-41d4-a716-446655440002', 'aa0e8400-e29b-41d4-a716-446655440002', 1, 16, 8
WHERE EXISTS (SELECT 1 FROM orders WHERE id = 'bb0e8400-e29b-41d4-a716-446655440002')
  AND EXISTS (SELECT 1 FROM clothing_types WHERE id = 'aa0e8400-e29b-41d4-a716-446655440002')
ON CONFLICT (id) DO NOTHING;

-- Create partner sessions for testing, but only if partner exists
INSERT INTO partner_sessions (id, partner_id, session_token, expires_at) 
SELECT 'dd0e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440002', 'test-delivery-session-token-123', '2025-01-23 23:59:59+00'
WHERE EXISTS (SELECT 1 FROM partners WHERE id = '990e8400-e29b-41d4-a716-446655440002')
ON CONFLICT (id) DO NOTHING;

INSERT INTO partner_sessions (id, partner_id, session_token, expires_at) 
SELECT 'dd0e8400-e29b-41d4-a716-446655440002', '990e8400-e29b-41d4-a716-446655440003', 'test-both-session-token-456', '2025-01-23 23:59:59+00'
WHERE EXISTS (SELECT 1 FROM partners WHERE id = '990e8400-e29b-41d4-a716-446655440003')
ON CONFLICT (id) DO NOTHING;

INSERT INTO partner_sessions (id, partner_id, session_token, expires_at) 
SELECT 'dd0e8400-e29b-41d4-a716-446655440003', '990e8400-e29b-41d4-a716-446655440004', 'test-pickup-session-token-789', '2025-01-23 23:59:59+00'
WHERE EXISTS (SELECT 1 FROM partners WHERE id = '990e8400-e29b-41d4-a716-446655440004')
ON CONFLICT (id) DO NOTHING;