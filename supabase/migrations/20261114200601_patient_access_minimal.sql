-- =============================================================
-- Acesso do paciente (versão reduzida)
-- ATENÇÃO: o item 1 foi desfeito em 20261114202948_revert_confirmed_signup_rule
--    (o Auth confirma o e-mail só depois do INSERT). Use "Invite user".
-- 1. Libera o "Add user" do painel (com Auto Confirm): o usuário já
--    chega com email_confirmed_at preenchido. O cadastro público
--    continua bloqueado porque o projeto exige confirmação de e-mail
--    (mailer_autoconfirm = false). Se um dia ligar o auto confirm,
--    revisar esta regra.
-- 2. Paciente lê só a própria foto no Storage.
-- =============================================================

create or replace function public.block_signup_after_first_user()
returns trigger
language plpgsql
security definer
set search_path to ''
as $$
begin
  if new.invited_at is null
     and new.email_confirmed_at is null
     and exists (select 1 from auth.users)
  then
    raise exception 'signup_closed: o cadastro público está desativado'
      using errcode = '42501';
  end if;
  return new;
end;
$$;

create or replace function public.is_own_patient_photo(p_name text)
returns boolean
language sql
stable
security definer
set search_path to ''
as $$
  select exists (
    select 1 from public.patients p
    where p.auth_user_id = (select auth.uid())
      and p.photo_path = p_name
  );
$$;

revoke execute on function public.is_own_patient_photo(text) from public, anon;
grant execute on function public.is_own_patient_photo(text) to authenticated;

create policy "patient reads own photo"
  on storage.objects
  for select to authenticated
  using (bucket_id = 'patient-photos' and public.is_own_patient_photo(name));
