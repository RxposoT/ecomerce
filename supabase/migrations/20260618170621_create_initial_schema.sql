-- ============================================================
-- E-COMMERCE COMPLETE SCHEMA
-- Includes: profiles, categories, products, variants, images,
-- carts, orders, reviews, addresses, analytics tables
-- ============================================================

-- 0. EXTENSIONS
create extension if not exists "pgcrypto";

-- 1. ENUMS
create type order_status as enum (
  'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'
);

-- 2. PROFILES (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  avatar_url text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. ADDRESSES
create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  label text not null default 'Principal',
  street text not null,
  city text not null,
  state text,
  zip text not null,
  country text not null default 'Portugal',
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

-- 4. CATEGORIES (self-referencing hierarchy)
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  parent_id uuid references public.categories(id) on delete set null,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 5. PRODUCTS
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  price decimal(10,2) not null check (price >= 0),
  compare_price decimal(10,2) check (compare_price >= 0),
  cost_price decimal(10,2) check (cost_price >= 0),
  sku text unique,
  barcode text,
  category_id uuid references public.categories(id) on delete set null,
  stock_quantity int not null default 0 check (stock_quantity >= 0),
  min_stock_threshold int not null default 5,
  is_active boolean not null default true,
  is_featured boolean not null default false,
  weight decimal(8,2),
  dimensions jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 6. PRODUCT IMAGES
create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null,
  alt_text text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- 7. PRODUCT VARIANTS (size, color, etc.)
create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null,
  sku text unique,
  price_adjustment decimal(10,2) not null default 0,
  stock_quantity int not null default 0 check (stock_quantity >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 8. CARTS
create table if not exists public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  session_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint carts_user_or_session check (
    (user_id is not null and session_id is null) or
    (user_id is null and session_id is not null)
  )
);

-- 9. CART ITEMS
create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  variant_id uuid references public.product_variants(id) on delete set null,
  quantity int not null default 1 check (quantity > 0),
  unit_price decimal(10,2) not null,
  created_at timestamptz not null default now()
);

-- 10. ORDERS
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  order_number text not null unique,
  status order_status not null default 'pending',
  subtotal decimal(10,2) not null,
  shipping_cost decimal(10,2) not null default 0,
  tax_amount decimal(10,2) not null default 0,
  discount_amount decimal(10,2) not null default 0,
  total decimal(10,2) not null,
  shipping_address jsonb not null,
  billing_address jsonb,
  payment_intent_id text,
  payment_status text not null default 'pending',
  stripe_session_id text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 11. ORDER ITEMS (snapshot of product at time of purchase)
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null,
  variant_id uuid,
  product_name text not null,
  product_sku text,
  product_image_url text,
  variant_name text,
  quantity int not null,
  unit_price decimal(10,2) not null,
  total_price decimal(10,2) not null
);

-- 12. ORDER STATUS HISTORY (audit trail for analytics)
create table if not exists public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  from_status order_status,
  to_status order_status not null,
  changed_by text not null default 'system',
  created_at timestamptz not null default now()
);

-- 13. REVIEWS
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  rating int not null check (rating >= 1 and rating <= 5),
  title text,
  comment text,
  is_approved boolean not null default false,
  created_at timestamptz not null default now(),
  unique(product_id, user_id)
);

-- 14. PRODUCT VIEWS (analytics)
create table if not exists public.product_views (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  session_id text,
  viewed_at timestamptz not null default now()
);

-- 15. ABANDONED CARTS (analytics)
create table if not exists public.abandoned_carts (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  product_id uuid not null references public.products(id),
  variant_id uuid references public.product_variants(id),
  quantity int not null,
  price decimal(10,2) not null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- INDEXES
-- ============================================================
create index idx_products_slug on public.products(slug);
create index idx_products_category on public.products(category_id);
create index idx_products_active on public.products(is_active) where is_active = true;
create index idx_products_featured on public.products(is_featured) where is_featured = true;
create index idx_products_stock_low on public.products(stock_quantity) where stock_quantity <= min_stock_threshold;
create index idx_categories_slug on public.categories(slug);
create index idx_categories_parent on public.categories(parent_id);
create index idx_cart_items_cart on public.cart_items(cart_id);
create index idx_orders_user on public.orders(user_id);
create index idx_orders_status on public.orders(status);
create index idx_orders_payment on public.orders(payment_status);
create index idx_orders_created on public.orders(created_at desc);
create index idx_order_items_order on public.order_items(order_id);
create index idx_order_status_history_order on public.order_status_history(order_id);
create index idx_reviews_product on public.reviews(product_id);
create index idx_product_images_product on public.product_images(product_id);
create index idx_product_variants_product on public.product_variants(product_id);
create index idx_product_views_product on public.product_views(product_id);
create index idx_product_views_viewed on public.product_views(viewed_at desc);
create index idx_abandoned_carts_cart on public.abandoned_carts(cart_id);
create index idx_addresses_user on public.addresses(user_id);
create index idx_profiles_created on public.profiles(created_at desc);
create index idx_orders_user_created on public.orders(user_id, created_at desc);
create index idx_order_status_history_created on public.order_status_history(created_at desc);

-- ============================================================
-- TRIGGER FUNCTIONS
-- ============================================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace function public.create_order_number()
returns trigger as $$
begin
  new.order_number = 'ORD-' || to_char(new.created_at, 'YYYYMMDD') || '-' || upper(substr(md5(random()::text), 1, 8));
  return new;
end;
$$ language plpgsql;

-- ============================================================
-- TRIGGERS
-- ============================================================
create trigger handle_updated_at_profiles
  before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger handle_updated_at_products
  before update on public.products
  for each row execute function public.handle_updated_at();

create trigger handle_updated_at_categories
  before update on public.categories
  for each row execute function public.handle_updated_at();

create trigger handle_updated_at_product_variants
  before update on public.product_variants
  for each row execute function public.handle_updated_at();

create trigger handle_updated_at_carts
  before update on public.carts
  for each row execute function public.handle_updated_at();

create trigger handle_updated_at_orders
  before update on public.orders
  for each row execute function public.handle_updated_at();

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create trigger on_order_created
  before insert on public.orders
  for each row execute function public.create_order_number();

-- Auto-create order status history on status change
create or replace function public.handle_order_status_change()
returns trigger as $$
begin
  if old is null or old.status is distinct from new.status then
    insert into public.order_status_history (order_id, from_status, to_status, changed_by)
    values (new.id, old.status, new.status, 'system');
  end if;
  return new;
end;
$$ language plpgsql;

create trigger on_order_status_change
  after insert or update of status on public.orders
  for each row execute function public.handle_order_status_change();

-- Decrement stock on order paid
create or replace function public.decrement_stock_on_paid()
returns trigger as $$
declare
  item record;
begin
  if new.payment_status = 'succeeded' and (old.payment_status is distinct from 'succeeded') then
    for item in select * from public.order_items where order_id = new.id loop
      update public.products
      set stock_quantity = stock_quantity - item.quantity
      where id = item.product_id;
    end loop;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_order_paid
  after update of payment_status on public.orders
  for each row
  when (new.payment_status = 'succeeded')
  execute function public.decrement_stock_on_paid();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.profiles enable row level security;
alter table public.addresses enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_variants enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_status_history enable row level security;
alter table public.reviews enable row level security;
alter table public.product_views enable row level security;
alter table public.abandoned_carts enable row level security;

-- Profiles: users can read/update own profile; admin can read all
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Addresses: users can CRUD own addresses
create policy "Users manage own addresses"
  on public.addresses for all
  using (auth.uid() = user_id);

-- Categories: public read, admin write
create policy "Public read categories"
  on public.categories for select
  using (is_active = true);

-- Products: public read active, admin write
create policy "Public read active products"
  on public.products for select
  using (is_active = true);

create policy "Public read product images"
  on public.product_images for select
  using (true);

create policy "Public read product variants"
  on public.product_variants for select
  using (is_active = true);

-- Carts: users own cart
create policy "Users manage own cart"
  on public.carts for all
  using (auth.uid() = user_id);

create policy "Users manage own cart items"
  on public.cart_items for all
  using (
    cart_id in (
      select id from public.carts where user_id = auth.uid()
    )
  );

-- Orders: users view own orders
create policy "Users view own orders"
  on public.orders for select
  using (auth.uid() = user_id);

create policy "Users view own order items"
  on public.order_items for select
  using (
    order_id in (
      select id from public.orders where user_id = auth.uid()
    )
  );

create policy "Users view own order history"
  on public.order_status_history for select
  using (
    order_id in (
      select id from public.orders where user_id = auth.uid()
    )
  );

-- Reviews: public read approved, authenticated create
create policy "Public read approved reviews"
  on public.reviews for select
  using (is_approved = true);

create policy "Authenticated create reviews"
  on public.reviews for insert
  with check (auth.uid() = user_id);

-- Product views: insert for analytics
create policy "Insert product views"
  on public.product_views for insert
  with check (true);

-- ============================================================
-- ADMIN ROLES (service_role bypasses RLS)
-- We use a simple admin check via a custom claim
-- ============================================================
create or replace function public.is_admin()
returns boolean as $$
begin
  return coalesce(
    current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'is_admin',
    'false'
  )::boolean;
end;
$$ language plpgsql stable;

-- Admin override policies: if user is admin, they can see/do everything
create policy "Admin can read all products"
  on public.products for select
  using (is_admin());

create policy "Admin can write products"
  on public.products for insert
  with check (is_admin());

create policy "Admin can update products"
  on public.products for update
  using (is_admin());

create policy "Admin can delete products"
  on public.products for delete
  using (is_admin());

-- Repeat for categories, orders, etc. (simplified: admin policies on main tables)
create policy "Admin full access categories"
  on public.categories for all
  using (is_admin());

create policy "Admin full access orders"
  on public.orders for all
  using (is_admin());

create policy "Admin full access order items"
  on public.order_items for all
  using (is_admin());

create policy "Admin full access reviews"
  on public.reviews for all
  using (is_admin());

create policy "Admin full access profiles"
  on public.profiles for select
  using (is_admin());

-- ============================================================
-- MATERIALIZED VIEW FOR DASHBOARD METRICS
-- ============================================================
create materialized view if not exists public.daily_sales_summary as
select
  date_trunc('day', o.created_at) as day,
  count(*) as total_orders,
  count(distinct o.user_id) as unique_customers,
  coalesce(sum(o.total), 0) as total_revenue,
  coalesce(avg(o.total), 0) as average_order_value,
  coalesce(sum(o.total) / nullif(count(*), 0), 0) as revenue_per_order
from public.orders o
where o.payment_status = 'succeeded'
  and o.status != 'cancelled'
group by 1
order by 1 desc;

create unique index if not exists idx_daily_sales_day on public.daily_sales_summary(day);

-- Refresh function for the materialized view
create or replace function public.refresh_daily_sales_summary()
returns void as $$
begin
  refresh materialized view concurrently public.daily_sales_summary;
end;
$$ language plpgsql;
