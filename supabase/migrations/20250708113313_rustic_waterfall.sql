/*
  # Create Sample Order Data for Testing

  1. Sample Data Creation
    - Uses existing user "ashu" or creates if not exists
    - Uses existing partner "ramu" 
    - Creates clothing types if not exists
    - Creates 5 orders covering all statuses
    - Creates corresponding order items

  2. Order Statuses Covered
    - pending: Just placed order
    - picked_up: Collected, ready for ironing
    - in_progress: Currently being ironed
    - ready: Ironing complete, ready for delivery
    - delivered: Completed order

  3. Sample Orders
    - Order 1: PENDING - 3 shirts + 2 trousers (normal service)
    - Order 2: PICKED_UP - 2 shirts + 1 saree + 1 kurta (priority service)
    - Order 3: IN_PROGRESS - 4 shirts + 3 trousers (express service)
    - Order 4: READY - 1 saree + 3 kurtas (normal service)
    - Order 5: DELIVERED - 2 shirts + 2 sarees (priority service)
*/

-- First, let's get the existing user and partner IDs
DO $$
DECLARE
    ashu_user_id uuid;
    ramu_partner_id uuid;
    user_society_id uuid;
    user_tower_id uuid;
    user_flat_id uuid;
    
    -- Order IDs for reference
    order1_id uuid := gen_random_uuid();
    order2_id uuid := gen_random_uuid();
    order3_id uuid := gen_random_uuid();
    order4_id uuid := gen_random_uuid();
    order5_id uuid := gen_random_uuid();
    
    -- Clothing type IDs
    shirt_id uuid;
    trouser_id uuid;
    saree_id uuid;
    kurta_id uuid;
BEGIN
    -- Get existing user "Ashu" (assuming username is 'ashu')
    SELECT u.id, u.society_id, u.tower_id, u.flat_id 
    INTO ashu_user_id, user_society_id, user_tower_id, user_flat_id
    FROM users u
    WHERE u.username = 'ashu' 
    LIMIT 1;
    
    -- If Ashu doesn't exist, create the user
    IF ashu_user_id IS NULL THEN
        -- Get first available society, tower, and flat
        SELECT s.id, t.id, f.id 
        INTO user_society_id, user_tower_id, user_flat_id
        FROM societies s
        JOIN towers t ON t.society_id = s.id
        JOIN flats f ON f.tower_id = t.id
        LIMIT 1;
        
        INSERT INTO users (
            username, 
            full_name, 
            email, 
            phone, 
            society_id, 
            tower_id, 
            flat_id,
            password_hash,
            adults,
            kids,
            pickup_slot,
            delivery_slot
        ) VALUES (
            'ashu',
            'Ashu Kumar',
            'ashu@example.com',
            '+91-9876543210',
            user_society_id,
            user_tower_id,
            user_flat_id,
            'hashed_password_123', -- Simple hash for demo
            2,
            1,
            'morning',
            'evening'
        ) RETURNING id INTO ashu_user_id;
    END IF;
    
    -- Get existing partner "ramu"
    SELECT p.id INTO ramu_partner_id
    FROM partners p
    WHERE p.username = 'ramu' 
    LIMIT 1;
    
    -- If ramu partner doesn't exist, throw an error
    IF ramu_partner_id IS NULL THEN
        RAISE EXCEPTION 'Partner "ramu" not found. Please ensure the partner exists before running this migration.';
    END IF;
    
    -- Get clothing type IDs
    SELECT ct.id INTO shirt_id FROM clothing_types ct WHERE ct.name = 'Shirt' LIMIT 1;
    SELECT ct.id INTO trouser_id FROM clothing_types ct WHERE ct.name = 'Trouser' LIMIT 1;
    SELECT ct.id INTO saree_id FROM clothing_types ct WHERE ct.name = 'Saree' LIMIT 1;
    SELECT ct.id INTO kurta_id FROM clothing_types ct WHERE ct.name = 'Kurta' LIMIT 1;
    
    -- If clothing types don't exist, create them
    IF shirt_id IS NULL THEN
        INSERT INTO clothing_types (name, normal_rate, priority_rate, express_rate)
        VALUES ('Shirt', 15, 20, 25) RETURNING id INTO shirt_id;
    END IF;
    
    IF trouser_id IS NULL THEN
        INSERT INTO clothing_types (name, normal_rate, priority_rate, express_rate)
        VALUES ('Trouser', 20, 25, 30) RETURNING id INTO trouser_id;
    END IF;
    
    IF saree_id IS NULL THEN
        INSERT INTO clothing_types (name, normal_rate, priority_rate, express_rate)
        VALUES ('Saree', 50, 60, 75) RETURNING id INTO saree_id;
    END IF;
    
    IF kurta_id IS NULL THEN
        INSERT INTO clothing_types (name, normal_rate, priority_rate, express_rate)
        VALUES ('Kurta', 25, 30, 35) RETURNING id INTO kurta_id;
    END IF;
    
    -- Create Order 1: PENDING (just placed)
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
        ashu_user_id,
        CURRENT_DATE + INTERVAL '1 day',
        'morning',
        'normal',
        85, -- 3 shirts (45) + 2 trousers (40)
        CURRENT_TIMESTAMP + INTERVAL '2 days',
        'pending',
        CURRENT_TIMESTAMP - INTERVAL '30 minutes'
    );
    
    -- Order 1 Items
    INSERT INTO order_items (order_id, clothing_type_id, quantity, rate, subtotal) VALUES
    (order1_id, shirt_id, 3, 15, 45),
    (order1_id, trouser_id, 2, 20, 40);
    
    -- Create Order 2: PICKED_UP (collected, ready for ironing)
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
        ashu_user_id,
        CURRENT_DATE,
        'morning',
        'priority',
        130, -- 2 shirts (40) + 1 saree (60) + 1 kurta (30)
        CURRENT_TIMESTAMP + INTERVAL '1 day',
        'picked_up',
        CURRENT_TIMESTAMP - INTERVAL '2 hours'
    );
    
    -- Order 2 Items
    INSERT INTO order_items (order_id, clothing_type_id, quantity, rate, subtotal) VALUES
    (order2_id, shirt_id, 2, 20, 40),
    (order2_id, saree_id, 1, 60, 60),
    (order2_id, kurta_id, 1, 30, 30);
    
    -- Create Order 3: IN_PROGRESS (currently being ironed by ramu)
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
        order3_id,
        ashu_user_id,
        CURRENT_DATE - INTERVAL '1 day',
        'evening',
        'express',
        190, -- 4 shirts (100) + 3 trousers (90)
        CURRENT_TIMESTAMP + INTERVAL '2 hours',
        'in_progress',
        ramu_partner_id,
        CURRENT_TIMESTAMP - INTERVAL '1 hour',
        CURRENT_TIMESTAMP - INTERVAL '6 hours'
    );
    
    -- Order 3 Items
    INSERT INTO order_items (order_id, clothing_type_id, quantity, rate, subtotal) VALUES
    (order3_id, shirt_id, 4, 25, 100),
    (order3_id, trouser_id, 3, 30, 90);
    
    -- Create Order 4: READY (ironing complete by ramu, ready for delivery)
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
        created_at
    ) VALUES (
        order4_id,
        ashu_user_id,
        CURRENT_DATE - INTERVAL '2 days',
        'morning',
        'normal',
        95, -- 1 saree (50) + 3 kurtas (45)
        CURRENT_TIMESTAMP + INTERVAL '4 hours',
        'ready',
        ramu_partner_id,
        CURRENT_TIMESTAMP - INTERVAL '4 hours',
        CURRENT_TIMESTAMP - INTERVAL '1 hour',
        ramu_partner_id,
        CURRENT_TIMESTAMP - INTERVAL '1 day'
    );
    
    -- Order 4 Items
    INSERT INTO order_items (order_id, clothing_type_id, quantity, rate, subtotal) VALUES
    (order4_id, saree_id, 1, 50, 50),
    (order4_id, kurta_id, 3, 15, 45);
    
    -- Create Order 5: DELIVERED (completed order by ramu)
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
        order5_id,
        ashu_user_id,
        CURRENT_DATE - INTERVAL '5 days',
        'evening',
        'priority',
        160, -- 2 shirts (40) + 2 sarees (120)
        CURRENT_TIMESTAMP - INTERVAL '2 days',
        'delivered',
        ramu_partner_id,
        CURRENT_TIMESTAMP - INTERVAL '4 days',
        CURRENT_TIMESTAMP - INTERVAL '3 days',
        ramu_partner_id,
        CURRENT_TIMESTAMP - INTERVAL '2 days',
        CURRENT_TIMESTAMP - INTERVAL '2 days' + INTERVAL '2 hours',
        CURRENT_TIMESTAMP - INTERVAL '5 days'
    );
    
    -- Order 5 Items
    INSERT INTO order_items (order_id, clothing_type_id, quantity, rate, subtotal) VALUES
    (order5_id, shirt_id, 2, 20, 40),
    (order5_id, saree_id, 2, 60, 120);
    
    RAISE NOTICE 'Sample order data created successfully!';
    RAISE NOTICE 'User: % (ID: %)', 'Ashu Kumar', ashu_user_id;
    RAISE NOTICE 'Partner: % (ID: %)', 'ramu', ramu_partner_id;
    RAISE NOTICE 'Created 5 orders with statuses: pending, picked_up, in_progress, ready, delivered';
    
END $$;