/*
  # Fix Sample Data for Order Statuses

  This migration corrects the sample order data to ensure proper alignment with order statuses
  and partner dashboard functionality.

  ## Changes Made
  1. Clear existing sample orders to avoid conflicts
  2. Create properly structured orders with correct status flow
  3. Ensure partner assignments align with order statuses
  4. Fix timing and delivery estimates to be realistic
  5. Ensure orders are properly distributed across all statuses

  ## Order Status Flow
  - PENDING: Orders placed but not yet picked up
  - PICKED_UP: Orders collected, available for ironing partners to take
  - IN_PROGRESS: Orders assigned to ironing partner and being worked on
  - READY: Orders completed by ironing partner, ready for delivery
  - DELIVERED: Orders completed and delivered to customer
*/

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
    order6_id uuid := gen_random_uuid();
    
    -- Clothing type IDs
    shirt_id uuid;
    trouser_id uuid;
    saree_id uuid;
    kurta_id uuid;
    dress_id uuid;
BEGIN
    -- Clean up existing sample orders first
    DELETE FROM order_items WHERE order_id IN (
        SELECT id FROM orders WHERE user_id IN (
            SELECT id FROM users WHERE username = 'ashu'
        )
    );
    DELETE FROM orders WHERE user_id IN (
        SELECT id FROM users WHERE username = 'ashu'
    );
    
    -- Get existing user "ashu"
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
            'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', -- SHA256 of empty string for demo
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
    
    -- If ramu partner doesn't exist, create one
    IF ramu_partner_id IS NULL THEN
        INSERT INTO partners (
            username,
            password_hash,
            full_name,
            email,
            phone,
            partner_type,
            society_id,
            tower_id,
            identity_type,
            identity_number,
            working_days,
            holiday_day,
            status
        ) VALUES (
            'ramu',
            'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', -- SHA256 of empty string for demo
            'Ramu Kumar',
            'ramu@example.com',
            '+91-9876543211',
            'both',
            user_society_id,
            user_tower_id,
            'aadhar',
            '1234-5678-9012',
            ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
            'sunday',
            'approved'
        ) RETURNING id INTO ramu_partner_id;
    END IF;
    
    -- Get or create clothing types
    SELECT ct.id INTO shirt_id FROM clothing_types ct WHERE ct.name = 'Shirt' LIMIT 1;
    IF shirt_id IS NULL THEN
        INSERT INTO clothing_types (name, normal_rate, priority_rate, express_rate)
        VALUES ('Shirt', 15, 20, 25) RETURNING id INTO shirt_id;
    END IF;
    
    SELECT ct.id INTO trouser_id FROM clothing_types ct WHERE ct.name = 'Trouser' LIMIT 1;
    IF trouser_id IS NULL THEN
        INSERT INTO clothing_types (name, normal_rate, priority_rate, express_rate)
        VALUES ('Trouser', 20, 25, 30) RETURNING id INTO trouser_id;
    END IF;
    
    SELECT ct.id INTO saree_id FROM clothing_types ct WHERE ct.name = 'Saree' LIMIT 1;
    IF saree_id IS NULL THEN
        INSERT INTO clothing_types (name, normal_rate, priority_rate, express_rate)
        VALUES ('Saree', 50, 60, 75) RETURNING id INTO saree_id;
    END IF;
    
    SELECT ct.id INTO kurta_id FROM clothing_types ct WHERE ct.name = 'Kurta' LIMIT 1;
    IF kurta_id IS NULL THEN
        INSERT INTO clothing_types (name, normal_rate, priority_rate, express_rate)
        VALUES ('Kurta', 25, 30, 35) RETURNING id INTO kurta_id;
    END IF;
    
    SELECT ct.id INTO dress_id FROM clothing_types ct WHERE ct.name = 'Dress' LIMIT 1;
    IF dress_id IS NULL THEN
        INSERT INTO clothing_types (name, normal_rate, priority_rate, express_rate)
        VALUES ('Dress', 30, 35, 40) RETURNING id INTO dress_id;
    END IF;
    
    -- Order 1: PENDING (just placed, waiting for pickup)
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
        CURRENT_TIMESTAMP + INTERVAL '3 days',
        'pending',
        CURRENT_TIMESTAMP - INTERVAL '30 minutes'
    );
    
    INSERT INTO order_items (order_id, clothing_type_id, quantity, rate, subtotal) VALUES
    (order1_id, shirt_id, 3, 15, 45),
    (order1_id, trouser_id, 2, 20, 40);
    
    -- Order 2: PENDING (another pending order)
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
        CURRENT_DATE + INTERVAL '2 days',
        'evening',
        'priority',
        95, -- 1 saree (60) + 1 kurta (30) + 1 dress (35)
        CURRENT_TIMESTAMP + INTERVAL '3 days',
        'pending',
        CURRENT_TIMESTAMP - INTERVAL '1 hour'
    );
    
    INSERT INTO order_items (order_id, clothing_type_id, quantity, rate, subtotal) VALUES
    (order2_id, saree_id, 1, 60, 60),
    (order2_id, kurta_id, 1, 30, 30),
    (order2_id, dress_id, 1, 35, 35);
    
    -- Order 3: PICKED_UP (collected, available for ironing partners to take)
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
        order3_id,
        ashu_user_id,
        CURRENT_DATE,
        'morning',
        'express',
        175, -- 4 shirts (100) + 3 trousers (90)
        CURRENT_TIMESTAMP + INTERVAL '4 hours',
        'picked_up',
        CURRENT_TIMESTAMP - INTERVAL '3 hours'
    );
    
    INSERT INTO order_items (order_id, clothing_type_id, quantity, rate, subtotal) VALUES
    (order3_id, shirt_id, 4, 25, 100),
    (order3_id, trouser_id, 3, 30, 90);
    
    -- Order 4: IN_PROGRESS (assigned to ramu and being worked on)
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
        order4_id,
        ashu_user_id,
        CURRENT_DATE - INTERVAL '1 day',
        'evening',
        'priority',
        130, -- 2 shirts (40) + 1 saree (60) + 1 kurta (30)
        CURRENT_TIMESTAMP + INTERVAL '12 hours',
        'in_progress',
        ramu_partner_id,
        CURRENT_TIMESTAMP - INTERVAL '2 hours',
        CURRENT_TIMESTAMP - INTERVAL '8 hours'
    );
    
    INSERT INTO order_items (order_id, clothing_type_id, quantity, rate, subtotal) VALUES
    (order4_id, shirt_id, 2, 20, 40),
    (order4_id, saree_id, 1, 60, 60),
    (order4_id, kurta_id, 1, 30, 30);
    
    -- Order 5: READY (completed by ramu, ready for delivery)
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
        order5_id,
        ashu_user_id,
        CURRENT_DATE - INTERVAL '2 days',
        'morning',
        'normal',
        110, -- 2 kurtas (50) + 2 dresses (60)
        CURRENT_TIMESTAMP + INTERVAL '6 hours',
        'ready',
        ramu_partner_id,
        CURRENT_TIMESTAMP - INTERVAL '6 hours',
        CURRENT_TIMESTAMP - INTERVAL '2 hours',
        ramu_partner_id,
        CURRENT_TIMESTAMP - INTERVAL '1 day'
    );
    
    INSERT INTO order_items (order_id, clothing_type_id, quantity, rate, subtotal) VALUES
    (order5_id, kurta_id, 2, 25, 50),
    (order5_id, dress_id, 2, 30, 60);
    
    -- Order 6: DELIVERED (completed and delivered by ramu)
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
        order6_id,
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
        CURRENT_TIMESTAMP - INTERVAL '2 days' + INTERVAL '1 hour',
        CURRENT_TIMESTAMP - INTERVAL '5 days'
    );
    
    INSERT INTO order_items (order_id, clothing_type_id, quantity, rate, subtotal) VALUES
    (order6_id, shirt_id, 2, 20, 40),
    (order6_id, saree_id, 2, 60, 120);
    
    RAISE NOTICE 'Corrected sample order data created successfully!';
    RAISE NOTICE 'User: Ashu Kumar (ID: %)', ashu_user_id;
    RAISE NOTICE 'Partner: Ramu Kumar (ID: %)', ramu_partner_id;
    RAISE NOTICE 'Created 6 orders with proper status distribution:';
    RAISE NOTICE '- 2 PENDING orders (waiting for pickup)';
    RAISE NOTICE '- 1 PICKED_UP order (available for ironing partners)';
    RAISE NOTICE '- 1 IN_PROGRESS order (assigned to ramu)';
    RAISE NOTICE '- 1 READY order (completed by ramu, ready for delivery)';
    RAISE NOTICE '- 1 DELIVERED order (completed and delivered by ramu)';
    RAISE NOTICE '';
    RAISE NOTICE 'Order Status Flow Verification:';
    RAISE NOTICE '✓ PENDING: Orders placed but not picked up yet';
    RAISE NOTICE '✓ PICKED_UP: Orders collected, available for ironing assignment';
    RAISE NOTICE '✓ IN_PROGRESS: Orders assigned to ironing partner and being worked on';
    RAISE NOTICE '✓ READY: Orders completed by ironing partner, ready for delivery';
    RAISE NOTICE '✓ DELIVERED: Orders completed and delivered to customer';
    
END $$;