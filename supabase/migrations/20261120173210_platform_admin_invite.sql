-- Liberação de super admin pela própria lista de e-mails.
-- Com kind = 'platform_admin', a conta já nasce como super admin
-- (sem precisar de UPDATE manual em profiles depois do cadastro).
--
-- Uso (só por SQL, nunca pelo app):
--   insert into public.signup_allowlist (email, note, kind)
--   values ('email@exemplo.com', 'super admin', 'platform_admin');

-- 1. novo tipo de liberação
alter table public.signup_allowlist
  drop constraint signup_allowlist_kind_check,
  add constraint signup_allowlist_kind_check
    check (kind in ('platform_admin', 'clinic_owner', 'patient'));

comment on column public.signup_allowlist.kind is
  'platform_admin: super admin (também pode criar UMA clínica); clinic_owner: pode criar UMA clínica ao entrar; patient: acesso de visualização (ligado pela clínica)';

-- 2. novo usuário: perfil criado já com o super admin, se liberado assim
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path to ''
as $$
begin
  insert into public.profiles (id, first_name, sur_name, crefito, title, is_platform_admin)
  values (
    new.id,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'sur_name',
    new.raw_user_meta_data ->> 'crefito',
    case
      when new.raw_user_meta_data ->> 'title' in ('Dr.', 'Dra.')
        then new.raw_user_meta_data ->> 'title'
    end,
    exists (
      select 1 from public.signup_allowlist a
      where a.email = lower(btrim(new.email)) and a.kind = 'platform_admin'
    )
  );
  return new;
end;
$$;

-- 3. o super admin também pode criar a própria clínica (uma)
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
      where u.id = (select auth.uid())
        and a.kind in ('platform_admin', 'clinic_owner')
    );
$$;

-- 4. liberar uma dona de clínica nunca rebaixa um super admin
create or replace function public.admin_allow_clinic_owner(p_email text, p_note text default null)
returns void
language plpgsql
security definer
set search_path to ''
as $$
declare
  v_email text := lower(btrim(coalesce(p_email, '')));
begin
  if not public.is_platform_admin() then
    raise exception 'not allowed';
  end if;
  if v_email !~ '^[^\s@]+@[^\s@]+\.[^\s@]+$' or char_length(v_email) > 254 then
    raise exception 'invalid email';
  end if;

  insert into public.signup_allowlist (email, note, kind)
  values (v_email, nullif(btrim(coalesce(p_note, '')), ''), 'clinic_owner')
  on conflict (email) do update
    set kind = case
          when public.signup_allowlist.kind = 'platform_admin' then 'platform_admin'
          else 'clinic_owner'
        end,
        note = coalesce(excluded.note, public.signup_allowlist.note);
end;
$$;
