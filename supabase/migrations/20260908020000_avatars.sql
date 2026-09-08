-- 5차: 프로필 사진. profiles.avatar_url + 공개 avatars 버킷 (본인 폴더만 쓰기 가능)
alter table public.profiles add column if not exists avatar_url text;

insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "avatars: public read" on storage.objects for select using (bucket_id = 'avatars');
create policy "avatars: own write" on storage.objects for insert
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars: own update" on storage.objects for update
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars: own delete" on storage.objects for delete
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- 회원 탈퇴 시 아바타 파일도 정리
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
  delete from storage.objects where bucket_id in ('inquiry-attachments', 'avatars') and (storage.foldername(name))[1] = v_uid::text;
  delete from auth.users where id = v_uid;
end $$;
