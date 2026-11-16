-- Lista de e-mails que podem ser cadastrados depois do primeiro usuário.
-- Só o SQL Editor mexe (RLS ligada, sem policies, sem grants para a API).
--
-- Uso:
--   insert into public.signup_allowlist (email, note) values ('email@exemplo.com', 'paciente X');
--   depois: Authentication -> Add user (ou Invite user) com o mesmo e-mail.
create table public.signup_allowlist (
  email text primary key check (email = lower(btrim(email))),
  note text,
  created_at timestamptz not null default now()
);

alter table public.signup_allowlist enable row level security;
revoke all on public.signup_allowlist from anon, authenticated;

-- O Auth grava o usuário antes de preencher invited_at/email_confirmed_at,
-- então a liberação é feita pelo e-mail.
create or replace function public.block_signup_after_first_user()
returns trigger
language plpgsql
security definer
set search_path to ''
as $$
begin
  if exists (select 1 from auth.users)
     and not exists (
       select 1 from public.signup_allowlist a
       where a.email = lower(btrim(new.email))
     )
  then
    raise exception 'signup_closed: o cadastro público está desativado'
      using errcode = '42501';
  end if;
  return new;
end;
$$;
