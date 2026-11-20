-- O super admin não participa de clínicas: só e-mail liberado como
-- dona de clínica pode criar uma.
create or replace function public.can_create_clinic()
returns boolean
language sql
stable
security definer
set search_path to ''
as $$
  select (select auth.uid()) is not null
    and not exists (
      select 1 from public.clinic_members m where m.user_id = (select auth.uid())
    )
    and exists (
      select 1
      from auth.users u
      join public.signup_allowlist a on a.email = lower(btrim(u.email))
      where u.id = (select auth.uid()) and a.kind = 'clinic_owner'
    );
$$;

comment on column public.signup_allowlist.kind is
  'platform_admin: super admin (não participa de clínicas); clinic_owner: pode criar UMA clínica ao entrar; patient: acesso de visualização (ligado pela clínica)';
