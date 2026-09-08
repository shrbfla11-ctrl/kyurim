-- 6차: 스캔 기록에 촬영 조건(플래시 조사 시간·프레임 수·간격)을 남깁니다. 논문 실험 조건별 비교용.
alter table public.scan_records
  add column if not exists charge_ms integer,
  add column if not exists frame_count integer,
  add column if not exists frame_interval_ms integer;

drop function if exists public.record_scan(text, public.scan_outcome, numeric, text);
create or replace function public.record_scan(
  p_serial text, p_outcome public.scan_outcome, p_score numeric default null, p_region text default null,
  p_charge_ms integer default null, p_frame_count integer default null, p_frame_interval_ms integer default null
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_sticker uuid;
  v_id uuid;
begin
  if auth.uid() is null then
    raise exception 'login required';
  end if;
  select id into v_sticker from public.stickers where serial = p_serial;
  insert into public.scan_records (user_id, sticker_id, outcome, score, region, charge_ms, frame_count, frame_interval_ms)
    values (auth.uid(), v_sticker, p_outcome, p_score, p_region, p_charge_ms, p_frame_count, p_frame_interval_ms)
    returning id into v_id;
  return v_id;
end $$;
