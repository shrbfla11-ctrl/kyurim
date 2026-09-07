-- PUF 초기 스키마: 프로필·제조사·제품·스티커·스캔 기록·문의·FAQ + RLS

-- ---------- enums ----------
create type public.user_role as enum ('user', 'admin', 'manufacturer');
create type public.product_category as enum ('스킨케어', '전자기기', '건강식품', '패션잡화');
create type public.sticker_status as enum ('processing', 'done', 'failed', 'revoked');
create type public.scan_outcome as enum ('genuine', 'unverified', 'fake');
create type public.inquiry_category as enum ('스캔 오류', '결과 문의', '계정', '제안', '기타');
create type public.inquiry_status as enum ('wait', 'done');
create type public.message_sender as enum ('user', 'admin');

-- ---------- helpers ----------
create or replace function public.set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ---------- profiles ----------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null default 'user',
  name text,
  marketing_opt_in boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name, marketing_opt_in)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name'),
    coalesce((new.raw_user_meta_data->>'marketing_opt_in')::boolean, false)
  );
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- ---------- manufacturers / products ----------
create table public.manufacturers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact_email text,
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  manufacturer_id uuid not null references public.manufacturers(id) on delete restrict,
  name text not null,
  category public.product_category not null,
  description text,
  image_url text,
  info jsonb not null default '[]'::jsonb, -- [{title, body}]
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index products_manufacturer_idx on public.products(manufacturer_id);
create trigger products_updated_at before update on public.products
  for each row execute function public.set_updated_at();

-- ---------- stickers ----------
create table public.stickers (
  id uuid primary key default gen_random_uuid(),
  serial text not null unique,
  product_id uuid not null references public.products(id) on delete restrict,
  lot text,
  pattern_ref text,     -- 스토리지 경로 (엔진 확정 전 자리표시자)
  pattern_hash text,
  status public.sticker_status not null default 'processing',
  issued_at timestamptz not null default now(),
  scan_count integer not null default 0,
  first_scanned_at timestamptz
);
create index stickers_product_idx on public.stickers(product_id);
create index stickers_pattern_hash_idx on public.stickers(pattern_hash);

-- ---------- scan_records ----------
create table public.scan_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  sticker_id uuid references public.stickers(id) on delete set null,
  outcome public.scan_outcome not null,
  score numeric(5,4),
  count_at_scan integer not null default 0,
  region text,
  scanned_at timestamptz not null default now()
);
create index scan_records_user_idx on public.scan_records(user_id, scanned_at desc);
create index scan_records_sticker_idx on public.scan_records(sticker_id);
create index scan_records_scanned_at_idx on public.scan_records(scanned_at desc);

create or replace function public.bump_sticker_scan() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.sticker_id is not null then
    update public.stickers
      set scan_count = scan_count + 1,
          first_scanned_at = coalesce(first_scanned_at, new.scanned_at)
      where id = new.sticker_id
      returning scan_count into new.count_at_scan;
  end if;
  return new;
end $$;
create trigger scan_records_bump before insert on public.scan_records
  for each row execute function public.bump_sticker_scan();

-- ---------- inquiries ----------
create sequence public.inquiry_ticket_seq;

create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  ticket text not null unique,
  user_id uuid not null references auth.users(id) on delete cascade,
  category public.inquiry_category not null,
  subject text not null,
  status public.inquiry_status not null default 'wait',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index inquiries_user_idx on public.inquiries(user_id, created_at desc);
create trigger inquiries_updated_at before update on public.inquiries
  for each row execute function public.set_updated_at();

create or replace function public.set_inquiry_ticket() returns trigger
language plpgsql as $$
begin
  if new.ticket is null or new.ticket = '' then
    new.ticket = '#PUF-' || to_char(now() at time zone 'Asia/Seoul', 'YYMMDD') || '-'
      || lpad((nextval('public.inquiry_ticket_seq') % 10000)::text, 4, '0');
  end if;
  return new;
end $$;
create trigger inquiries_ticket before insert on public.inquiries
  for each row execute function public.set_inquiry_ticket();

create table public.inquiry_messages (
  id uuid primary key default gen_random_uuid(),
  inquiry_id uuid not null references public.inquiries(id) on delete cascade,
  sender public.message_sender not null,
  sender_id uuid references auth.users(id) on delete set null,
  body text not null,
  attachments text[] not null default '{}',
  created_at timestamptz not null default now()
);
create index inquiry_messages_inquiry_idx on public.inquiry_messages(inquiry_id, created_at);

-- 관리자 답변 시 문의 상태를 done 으로, 사용자 추가 문의 시 wait 로
create or replace function public.sync_inquiry_status() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  update public.inquiries
    set status = case when new.sender = 'admin' then 'done'::public.inquiry_status else 'wait'::public.inquiry_status end
    where id = new.inquiry_id;
  return new;
end $$;
create trigger inquiry_messages_status after insert on public.inquiry_messages
  for each row execute function public.sync_inquiry_status();

-- ---------- faqs ----------
create table public.faqs (
  id uuid primary key default gen_random_uuid(),
  category public.inquiry_category not null,
  question text not null,
  answer text not null,
  sort_order integer not null default 0,
  published boolean not null default true
);

-- ---------- dashboard view ----------
create or replace view public.dashboard_stats with (security_invoker = true) as
select
  (select count(*) from public.scan_records where scanned_at >= date_trunc('day', now() at time zone 'Asia/Seoul') at time zone 'Asia/Seoul') as scans_today,
  (select count(*) from public.scan_records where scanned_at >= (date_trunc('day', now() at time zone 'Asia/Seoul') - interval '1 day') at time zone 'Asia/Seoul'
     and scanned_at < date_trunc('day', now() at time zone 'Asia/Seoul') at time zone 'Asia/Seoul') as scans_yesterday,
  (select coalesce(round(100.0 * count(*) filter (where outcome = 'genuine') / nullif(count(*), 0), 1), 0)
     from public.scan_records where scanned_at >= now() - interval '7 days') as genuine_rate_7d,
  (select count(*) from public.scan_records where outcome = 'fake' and scanned_at >= now() - interval '1 day') as suspected_24h,
  (select count(*) from public.stickers where status = 'done') as stickers_issued,
  (select count(*) from public.stickers where status = 'done' and issued_at >= date_trunc('month', now())) as stickers_issued_month;

-- ---------- RLS ----------
alter table public.profiles enable row level security;
alter table public.manufacturers enable row level security;
alter table public.products enable row level security;
alter table public.stickers enable row level security;
alter table public.scan_records enable row level security;
alter table public.inquiries enable row level security;
alter table public.inquiry_messages enable row level security;
alter table public.faqs enable row level security;

-- profiles
create policy "profiles: own select" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "profiles: own update" on public.profiles for update using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());
-- role 은 관리자만 변경 가능
create or replace function public.guard_profile_role() returns trigger
language plpgsql as $$
begin
  -- 대시보드·서비스 키 실행(auth.uid() 가 null)은 허용, 일반 로그인 사용자만 차단
  if new.role is distinct from old.role and auth.uid() is not null and not public.is_admin() then
    raise exception 'role can only be changed by admin';
  end if;
  return new;
end $$;
create trigger profiles_guard_role before update on public.profiles
  for each row execute function public.guard_profile_role();

-- manufacturers / products / faqs: 공개 읽기, 관리자 쓰기
create policy "manufacturers: public read" on public.manufacturers for select using (true);
create policy "manufacturers: admin write" on public.manufacturers for all using (public.is_admin()) with check (public.is_admin());
create policy "products: public read" on public.products for select using (true);
create policy "products: admin write" on public.products for all using (public.is_admin()) with check (public.is_admin());
create policy "faqs: public read" on public.faqs for select using (published or public.is_admin());
create policy "faqs: admin write" on public.faqs for all using (public.is_admin()) with check (public.is_admin());

-- stickers: 관리자 전용 (소비자는 API 경유)
create policy "stickers: admin all" on public.stickers for all using (public.is_admin()) with check (public.is_admin());

-- scan_records
create policy "scan_records: own read" on public.scan_records for select using (user_id = auth.uid() or public.is_admin());
create policy "scan_records: own insert" on public.scan_records for insert with check (user_id = auth.uid());

-- inquiries
create policy "inquiries: own read" on public.inquiries for select using (user_id = auth.uid() or public.is_admin());
create policy "inquiries: own insert" on public.inquiries for insert with check (user_id = auth.uid());
create policy "inquiries: admin update" on public.inquiries for update using (public.is_admin()) with check (public.is_admin());

-- inquiry_messages
create policy "inquiry_messages: read" on public.inquiry_messages for select
  using (public.is_admin() or exists (select 1 from public.inquiries i where i.id = inquiry_id and i.user_id = auth.uid()));
create policy "inquiry_messages: user insert" on public.inquiry_messages for insert
  with check (sender = 'user' and sender_id = auth.uid()
    and exists (select 1 from public.inquiries i where i.id = inquiry_id and i.user_id = auth.uid()));
create policy "inquiry_messages: admin insert" on public.inquiry_messages for insert
  with check (public.is_admin() and sender = 'admin');

-- ---------- storage buckets ----------
insert into storage.buckets (id, name, public) values
  ('product-images', 'product-images', true),
  ('sticker-patterns', 'sticker-patterns', false),
  ('inquiry-attachments', 'inquiry-attachments', false)
on conflict (id) do nothing;

create policy "product-images: public read" on storage.objects for select using (bucket_id = 'product-images');
create policy "product-images: admin write" on storage.objects for all
  using (bucket_id = 'product-images' and public.is_admin()) with check (bucket_id = 'product-images' and public.is_admin());
create policy "sticker-patterns: admin all" on storage.objects for all
  using (bucket_id = 'sticker-patterns' and public.is_admin()) with check (bucket_id = 'sticker-patterns' and public.is_admin());
create policy "inquiry-attachments: own or admin" on storage.objects for all
  using (bucket_id = 'inquiry-attachments' and (public.is_admin() or (storage.foldername(name))[1] = auth.uid()::text))
  with check (bucket_id = 'inquiry-attachments' and (public.is_admin() or (storage.foldername(name))[1] = auth.uid()::text));
