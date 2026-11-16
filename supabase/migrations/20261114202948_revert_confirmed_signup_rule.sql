-- A regra "email_confirmed_at preenchido" não funciona: o Auth insere o usuário
-- sem confirmação e só confirma depois (UPDATE). Volta a permitir apenas convidados.
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
