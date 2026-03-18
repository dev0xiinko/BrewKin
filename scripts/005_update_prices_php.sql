-- Update product prices to Philippine Peso
UPDATE products SET price = 120 WHERE name = 'Classic Espresso';
UPDATE products SET price = 150 WHERE name = 'Cappuccino';
UPDATE products SET price = 160 WHERE name = 'Caramel Latte';
UPDATE products SET price = 140 WHERE name = 'Mocha';
UPDATE products SET price = 130 WHERE name = 'Americano';
UPDATE products SET price = 180 WHERE name = 'Iced Caramel Macchiato';
UPDATE products SET price = 165 WHERE name = 'Vanilla Latte';
UPDATE products SET price = 185 WHERE name = 'Cold Brew';
UPDATE products SET price = 95 WHERE name = 'Green Tea';
UPDATE products SET price = 110 WHERE name = 'Chai Latte';
UPDATE products SET price = 85 WHERE name = 'Hot Chocolate';

-- Update addon prices to Philippine Peso
UPDATE addons SET price = 25 WHERE name = 'Extra Shot';
UPDATE addons SET price = 20 WHERE name = 'Vanilla Syrup';
UPDATE addons SET price = 20 WHERE name = 'Caramel Syrup';
UPDATE addons SET price = 20 WHERE name = 'Hazelnut Syrup';
UPDATE addons SET price = 30 WHERE name = 'Oat Milk';
UPDATE addons SET price = 25 WHERE name = 'Almond Milk';
UPDATE addons SET price = 15 WHERE name = 'Whipped Cream';
UPDATE addons SET price = 20 WHERE name = 'Chocolate Drizzle';
