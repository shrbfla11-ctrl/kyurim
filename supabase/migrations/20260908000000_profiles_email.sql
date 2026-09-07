-- 3차: 관리자 고객 지원 화면에서 문의자 이메일을 보기 위해 profiles 에 email 을 둡니다.
alter table public.profiles add column if not exists email text;

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, name, marketing_opt_in)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name'),
    coalesce((new.raw_user_meta_data->>'marketing_opt_in')::boolean, false)
  );
  return new;
end $$;

-- 이메일 변경 시 동기화
create or replace function public.sync_profile_email() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  update public.profiles set email = new.email where id = new.id;
  return new;
end $$;
drop trigger if exists on_auth_user_email_updated on auth.users;
create trigger on_auth_user_email_updated after update of email on auth.users
  for each row execute function public.sync_profile_email();

update public.profiles p set email = u.email from auth.users u where u.id = p.id and p.email is null;
