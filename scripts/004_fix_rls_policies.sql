-- Fix infinite recursion in RLS policies
-- The issue is that checking is_admin on profiles table inside a profiles policy causes recursion

-- Drop the problematic policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- For profiles, we simply allow users to see their own profile
-- Admin access to profiles can be done through service role or direct queries

-- Fix admin policies on other tables to use auth.jwt() instead of querying profiles
-- This avoids the recursion issue

-- Categories policies fix
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
CREATE POLICY "Admins can manage categories" ON public.categories FOR ALL USING (
  (auth.jwt() ->> 'is_admin')::boolean = true OR 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
);

-- Products policies fix
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
CREATE POLICY "Admins can manage products" ON public.products FOR ALL USING (
  (auth.jwt() ->> 'is_admin')::boolean = true OR 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
);

-- Addons policies fix
DROP POLICY IF EXISTS "Admins can manage addons" ON public.addons;
CREATE POLICY "Admins can manage addons" ON public.addons FOR ALL USING (
  (auth.jwt() ->> 'is_admin')::boolean = true OR 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
);

-- Suppliers policies fix
DROP POLICY IF EXISTS "Admins can manage suppliers" ON public.suppliers;
CREATE POLICY "Admins can manage suppliers" ON public.suppliers FOR ALL USING (
  (auth.jwt() ->> 'is_admin')::boolean = true OR 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
);

-- Supplies policies fix
DROP POLICY IF EXISTS "Admins can manage supplies" ON public.supplies;
CREATE POLICY "Admins can manage supplies" ON public.supplies FOR ALL USING (
  (auth.jwt() ->> 'is_admin')::boolean = true OR 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
);

-- Orders policies fix
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
CREATE POLICY "Admins can view all orders" ON public.orders FOR SELECT USING (
  (auth.jwt() ->> 'is_admin')::boolean = true OR 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
);
CREATE POLICY "Admins can update orders" ON public.orders FOR UPDATE USING (
  (auth.jwt() ->> 'is_admin')::boolean = true OR 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
);

-- Order items policies fix
DROP POLICY IF EXISTS "Admins can view all order items" ON public.order_items;
CREATE POLICY "Admins can view all order items" ON public.order_items FOR SELECT USING (
  (auth.jwt() ->> 'is_admin')::boolean = true OR 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
);

-- Order item addons policies fix
DROP POLICY IF EXISTS "Admins can view all order item addons" ON public.order_item_addons;
CREATE POLICY "Admins can view all order item addons" ON public.order_item_addons FOR SELECT USING (
  (auth.jwt() ->> 'is_admin')::boolean = true OR 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
);
