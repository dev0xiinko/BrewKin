-- Fix all product and addon prices to Philippine Peso
-- Multiply USD prices by ~55 to convert to PHP

-- Update ALL products with proper PHP prices
UPDATE public.products SET price = 
  CASE name
    WHEN 'Classic Americano' THEN 130
    WHEN 'Caramel Latte' THEN 165
    WHEN 'Vanilla Cappuccino' THEN 155
    WHEN 'Mocha Delight' THEN 175
    WHEN 'House Blend' THEN 99
    WHEN 'Iced Americano' THEN 140
    WHEN 'Cold Brew' THEN 155
    WHEN 'Iced Caramel Macchiato' THEN 185
    WHEN 'Vietnamese Iced Coffee' THEN 165
    WHEN 'BrewKin Signature' THEN 199
    WHEN 'Matcha Latte' THEN 180
    WHEN 'Chai Tea Latte' THEN 165
    WHEN 'Butter Croissant' THEN 95
    WHEN 'Chocolate Muffin' THEN 85
    WHEN 'Blueberry Scone' THEN 90
    WHEN 'Cinnamon Roll' THEN 110
    ELSE price * 55
  END;

-- Update ALL addons with proper PHP prices
UPDATE public.addons SET price = 
  CASE name
    WHEN 'Extra Espresso Shot' THEN 30
    WHEN 'Oat Milk' THEN 25
    WHEN 'Almond Milk' THEN 25
    WHEN 'Soy Milk' THEN 20
    WHEN 'Vanilla Syrup' THEN 20
    WHEN 'Caramel Syrup' THEN 20
    WHEN 'Hazelnut Syrup' THEN 20
    WHEN 'Whipped Cream' THEN 20
    WHEN 'Chocolate Drizzle' THEN 15
    WHEN 'Cinnamon Powder' THEN 10
    ELSE price * 55
  END;
