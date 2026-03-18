-- Seed data for CJ BrewKin Coffee Shop

-- Insert Categories
INSERT INTO public.categories (id, name, description) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'Hot Coffee', 'Freshly brewed hot coffee drinks'),
  ('c1000000-0000-0000-0000-000000000002', 'Iced Coffee', 'Refreshing cold coffee beverages'),
  ('c1000000-0000-0000-0000-000000000003', 'Specialty Drinks', 'Our signature and seasonal drinks'),
  ('c1000000-0000-0000-0000-000000000004', 'Pastries', 'Fresh baked goods and snacks'),
  ('c1000000-0000-0000-0000-000000000005', 'Merchandise', 'CJ BrewKin branded items')
ON CONFLICT DO NOTHING;

-- Insert Products
INSERT INTO public.products (name, description, price, category_id, is_available, stock_quantity, image_url) VALUES
  -- Hot Coffee
  ('Classic Americano', 'Rich espresso with hot water for a smooth, bold flavor', 3.50, 'c1000000-0000-0000-0000-000000000001', true, 100, '/images/americano.jpg'),
  ('Caramel Latte', 'Espresso with steamed milk and sweet caramel syrup', 4.50, 'c1000000-0000-0000-0000-000000000001', true, 100, '/images/caramel-latte.jpg'),
  ('Vanilla Cappuccino', 'Espresso with foamy milk and vanilla essence', 4.25, 'c1000000-0000-0000-0000-000000000001', true, 100, '/images/cappuccino.jpg'),
  ('Mocha Delight', 'Espresso blended with chocolate and steamed milk', 4.75, 'c1000000-0000-0000-0000-000000000001', true, 100, '/images/mocha.jpg'),
  ('House Blend', 'Our signature medium roast drip coffee', 2.75, 'c1000000-0000-0000-0000-000000000001', true, 100, '/images/house-blend.jpg'),
  
  -- Iced Coffee
  ('Iced Americano', 'Espresso over ice with cold water', 3.75, 'c1000000-0000-0000-0000-000000000002', true, 100, '/images/iced-americano.jpg'),
  ('Cold Brew', '20-hour steeped smooth cold coffee', 4.25, 'c1000000-0000-0000-0000-000000000002', true, 100, '/images/cold-brew.jpg'),
  ('Iced Caramel Macchiato', 'Vanilla, milk, espresso and caramel drizzle over ice', 5.00, 'c1000000-0000-0000-0000-000000000002', true, 100, '/images/iced-macchiato.jpg'),
  ('Vietnamese Iced Coffee', 'Strong coffee with sweet condensed milk', 4.50, 'c1000000-0000-0000-0000-000000000002', true, 100, '/images/vietnamese-coffee.jpg'),
  
  -- Specialty Drinks
  ('BrewKin Signature', 'Our secret recipe with hints of hazelnut and cinnamon', 5.50, 'c1000000-0000-0000-0000-000000000003', true, 50, '/images/brewkin-signature.jpg'),
  ('Matcha Latte', 'Premium Japanese matcha with steamed milk', 5.00, 'c1000000-0000-0000-0000-000000000003', true, 75, '/images/matcha-latte.jpg'),
  ('Chai Tea Latte', 'Spiced chai with creamy steamed milk', 4.50, 'c1000000-0000-0000-0000-000000000003', true, 75, '/images/chai-latte.jpg'),
  
  -- Pastries
  ('Butter Croissant', 'Flaky, buttery French croissant', 3.25, 'c1000000-0000-0000-0000-000000000004', true, 30, '/images/croissant.jpg'),
  ('Chocolate Muffin', 'Rich double chocolate muffin', 3.50, 'c1000000-0000-0000-0000-000000000004', true, 25, '/images/chocolate-muffin.jpg'),
  ('Blueberry Scone', 'Fresh blueberry scone with glaze', 3.75, 'c1000000-0000-0000-0000-000000000004', true, 20, '/images/blueberry-scone.jpg'),
  ('Cinnamon Roll', 'Warm cinnamon roll with cream cheese frosting', 4.00, 'c1000000-0000-0000-0000-000000000004', true, 15, '/images/cinnamon-roll.jpg')
ON CONFLICT DO NOTHING;

-- Insert Add-ons
INSERT INTO public.addons (name, price, is_available) VALUES
  ('Extra Espresso Shot', 0.75, true),
  ('Oat Milk', 0.60, true),
  ('Almond Milk', 0.60, true),
  ('Soy Milk', 0.50, true),
  ('Vanilla Syrup', 0.50, true),
  ('Caramel Syrup', 0.50, true),
  ('Hazelnut Syrup', 0.50, true),
  ('Whipped Cream', 0.50, true),
  ('Chocolate Drizzle', 0.40, true),
  ('Cinnamon Powder', 0.25, true)
ON CONFLICT DO NOTHING;

-- Insert Suppliers
INSERT INTO public.suppliers (name, contact_person, email, phone, address, notes) VALUES
  ('Bean Brothers Co.', 'James Miller', 'james@beanbrothers.com', '555-0101', '123 Coffee Lane, Seattle, WA 98101', 'Primary coffee bean supplier - Arabica specialty'),
  ('Dairy Fresh Farms', 'Sarah Johnson', 'sarah@dairyfresh.com', '555-0102', '456 Farm Road, Portland, OR 97201', 'Organic milk and cream supplier'),
  ('Sweet Syrups Inc.', 'Michael Chen', 'michael@sweetsyrups.com', '555-0103', '789 Sugar Ave, San Francisco, CA 94102', 'Flavored syrups and sweeteners'),
  ('Baker''s Best', 'Emily Davis', 'emily@bakersbest.com', '555-0104', '321 Pastry Blvd, Los Angeles, CA 90001', 'Fresh pastries daily delivery'),
  ('Cup & Lid Supply', 'Robert Wilson', 'robert@cupandlid.com', '555-0105', '654 Package St, Denver, CO 80201', 'Cups, lids, and packaging materials')
ON CONFLICT DO NOTHING;

-- Insert Supplies
INSERT INTO public.supplies (name, description, quantity, unit, reorder_level, supplier_id) VALUES
  ('Arabica Coffee Beans', 'Premium single-origin beans', 50, 'kg', 15, (SELECT id FROM public.suppliers WHERE name = 'Bean Brothers Co.' LIMIT 1)),
  ('Robusta Coffee Beans', 'Strong blend beans', 30, 'kg', 10, (SELECT id FROM public.suppliers WHERE name = 'Bean Brothers Co.' LIMIT 1)),
  ('Whole Milk', 'Fresh dairy milk', 40, 'gallons', 15, (SELECT id FROM public.suppliers WHERE name = 'Dairy Fresh Farms' LIMIT 1)),
  ('Oat Milk', 'Plant-based oat milk', 25, 'gallons', 10, (SELECT id FROM public.suppliers WHERE name = 'Dairy Fresh Farms' LIMIT 1)),
  ('Vanilla Syrup', 'Premium vanilla flavoring', 20, 'bottles', 8, (SELECT id FROM public.suppliers WHERE name = 'Sweet Syrups Inc.' LIMIT 1)),
  ('Caramel Syrup', 'Rich caramel flavoring', 18, 'bottles', 8, (SELECT id FROM public.suppliers WHERE name = 'Sweet Syrups Inc.' LIMIT 1)),
  ('Paper Cups (12oz)', 'Medium size cups', 500, 'units', 200, (SELECT id FROM public.suppliers WHERE name = 'Cup & Lid Supply' LIMIT 1)),
  ('Paper Cups (16oz)', 'Large size cups', 400, 'units', 150, (SELECT id FROM public.suppliers WHERE name = 'Cup & Lid Supply' LIMIT 1)),
  ('Cup Lids', 'Universal fit lids', 800, 'units', 300, (SELECT id FROM public.suppliers WHERE name = 'Cup & Lid Supply' LIMIT 1)),
  ('Croissants', 'Fresh butter croissants', 24, 'units', 10, (SELECT id FROM public.suppliers WHERE name = 'Baker''s Best' LIMIT 1))
ON CONFLICT DO NOTHING;
