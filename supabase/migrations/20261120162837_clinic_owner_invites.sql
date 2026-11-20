-- Clínicas por liberação de e-mail.
-- O super admin (profiles.is_platform_admin, definido só por SQL) libera o
-- e-mail da cliente como "dona de clínica"; a cliente se cadastra e cria a
-- própria clínica pelo app. Pacientes de visualização também precisam de
-- liberação, mas não podem criar clínica.

-- 1. tipo de liberação (a lista também libera pacientes de visualização)
alter table public.signup_allowlist
  add column kind text not null default 'patient'
    constraint signup_allowlist_kind_check check (kind in ('clinic_owner', 'patient'));

comment on column public.signup_allowlist.kind is
  'clinic_owner: pode criar UMA clínica ao entrar; patient: acesso de visualização (ligado pela clínica)';

-- 2. toda conta precisa de e-mail liberado, inclusive a primeira
--    (antes, com o banco vazio, qualquer pessoa podia se cadastrar primeiro)
create or replace function public.block_signup_after_first_user()
returns trigger
language plpgsql
security definer
set search_path to ''
as $$
begin
  if not exists (
    select 1 from public.signup_allowlist a
    where a.email = lower(btrim(new.email))
  ) then
    raise exception 'signup_closed: este e-mail não foi liberado'
      using errcode = '42501';
  end if;
  return new;
end;
$$;

-- 3. super admin da plataforma (sem precisar ser membro de clínica)
create or replace function public.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path to ''
as $$
  select coalesce(
    (select p.is_platform_admin from public.profiles p where p.id = (select auth.uid())),
    false
  );
$$;

-- 4. pode criar clínica: e-mail liberado como dona de clínica e ainda sem
--    nenhum vínculo (cada liberação vale para uma clínica)
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

-- 5. create_clinic: só para quem pode (sem promover ninguém a super admin)
create or replace function public.create_clinic(p_name text)
returns uuid
language plpgsql
security definer
set search_path to ''
as $$
declare
  v_user uuid := auth.uid();
  v_name text;
  v_clinic_id uuid;
begin
  if v_user is null then
    raise exception 'not authenticated';
  end if;

  v_name := btrim(regexp_replace(coalesce(p_name, ''), '\s+', ' ', 'g'));
  if char_length(v_name) < 3 or char_length(v_name) > 100 then
    raise exception 'invalid clinic name';
  end if;

  if not public.can_create_clinic() then
    raise exception 'not allowed';
  end if;

  insert into public.profiles (id, first_name, sur_name, crefito)
  select u.id,
         u.raw_user_meta_data ->> 'first_name',
         u.raw_user_meta_data ->> 'sur_name',
         u.raw_user_meta_data ->> 'crefito'
  from auth.users u
  where u.id = v_user
  on conflict (id) do nothing;

  insert into public.clinics (name) values (v_name) returning id into v_clinic_id;

  insert into public.clinic_members (user_id, clinic_id, role)
  values (v_user, v_clinic_id, 'admin');

  return v_clinic_id;
end;
$$;

-- 6. funções do painel do super admin
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
    set kind = 'clinic_owner',
        note = coalesce(excluded.note, public.signup_allowlist.note);
end;
$$;

create or replace function public.admin_list_clinic_owners()
returns table (
  email text,
  note text,
  allowed_at timestamptz,
  signed_up boolean,
  email_confirmed boolean,
  clinic_name text,
  clinic_created_at timestamptz
)
language plpgsql
stable
security definer
set search_path to ''
as $$
begin
  if not public.is_platform_admin() then
    raise exception 'not allowed';
  end if;

  return query
  select a.email,
         a.note,
         a.created_at,
         u.id is not null,
         u.email_confirmed_at is not null,
         c.name,
         c.created_at
  from public.signup_allowlist a
  left join auth.users u on lower(u.email) = a.email
  left join public.clinic_members m on m.user_id = u.id and m.role = 'admin'
  left join public.clinics c on c.id = m.clinic_id
  where a.kind = 'clinic_owner'
  order by a.created_at desc;
end;
$$;

revoke execute on function public.is_platform_admin() from public, anon;
revoke execute on function public.can_create_clinic() from public, anon;
revoke execute on function public.admin_allow_clinic_owner(text, text) from public, anon;
revoke execute on function public.admin_list_clinic_owners() from public, anon;
grant execute on function public.is_platform_admin() to authenticated;
grant execute on function public.can_create_clinic() to authenticated;
grant execute on function public.admin_allow_clinic_owner(text, text) to authenticated;
grant execute on function public.admin_list_clinic_owners() to authenticated;
