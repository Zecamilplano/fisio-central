-- Ligação segura entre a conta de um paciente (só visualização) e o cadastro
-- dele, sem risco de a conta aparecer em outra clínica.
--
-- Uso (só pelo SQL Editor do Supabase):
--   1. liberar o e-mail:   insert into public.signup_allowlist (email, note, kind)
--                          values ('paciente@exemplo.com', 'Fulano', 'patient');
--   2. criar a conta:      Authentication -> Add user (Auto Confirm)
--   3. ligar:              select public.link_patient_account('paciente@exemplo.com', '<id do paciente>');
--   desfazer:              select public.unlink_patient_account('paciente@exemplo.com');

-- 1. uma conta fica ligada a no máximo um paciente
create unique index if not exists patients_auth_user_id_unique
  on public.patients (auth_user_id)
  where auth_user_id is not null;

-- 2. pelo app (usuário logado) ninguém liga/desliga conta de paciente:
--    só o SQL Editor (sem auth.uid()), pelas funções abaixo
create or replace function public.guard_patient_auth_user()
returns trigger
language plpgsql
set search_path to ''
as $$
begin
  if (select auth.uid()) is not null
     and (
       (tg_op = 'INSERT' and new.auth_user_id is not null)
       or (tg_op = 'UPDATE' and new.auth_user_id is distinct from old.auth_user_id)
     )
  then
    raise exception 'a conta do paciente só é ligada pelo administrador'
      using errcode = '42501';
  end if;
  return new;
end;
$$;

drop trigger if exists guard_patient_auth_user on public.patients;
create trigger guard_patient_auth_user
  before insert or update of auth_user_id on public.patients
  for each row execute function public.guard_patient_auth_user();

-- 3. vínculos de paciente: só pelo administrador, e conta de paciente
--    nunca participa de outra clínica (nem como equipe)
create or replace function public.guard_patient_membership()
returns trigger
language plpgsql
security definer
set search_path to ''
as $$
begin
  if (select auth.uid()) is not null
     and (new.role = 'patient' or (tg_op = 'UPDATE' and old.role = 'patient'))
  then
    raise exception 'o vínculo de paciente só é feito pelo administrador'
      using errcode = '42501';
  end if;

  if exists (
    select 1 from public.clinic_members m
    where m.user_id = new.user_id
      and m.clinic_id <> new.clinic_id
      and (m.role = 'patient' or new.role = 'patient')
  ) then
    raise exception 'conta de paciente não pode participar de outra clínica'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists guard_patient_membership on public.clinic_members;
create trigger guard_patient_membership
  before insert or update on public.clinic_members
  for each row execute function public.guard_patient_membership();

-- 4. ligar conta ao paciente: a clínica vem do próprio cadastro do paciente
create or replace function public.link_patient_account(p_email text, p_patient_id uuid)
returns text
language plpgsql
security definer
set search_path to ''
as $$
declare
  v_email text := lower(btrim(coalesce(p_email, '')));
  v_user uuid;
  v_clinic uuid;
  v_linked uuid;
  v_patient_name text;
  v_clinic_name text;
begin
  select u.id into v_user from auth.users u where lower(u.email) = v_email;
  if v_user is null then
    raise exception 'conta não encontrada para %: crie em Authentication -> Add user', v_email;
  end if;

  if not exists (
    select 1 from public.signup_allowlist a
    where a.email = v_email and a.kind = 'patient'
  ) then
    raise exception '% não está liberado como paciente', v_email;
  end if;

  select p.clinic_id, p.auth_user_id,
         btrim(concat_ws(' ', p.first_name, p.sur_name))
    into v_clinic, v_linked, v_patient_name
  from public.patients p
  where p.id = p_patient_id
  for update;

  if v_clinic is null then
    raise exception 'paciente % não encontrado', p_patient_id;
  end if;
  if v_linked is not null and v_linked <> v_user then
    raise exception 'este paciente já está ligado a outra conta';
  end if;
  if exists (
    select 1 from public.patients p
    where p.auth_user_id = v_user and p.id <> p_patient_id
  ) then
    raise exception 'esta conta já está ligada a outro paciente';
  end if;
  if exists (
    select 1 from public.clinic_members m
    where m.user_id = v_user
      and (m.clinic_id <> v_clinic or m.role <> 'patient')
  ) then
    raise exception 'esta conta já participa de outra clínica ou é da equipe';
  end if;

  -- o vínculo exige o perfil (criado no cadastro; garante por segurança)
  insert into public.profiles (id) values (v_user) on conflict (id) do nothing;

  insert into public.clinic_members (user_id, clinic_id, role)
  values (v_user, v_clinic, 'patient')
  on conflict (user_id, clinic_id) do update set status = 'active';

  update public.patients set auth_user_id = v_user where id = p_patient_id;

  select c.name into v_clinic_name from public.clinics c where c.id = v_clinic;
  return format('%s ligado ao paciente %s (clínica %s)', v_email, v_patient_name, v_clinic_name);
end;
$$;

-- 5. desfazer a ligação (a conta continua existindo, mas sem acesso)
create or replace function public.unlink_patient_account(p_email text)
returns text
language plpgsql
security definer
set search_path to ''
as $$
declare
  v_email text := lower(btrim(coalesce(p_email, '')));
  v_user uuid;
begin
  select u.id into v_user from auth.users u where lower(u.email) = v_email;
  if v_user is null then
    raise exception 'conta não encontrada para %', v_email;
  end if;

  update public.patients set auth_user_id = null where auth_user_id = v_user;
  delete from public.clinic_members where user_id = v_user and role = 'patient';

  return format('%s desligado', v_email);
end;
$$;

-- só o SQL Editor (dono do banco) chama as funções de ligação
revoke execute on function public.link_patient_account(text, uuid) from public, anon, authenticated;
revoke execute on function public.unlink_patient_account(text) from public, anon, authenticated;
revoke execute on function public.guard_patient_auth_user() from public, anon, authenticated;
revoke execute on function public.guard_patient_membership() from public, anon, authenticated;
