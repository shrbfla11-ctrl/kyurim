-- 7차: PUF 서명 저장과 등록/대조용 RPC
alter table public.stickers add column if not exists pattern_signature jsonb;

-- 등록 (관리자): 서명을 저장하고 상태를 done 으로
create or replace function public.enroll_sticker(p_serial text, p_signature jsonb) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then
    raise exception 'admin only';
  end if;
  update public.stickers set pattern_signature = p_signature, status = 'done', pattern_hash = md5(p_signature::text)
    where serial = p_serial;
  if not found then
    raise exception 'sticker not found';
  end if;
end $$;

-- 대조용 서명 목록 (로그인 사용자). 서버 API 에서만 호출합니다.
create or replace function public.list_signatures() returns table (serial text, signature jsonb)
language sql stable security definer set search_path = public as $$
  select serial, pattern_signature from public.stickers
  where status = 'done' and pattern_signature is not null and auth.uid() is not null;
$$;

-- 스티커 발급 (관리자): 시리얼 n 개를 등록 대기(processing) 상태로 만듭니다.
create or replace function public.issue_stickers(p_product_id uuid, p_count integer) returns setof text
language plpgsql security definer set search_path = public as $$
declare
  v_code text;
  v_yy text := to_char(now(), 'YY');
  v_start integer;
  v_lot text;
begin
  if not public.is_admin() then
    raise exception 'admin only';
  end if;
  if p_count < 1 or p_count > 500 then
    raise exception 'count must be 1..500';
  end if;
  select upper(regexp_replace(substr(m.name, 1, 2), '[^A-Za-z]', 'X', 'g')) into v_code
    from public.products p join public.manufacturers m on m.id = p.manufacturer_id where p.id = p_product_id;
  if v_code is null then
    raise exception 'product not found';
  end if;
  select count(*) into v_start from public.stickers where product_id = p_product_id;
  v_lot := v_code || v_yy || '-' || to_char(now(), 'MMDD');
  return query
    insert into public.stickers (serial, product_id, lot, status)
    select 'PUF-' || v_code || v_yy || '-' || lpad((v_start + g)::text, 6, '0'), p_product_id, v_lot, 'processing'
    from generate_series(1, p_count) as g
    returning serial;
end $$;
