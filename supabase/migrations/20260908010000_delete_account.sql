-- 4차: 회원 탈퇴. 본인 계정을 auth.users 에서 삭제합니다.
-- profiles·inquiries 는 cascade 로 함께 삭제되고, scan_records 는 user_id 만 null 이 되어 통계용으로 남습니다.
-- 관리자 계정은 실수 방지를 위해 탈퇴할 수 없습니다.
create or replace function public.delete_my_account() returns void
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'login required';
  end if;
  if exists (select 1 from public.profiles where id = v_uid and role = 'admin') then
    raise exception 'admin account cannot be deleted';
  end if;
  -- 문의 첨부 파일 정리
  delete from storage.objects where bucket_id = 'inquiry-attachments' and (storage.foldername(name))[1] = v_uid::text;
  delete from auth.users where id = v_uid;
end $$;

revoke all on function public.delete_my_account() from public;
grant execute on function public.delete_my_account() to authenticated;
