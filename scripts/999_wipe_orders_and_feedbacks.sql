-- Wipe shop order history and customer feedback, but keep user accounts and products
-- Run this script with caution! It will irreversibly delete order and feedback data.

-- Disable triggers to avoid foreign key issues (if needed)
-- ALTER TABLE ... DISABLE TRIGGER ALL;

-- Delete product feedbacks
TRUNCATE TABLE product_feedbacks RESTART IDENTITY CASCADE;

-- Delete general reviews
TRUNCATE TABLE reviews RESTART IDENTITY CASCADE;

-- Delete order item add-ons
TRUNCATE TABLE order_item_addons RESTART IDENTITY CASCADE;

-- Delete order items
TRUNCATE TABLE order_items RESTART IDENTITY CASCADE;

-- Delete orders
TRUNCATE TABLE orders RESTART IDENTITY CASCADE;

-- Enable triggers again if you disabled them
-- ALTER TABLE ... ENABLE TRIGGER ALL;

-- Done. All order and feedback data wiped, accounts and products remain.
