-- =============================================================
-- Trava do primeiro cadastro
-- 1. is_first_setup_open(): informa ao app se a tela de primeiro
--    cadastro pode ser usada (só enquanto não existe nenhum usuário)
-- 2. trigger em auth.users: bloqueia cadastro público (signUp) depois
--    do primeiro usuário. Usuários convidados (invited_at preenchido)
--    continuam permitidos, para os convites futuros.
-- =============================================================

create or replace function public.is_first_setup_open()
returns boolean
language sql
stable
security definer
set search_path to ''
as $$
  select not exists (select 1 from auth.users);
$$;

revoke execute on function public.is_first_setup_open() from public;
grant execute on function public.is_first_setup_open() to anon, authenticated;

create or replace function public.block_signup_after_first_user()
returns trigger
language plpgsql
security definer
set search_path to ''
as $$
begin
  if new.invited_at is null and exists (select 1 from auth.users) then
    raise exception 'signup_closed: o cadastro público está desativado'
      using errcode = '42501';
  end if;
  return new;
end;
$$;

revoke execute on function public.block_signup_after_first_user() from public, anon, authenticated;

drop trigger if exists block_signup_after_first_user on auth.users;
create trigger block_signup_after_first_user
  before insert on auth.users
  for each row execute function public.block_signup_after_first_user();
