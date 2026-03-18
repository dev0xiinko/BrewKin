-- Fix infinite recursion in profiles RLS policy
-- The issue is that checking is_admin on profiles table from within a profiles policy causes recursion

-- Drop the problematic policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Create new non-recursive policies for profiles
-- Users can always view and manage their own profile (simple auth.uid() check, no recursion)
CREATE POLICY "profiles_select_own" ON public.profiles 
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON public.profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles 
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_delete_own" ON public.profiles 
  FOR DELETE USING (auth.uid() = id);

-- For admin access to all profiles, we use a security definer function
-- that bypasses RLS to check admin status
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid()),
    FALSE
  );
$$;

-- Now update all admin policies to use the function instead of subquery
-- This prevents recursion because the function runs with SECURITY DEFINER

-- Drop and recreate admin policies for other tables
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
DROP POLICY IF EXISTS "Admins can manage addons" ON public.addons;
DROP POLICY IF EXISTS "Admins can manage suppliers" ON public.suppliers;
DROP POLICY IF EXISTS "Admins can manage supplies" ON public.supplies;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all order items" ON public.order_items;
DROP POLICY IF EXISTS "Admins can view all order item addons" ON public.order_item_addons;

-- Recreate with the function
CREATE POLICY "Admins can manage categories" ON public.categories 
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admins can manage products" ON public.products 
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admins can manage addons" ON public.addons 
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admins can manage suppliers" ON public.suppliers 
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admins can manage supplies" ON public.supplies 
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admins can view all orders" ON public.orders 
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can update orders" ON public.orders 
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can view all order items" ON public.order_items 
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can view all order item addons" ON public.order_item_addons 
  FOR SELECT USING (public.is_admin());

-- Add policy for admins to view all profiles using the function
CREATE POLICY "profiles_admin_select_all" ON public.profiles
  FOR SELECT USING (public.is_admin());
