-- 2차: 문의 카테고리 값을 화면과 맞추고, 소비자 스캔용 RPC 와 초기 데이터를 추가합니다.

-- ---------- 문의 카테고리 값 정리 (화면의 supportCategories 와 동일하게) ----------
alter type public.inquiry_category rename value '스캔 오류' to '스캔·인식';
alter type public.inquiry_category rename value '계정' to '계정·로그인';
alter type public.inquiry_category rename value '결과 문의' to '결과·정품';
alter type public.inquiry_category rename value '제안' to '제조사 도입';

-- ---------- 소비자 스캔 RPC (stickers 는 관리자만 읽을 수 있어 security definer 로 제공) ----------

-- 엔진 연결 전 자리표시자: 등록 완료된 스티커 중 하나를 임의로 고릅니다.
create or replace function public.pick_placeholder_sticker() returns text
language sql stable security definer set search_path = public as $$
  select serial from public.stickers where status = 'done' order by random() limit 1;
$$;

-- 스캔 결과를 기록하고 결과 화면용 정보를 반환합니다. 로그인 사용자만 호출 가능.
create or replace function public.record_scan(
  p_serial text, p_outcome public.scan_outcome, p_score numeric default null, p_region text default null
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
  insert into public.scan_records (user_id, sticker_id, outcome, score, region)
    values (auth.uid(), v_sticker, p_outcome, p_score, p_region)
    returning id into v_id;
  return v_id;
end $$;

-- 결과 화면: 본인 기록 또는 관리자만 조회
create or replace function public.scan_result(p_id uuid) returns json
language sql stable security definer set search_path = public as $$
  select json_build_object(
    'id', r.id,
    'outcome', r.outcome,
    'scannedAt', r.scanned_at,
    'count', r.count_at_scan,
    'firstScanAt', coalesce(s.first_scanned_at, r.scanned_at),
    'serial', s.serial,
    'lot', s.lot,
    'product', case when p.id is null then null else json_build_object(
      'name', p.name, 'category', p.category, 'maker', m.name, 'imageUrl', p.image_url, 'info', p.info
    ) end
  )
  from public.scan_records r
  left join public.stickers s on s.id = r.sticker_id
  left join public.products p on p.id = s.product_id
  left join public.manufacturers m on m.id = p.manufacturer_id
  where r.id = p_id and (r.user_id = auth.uid() or public.is_admin());
$$;

-- 스캔 기록 목록: 본인 기록
create or replace function public.scan_history() returns table (
  id uuid, outcome public.scan_outcome, scanned_at timestamptz, product_name text, maker_name text
)
language sql stable security definer set search_path = public as $$
  select r.id, r.outcome, r.scanned_at, p.name, m.name
  from public.scan_records r
  left join public.stickers s on s.id = r.sticker_id
  left join public.products p on p.id = s.product_id
  left join public.manufacturers m on m.id = p.manufacturer_id
  where r.user_id = auth.uid()
  order by r.scanned_at desc
  limit 200;
$$;

-- ---------- 내부 계정 표시 이름 ----------
update public.profiles p set name = 'PUF 관리자' from auth.users u where u.id = p.id and u.email = 'admin@puf.com' and p.name is null;
update public.profiles p set name = 'PUF 테스트 계정' from auth.users u where u.id = p.id and u.email = 'demo@puf.com' and p.name is null;

-- ---------- 초기 데이터 (화면 예시와 동일) ----------
insert into public.manufacturers (id, name) values
  ('a0000000-0000-4000-8000-000000000001', '루미에르 코스메틱'),
  ('a0000000-0000-4000-8000-000000000002', '소닉웨이브'),
  ('a0000000-0000-4000-8000-000000000003', '헬씨라이프'),
  ('a0000000-0000-4000-8000-000000000004', '메종 도레'),
  ('a0000000-0000-4000-8000-000000000005', '볼트랩')
on conflict (id) do nothing;

insert into public.products (id, manufacturer_id, name, category, description, info) values
  ('b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', '글로우 리페어 세럼 50ml', '스킨케어',
   '히알루론산과 나이아신아마이드를 담은 데일리 리페어 세럼',
   '[{"title":"제품 설명","body":"히알루론산과 나이아신아마이드를 담은 데일리 리페어 세럼이에요. 건조하고 거칠어진 피부 결을 정돈해 줍니다. (제조사 제공 정보)"},{"title":"전성분","body":"정제수, 글리세린, 나이아신아마이드, 부틸렌글라이콜, 소듐하이알루로네이트, 판테놀, 알란토인, 1,2-헥산다이올"},{"title":"사용 방법","body":"세안 후 토너로 피부를 정돈한 뒤, 적당량을 얼굴 전체에 고르게 펴 바르고 가볍게 두드려 흡수시켜 주세요."}]'),
  ('b0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', '하이드라 선크림 SPF50+', '스킨케어', null, '[]'),
  ('b0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000002', '에어핏 무선 이어버드', '전자기기', null, '[]'),
  ('b0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000003', '프리미엄 오메가3 90캡슐', '건강식품', null, '[]'),
  ('b0000000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000004', '시그니처 레더 카드지갑', '패션잡화', null, '[]'),
  ('b0000000-0000-4000-8000-000000000006', 'a0000000-0000-4000-8000-000000000005', '그래핀 보조배터리 10000', '전자기기', null, '[]')
on conflict (id) do nothing;

-- 자리표시자 엔진이 고를 수 있도록 제품별 스티커 3장씩
insert into public.stickers (serial, product_id, lot, status)
select 'PUF-' || code || '26-' || lpad((n)::text, 6, '0'), pid, code || '26-0913', 'done'
from (values
  ('LM', 'b0000000-0000-4000-8000-000000000001'::uuid),
  ('LM', 'b0000000-0000-4000-8000-000000000002'::uuid),
  ('SW', 'b0000000-0000-4000-8000-000000000003'::uuid),
  ('HL', 'b0000000-0000-4000-8000-000000000004'::uuid),
  ('MD', 'b0000000-0000-4000-8000-000000000005'::uuid),
  ('VL', 'b0000000-0000-4000-8000-000000000006'::uuid)
) as t(code, pid), generate_series(1, 3) as n
on conflict (serial) do nothing;

insert into public.faqs (category, question, answer, sort_order) values
  ('스캔·인식', '스티커가 인식되지 않아요', '스티커 전체가 사각형 안에 들어오도록 정면에서 맞추고, 플래시가 꺼진 뒤 찍힐 때까지 10~15cm 거리에서 움직이지 말아 주세요. 주변이 밝으면 패턴이 흐려지므로 그늘을 만들면 인식률이 높아져요.', 1),
  ('스캔·인식', '플래시가 켜지지 않아요', '플래시는 촬영 버튼을 누른 뒤 잠깐만 켜졌다가 자동으로 꺼져요. 일부 구형 기기나 브라우저는 플래시 제어를 지원하지 않아, 밝은 빛을 쬔 스티커를 어두운 곳에서 직접 촬영하셔야 해요.', 2),
  ('스캔·인식', '카메라 권한을 허용했는데 화면이 검게 나와요', '다른 앱이 카메라를 사용 중이면 화면이 표시되지 않을 수 있어요. 카메라를 사용하는 다른 앱을 종료한 뒤 페이지를 새로 고침해 주세요.', 3),
  ('계정·로그인', '소셜 로그인이 안 돼요', '카카오·Google 로그인 팝업이 차단되어 있는지 확인해 주세요. 같은 이메일로 가입된 계정이 있으면 자동으로 하나의 계정으로 연결돼요.', 4),
  ('계정·로그인', '비밀번호를 잊었어요', '로그인 화면의 "비밀번호 찾기"에서 가입한 이메일을 입력하면 재설정 링크를 보내드려요. 링크는 10분 동안 유효해요.', 5),
  ('결과·정품', '위조 의심이 나왔어요', '등록된 원본 패턴과 일치하지 않을 때 표시돼요. 결과 화면을 공유 버튼으로 저장해 구매처 또는 제조사 고객센터에 문의해 주세요. 제품을 사용하기 전에 확인하시길 권해요.', 6),
  ('결과·정품', '정품인데 스캔 횟수 경고가 떠요', '같은 스티커가 여러 번 스캔되면 표시돼요. 매장 시연이나 가족이 함께 확인한 경우처럼 정상적인 상황일 수도 있지만, 중고 거래 제품이라면 판매자에게 확인해 보세요.', 7),
  ('결과·정품', '스캔 기록이 사라졌어요', '스캔 기록은 로그인한 계정에 저장돼요. 다른 계정으로 로그인했는지 확인해 주세요.', 8),
  ('제조사 도입', '제조사인데 도입하고 싶어요', '제품 등록부터 스티커 발급, 스캔 모니터링까지 관리자 콘솔에서 이용할 수 있어요. 1:1 문의에서 "제조사 도입"을 선택해 회사명과 제품군을 남겨 주시면 담당자가 연락드려요.', 9),
  ('기타', '촬영한 사진은 어디에 저장되나요?', '어디에도 저장되지 않아요. 이미지는 패턴 대조 직후 즉시 삭제되며 서버에 남지 않아요. 스캔 기록에는 결과 정보만 저장돼요.', 10);
