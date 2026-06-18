-- Function to check if user is admin (SECURITY DEFINER bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  );
$$;

-- Drop problematic policies on profiles and recreate
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT USING (
    public.is_admin()
  );

-- Drop and recreate policies on orders that check profiles
DROP POLICY IF EXISTS "Admins can read all orders" ON orders;
DROP POLICY IF EXISTS "Admins can update all orders" ON orders;
DROP POLICY IF EXISTS "Admins can read all order items" ON order_items;
DROP POLICY IF EXISTS "Admins can read all order history" ON order_status_history;

CREATE POLICY "Admins can read all orders"
  ON orders FOR SELECT USING (
    public.is_admin()
  );
CREATE POLICY "Admins can update all orders"
  ON orders FOR UPDATE USING (
    public.is_admin()
  );
CREATE POLICY "Admins can read all order items"
  ON order_items FOR SELECT USING (
    public.is_admin()
  );
CREATE POLICY "Admins can read all order history"
  ON order_status_history FOR SELECT USING (
    public.is_admin()
  );

-- Fix categories, products, product_images, product_variants admin policies
DROP POLICY IF EXISTS "Admins can insert categories" ON categories;
DROP POLICY IF EXISTS "Admins can update categories" ON categories;
DROP POLICY IF EXISTS "Admins can delete categories" ON categories;
DROP POLICY IF EXISTS "Admins can insert products" ON products;
DROP POLICY IF EXISTS "Admins can update products" ON products;
DROP POLICY IF EXISTS "Admins can delete products" ON products;
DROP POLICY IF EXISTS "Admins can manage product images" ON product_images;
DROP POLICY IF EXISTS "Admins can update product images" ON product_images;
DROP POLICY IF EXISTS "Admins can delete product images" ON product_images;
DROP POLICY IF EXISTS "Admins can manage product variants" ON product_variants;
DROP POLICY IF EXISTS "Admins can update product variants" ON product_variants;
DROP POLICY IF EXISTS "Admins can delete product variants" ON product_variants;

CREATE POLICY "Admins can insert categories"
  ON categories FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update categories"
  ON categories FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete categories"
  ON categories FOR DELETE USING (public.is_admin());
CREATE POLICY "Admins can insert products"
  ON products FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update products"
  ON products FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete products"
  ON products FOR DELETE USING (public.is_admin());
CREATE POLICY "Admins can manage product images"
  ON product_images FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update product images"
  ON product_images FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete product images"
  ON product_images FOR DELETE USING (public.is_admin());
CREATE POLICY "Admins can manage product variants"
  ON product_variants FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update product variants"
  ON product_variants FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete product variants"
  ON product_variants FOR DELETE USING (public.is_admin());
