-- Henrique Baby & Kids — schema da loja e do painel admin
-- Aplicado no projeto Supabase "henrique-baby-kids".

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Administradores (por e-mail; o login é por link mágico)
-- ---------------------------------------------------------------------------
create table public.admins (
  email text primary key check (email = lower(email)),
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.admins a
    where a.email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

-- ---------------------------------------------------------------------------
-- Catálogo
-- ---------------------------------------------------------------------------
create table public.collections (
  slug text primary key,
  name text not null,
  description text not null default '',
  image_url text,
  position int not null default 0,
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  short_description text not null default '',
  description text not null default '',
  details text[] not null default '{}',
  price numeric(10,2) not null check (price >= 0),
  compare_at_price numeric(10,2) check (compare_at_price is null or compare_at_price >= 0),
  cost_price numeric(10,2) not null default 0 check (cost_price >= 0),
  categories text[] not null default '{}',
  collection_slug text references public.collections(slug) on update cascade on delete set null,
  color text not null default '',
  is_new boolean not null default false,
  featured boolean not null default false,
  status text not null default 'active' check (status in ('active','draft','archived')),
  released_at date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index products_status_idx on public.products(status);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null,
  storage_path text,
  alt text not null default '',
  position int not null default 0,
  created_at timestamptz not null default now()
);
create index product_images_product_idx on public.product_images(product_id, position);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  size text not null,
  sku text,
  stock int not null default 0 check (stock >= 0),
  low_stock_threshold int not null default 2,
  position int not null default 0,
  unique (product_id, size)
);
create index product_variants_product_idx on public.product_variants(product_id, position);

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger products_touch before update on public.products
for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Cupons
-- ---------------------------------------------------------------------------
create table public.coupons (
  code text primary key check (code = upper(code)),
  description text not null default '',
  percent int not null check (percent between 1 and 90),
  active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  max_uses int,
  used_count int not null default 0,
  min_subtotal numeric(10,2) not null default 0,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Pedidos
-- ---------------------------------------------------------------------------
create sequence public.order_number_seq start 1001;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  number int not null unique default nextval('public.order_number_seq'),
  status text not null default 'pending'
    check (status in ('pending','paid','shipped','delivered','cancelled')),
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  address jsonb not null,
  payment_method text not null check (payment_method in ('pix','cartao','boleto')),
  subtotal numeric(10,2) not null,
  discount numeric(10,2) not null default 0,
  pix_discount numeric(10,2) not null default 0,
  shipping numeric(10,2) not null default 0,
  total numeric(10,2) not null,
  coupon_code text,
  admin_notes text not null default '',
  tracking_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index orders_created_idx on public.orders(created_at desc);
create index orders_status_idx on public.orders(status);
create trigger orders_touch before update on public.orders
for each row execute function public.touch_updated_at();

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  variant_id uuid references public.product_variants(id) on delete set null,
  product_name text not null,
  product_image text,
  size text not null,
  unit_price numeric(10,2) not null,
  unit_cost numeric(10,2) not null default 0,
  quantity int not null check (quantity > 0)
);
create index order_items_order_idx on public.order_items(order_id);

-- ---------------------------------------------------------------------------
-- Estoque e financeiro
-- ---------------------------------------------------------------------------
create table public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null references public.product_variants(id) on delete cascade,
  delta int not null,
  reason text not null check (reason in ('sale','restock','adjustment','return','cancel','initial')),
  note text not null default '',
  order_id uuid references public.orders(id) on delete set null,
  created_by text,
  created_at timestamptz not null default now()
);
create index stock_movements_variant_idx on public.stock_movements(variant_id, created_at desc);
create index stock_movements_created_idx on public.stock_movements(created_at desc);

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  description text not null,
  category text not null default 'outros',
  amount numeric(10,2) not null check (amount > 0),
  spent_on date not null default current_date,
  created_at timestamptz not null default now()
);
create index expenses_spent_idx on public.expenses(spent_on desc);

create table public.newsletter_subscribers (
  email text primary key,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.admins enable row level security;
alter table public.collections enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_variants enable row level security;
alter table public.coupons enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.stock_movements enable row level security;
alter table public.expenses enable row level security;
alter table public.newsletter_subscribers enable row level security;

-- Leitura pública da vitrine
create policy "vitrine: colecoes" on public.collections for select using (true);
create policy "vitrine: produtos ativos" on public.products for select
  using (status = 'active' or public.is_admin());
create policy "vitrine: imagens" on public.product_images for select
  using (exists (select 1 from public.products p where p.id = product_id and (p.status = 'active' or public.is_admin())));
create policy "vitrine: variantes" on public.product_variants for select
  using (exists (select 1 from public.products p where p.id = product_id and (p.status = 'active' or public.is_admin())));

-- Admin: acesso total
create policy "admin: admins" on public.admins for select using (public.is_admin());
create policy "admin: colecoes" on public.collections for all using (public.is_admin()) with check (public.is_admin());
create policy "admin: produtos" on public.products for all using (public.is_admin()) with check (public.is_admin());
create policy "admin: imagens" on public.product_images for all using (public.is_admin()) with check (public.is_admin());
create policy "admin: variantes" on public.product_variants for all using (public.is_admin()) with check (public.is_admin());
create policy "admin: cupons" on public.coupons for all using (public.is_admin()) with check (public.is_admin());
create policy "admin: pedidos" on public.orders for all using (public.is_admin()) with check (public.is_admin());
create policy "admin: itens" on public.order_items for all using (public.is_admin()) with check (public.is_admin());
create policy "admin: estoque" on public.stock_movements for all using (public.is_admin()) with check (public.is_admin());
create policy "admin: despesas" on public.expenses for all using (public.is_admin()) with check (public.is_admin());
create policy "admin: newsletter" on public.newsletter_subscribers for select using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Funções públicas (security definer) — a vitrine nunca escreve direto nas tabelas
-- ---------------------------------------------------------------------------

-- Valida cupom e devolve o percentual
create or replace function public.check_coupon(p_code text, p_subtotal numeric default 0)
returns table (code text, percent int, description text)
language sql stable security definer set search_path = public
as $$
  select c.code, c.percent, c.description
  from public.coupons c
  where c.code = upper(trim(p_code))
    and c.active
    and (c.starts_at is null or c.starts_at <= now())
    and (c.ends_at is null or c.ends_at >= now())
    and (c.max_uses is null or c.used_count < c.max_uses)
    and p_subtotal >= c.min_subtotal;
$$;

-- Frete estimado por região do CEP (mesma tabela do front)
create or replace function public.shipping_quote(p_cep text, p_subtotal numeric)
returns numeric language plpgsql immutable as $$
declare d text := regexp_replace(coalesce(p_cep,''), '\D', '', 'g');
begin
  if length(d) <> 8 then raise exception 'CEP inválido'; end if;
  if p_subtotal >= 199 then return 0; end if;
  return case left(d,1)
    when '0' then 14.90 when '1' then 16.90 when '2' then 19.90 when '3' then 19.90
    when '4' then 24.90 when '5' then 27.90 when '6' then 29.90 when '7' then 22.90
    when '8' then 19.90 else 21.90 end;
end; $$;

-- Cria o pedido: confere estoque, recalcula preços no servidor e baixa o estoque
create or replace function public.place_order(payload jsonb)
returns table (order_id uuid, order_number int, total numeric)
language plpgsql security definer set search_path = public
as $$
#variable_conflict use_column
declare
  v_coupon_code text;
  v_item jsonb;
  v_variant record;
  v_subtotal numeric := 0;
  v_discount numeric := 0;
  v_pix numeric := 0;
  v_shipping numeric;
  v_total numeric;
  v_coupon record;
  v_order_id uuid;
  v_number int;
  v_payment text := payload->>'payment_method';
  v_items jsonb := payload->'items';
begin
  if v_items is null or jsonb_array_length(v_items) = 0 then
    raise exception 'Sacola vazia';
  end if;
  if jsonb_array_length(v_items) > 50 then
    raise exception 'Itens demais';
  end if;

  -- trava as variantes e soma
  for v_item in select * from jsonb_array_elements(v_items) loop
    select pv.id, pv.stock, pv.size, p.id as product_id, p.name, p.price, p.cost_price, p.status
      into v_variant
      from public.product_variants pv join public.products p on p.id = pv.product_id
      where p.id = (v_item->>'product_id')::uuid and pv.size = v_item->>'size'
      for update of pv;
    if not found or v_variant.status <> 'active' then
      raise exception 'Produto indisponível';
    end if;
    if (v_item->>'quantity')::int < 1 or (v_item->>'quantity')::int > 10 then
      raise exception 'Quantidade inválida';
    end if;
    if v_variant.stock < (v_item->>'quantity')::int then
      raise exception 'Estoque insuficiente: % (tam. %)', v_variant.name, v_variant.size;
    end if;
    v_subtotal := v_subtotal + v_variant.price * (v_item->>'quantity')::int;
  end loop;

  if coalesce(payload->>'coupon_code','') <> '' then
    select * into v_coupon from public.check_coupon(payload->>'coupon_code', v_subtotal);
    if found then
      v_discount := round(v_subtotal * v_coupon.percent / 100.0, 2);
      v_coupon_code := v_coupon.code;
    end if;
  end if;

  v_shipping := public.shipping_quote(payload->'address'->>'cep', v_subtotal);
  v_total := v_subtotal - v_discount + v_shipping;
  if v_payment = 'pix' then
    v_pix := round(v_total * 0.05, 2);
    v_total := v_total - v_pix;
  end if;

  insert into public.orders (customer_name, customer_email, customer_phone, address, payment_method,
    subtotal, discount, pix_discount, shipping, total, coupon_code)
  values (payload->>'customer_name', lower(payload->>'customer_email'), payload->>'customer_phone',
    payload->'address', v_payment, v_subtotal, v_discount, v_pix, v_shipping, v_total,
    v_coupon_code)
  returning id, number into v_order_id, v_number;

  for v_item in select * from jsonb_array_elements(v_items) loop
    select pv.id, pv.size, p.id as product_id, p.name, p.price, p.cost_price,
      (select url from public.product_images i where i.product_id = p.id order by position limit 1) as image
      into v_variant
      from public.product_variants pv join public.products p on p.id = pv.product_id
      where p.id = (v_item->>'product_id')::uuid and pv.size = v_item->>'size';

    insert into public.order_items (order_id, product_id, variant_id, product_name, product_image, size, unit_price, unit_cost, quantity)
    values (v_order_id, v_variant.product_id, v_variant.id, v_variant.name, v_variant.image, v_variant.size,
      v_variant.price, v_variant.cost_price, (v_item->>'quantity')::int);

    update public.product_variants set stock = stock - (v_item->>'quantity')::int where id = v_variant.id;
    insert into public.stock_movements (variant_id, delta, reason, order_id, note)
    values (v_variant.id, -(v_item->>'quantity')::int, 'sale', v_order_id, 'Pedido #' || v_number);
  end loop;

  if v_coupon_code is not null then
    update public.coupons set used_count = used_count + 1 where code = v_coupon_code;
  end if;

  return query select v_order_id, v_number, v_total;
end; $$;

-- Ajuste manual de estoque (admin)
create or replace function public.adjust_stock(p_variant_id uuid, p_delta int, p_reason text, p_note text default '')
returns int language plpgsql security definer set search_path = public
as $$
declare v_stock int;
begin
  if not public.is_admin() then raise exception 'Acesso negado'; end if;
  if p_reason not in ('restock','adjustment','return') then raise exception 'Motivo inválido'; end if;
  update public.product_variants set stock = stock + p_delta where id = p_variant_id
    returning stock into v_stock;
  if v_stock is null then raise exception 'Variante não encontrada'; end if;
  insert into public.stock_movements (variant_id, delta, reason, note, created_by)
  values (p_variant_id, p_delta, p_reason, coalesce(p_note,''), auth.jwt() ->> 'email');
  return v_stock;
end; $$;

-- Muda status do pedido; cancelar devolve o estoque
create or replace function public.set_order_status(p_order_id uuid, p_status text)
returns void language plpgsql security definer set search_path = public
as $$
declare v_old text; r record;
begin
  if not public.is_admin() then raise exception 'Acesso negado'; end if;
  select status into v_old from public.orders where id = p_order_id for update;
  if v_old is null then raise exception 'Pedido não encontrado'; end if;
  if v_old = 'cancelled' and p_status <> 'cancelled' then raise exception 'Pedido cancelado não pode ser reaberto'; end if;
  update public.orders set status = p_status where id = p_order_id;
  if p_status = 'cancelled' and v_old <> 'cancelled' then
    for r in select variant_id, quantity from public.order_items where order_id = p_order_id and variant_id is not null loop
      update public.product_variants set stock = stock + r.quantity where id = r.variant_id;
      insert into public.stock_movements (variant_id, delta, reason, order_id, note, created_by)
      values (r.variant_id, r.quantity, 'cancel', p_order_id, 'Cancelamento', auth.jwt() ->> 'email');
    end loop;
  end if;
end; $$;

create or replace function public.subscribe_newsletter(p_email text)
returns void language sql security definer set search_path = public
as $$
  insert into public.newsletter_subscribers (email) values (lower(trim(p_email)))
  on conflict do nothing;
$$;

revoke all on function public.place_order(jsonb) from public;
revoke all on function public.adjust_stock(uuid, int, text, text) from public;
revoke all on function public.set_order_status(uuid, text) from public;
grant execute on function public.place_order(jsonb) to anon, authenticated;
grant execute on function public.check_coupon(text, numeric) to anon, authenticated;
grant execute on function public.subscribe_newsletter(text) to anon, authenticated;
grant execute on function public.adjust_stock(uuid, int, text, text) to authenticated;
grant execute on function public.set_order_status(uuid, text) to authenticated;

-- ---------------------------------------------------------------------------
-- Storage: fotos dos produtos (leitura pública, escrita só admin)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 5242880, array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do nothing;

create policy "fotos: admin envia" on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images' and public.is_admin());
create policy "fotos: admin altera" on storage.objects for update to authenticated
  using (bucket_id = 'product-images' and public.is_admin());
create policy "fotos: admin remove" on storage.objects for delete to authenticated
  using (bucket_id = 'product-images' and public.is_admin());
