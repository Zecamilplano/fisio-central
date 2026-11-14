-- =============================================================
-- Papéis da clínica e acesso de admin
-- 1. is_clinic_member passa a valer só para a equipe (role <> 'patient')
-- 2. nova função is_clinic_admin
-- 3. admin edita a clínica e gerencia clinic_members
-- 4. equipe vê os membros e perfis da própria clínica
-- 5. usuário edita o próprio perfil (sem poder virar platform admin)
-- 6. delete_patient_permanently checa a clínica, não o owner_id
-- 7. remove FKs compostas com owner_id (bloqueavam multiusuário)
-- 8. funções auxiliares não executáveis por anon/public
-- =============================================================

-- 1. Equipe da clínica (exclui pacientes)
create or replace function public.is_clinic_member(p_clinic_id uuid)
returns boolean
language sql
stable
security definer
set search_path to ''
as $$
  select exists (
    select 1 from public.clinic_members m
    where m.clinic_id = p_clinic_id
      and m.user_id = (select auth.uid())
      and m.status = 'active'
      and m.role <> 'patient'
  );
$$;

-- 2. Admin da clínica
create or replace function public.is_clinic_admin(p_clinic_id uuid)
returns boolean
language sql
stable
security definer
set search_path to ''
as $$
  select exists (
    select 1 from public.clinic_members m
    where m.clinic_id = p_clinic_id
      and m.user_id = (select auth.uid())
      and m.status = 'active'
      and m.role = 'admin'
  );
$$;

-- Fotos: só a equipe da clínica
create or replace function public.is_member_of_photo_clinic(p_name text)
returns boolean
language sql
stable
security definer
set search_path to ''
as $$
  select exists (
    select 1 from public.clinic_members m
    where m.clinic_id::text = (storage.foldername(p_name))[1]
      and m.user_id = (select auth.uid())
      and m.status = 'active'
      and m.role <> 'patient'
  );
$$;

-- Usuário compartilha alguma clínica (como equipe) com outro usuário
create or replace function public.shares_clinic_with(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path to ''
as $$
  select exists (
    select 1
    from public.clinic_members me
    join public.clinic_members other on other.clinic_id = me.clinic_id
    where me.user_id = (select auth.uid())
      and me.status = 'active'
      and me.role <> 'patient'
      and other.user_id = p_user_id
  );
$$;

-- 3. Clínica: admin edita
create policy "admin updates clinic"
  on public.clinics
  for update to authenticated
  using (public.is_clinic_admin(id))
  with check (public.is_clinic_admin(id));

-- 3/4. clinic_members
create policy "staff reads clinic members"
  on public.clinic_members
  for select to authenticated
  using (public.is_clinic_member(clinic_id));

create policy "admin adds clinic members"
  on public.clinic_members
  for insert to authenticated
  with check (public.is_clinic_admin(clinic_id));

-- admin não altera nem remove o próprio vínculo (evita ficar sem admin)
create policy "admin updates clinic members"
  on public.clinic_members
  for update to authenticated
  using (public.is_clinic_admin(clinic_id) and user_id <> (select auth.uid()))
  with check (public.is_clinic_admin(clinic_id) and user_id <> (select auth.uid()));

create policy "admin removes clinic members"
  on public.clinic_members
  for delete to authenticated
  using (public.is_clinic_admin(clinic_id) and user_id <> (select auth.uid()));

-- 4/5. profiles
create policy "staff reads clinic profiles"
  on public.profiles
  for select to authenticated
  using (public.shares_clinic_with(id));

create policy "update own profile"
  on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- só nome, sobrenome e CREFITO são editáveis pelo usuário
revoke insert, update, delete on public.profiles from anon, authenticated;
grant update (first_name, sur_name, crefito, updated_at) on public.profiles to authenticated;

-- clinics e clinic_members: anon não precisa de nada
revoke all on public.clinics, public.clinic_members, public.profiles from anon;

-- 6. Exclusão permanente por clínica
create or replace function public.delete_patient_permanently(p_patient_id uuid)
returns boolean
language plpgsql
security invoker
set search_path to ''
as $function$
declare
  v_clinic_id uuid;
begin
  if (select auth.uid()) is null then
    raise exception 'Usuário não autenticado.' using errcode = '42501';
  end if;

  select patient.clinic_id into v_clinic_id
  from public.patients as patient
  where patient.id = p_patient_id;

  if v_clinic_id is null or not public.is_clinic_member(v_clinic_id) then
    raise exception 'Paciente não encontrado.' using errcode = 'P0002';
  end if;

  delete from public.treatment_session_evolutions as evolution
  using public.treatment_sessions as session,
        public.patient_treatments as treatment
  where evolution.session_id = session.id
    and session.treatment_id = treatment.id
    and treatment.patient_id = p_patient_id;

  delete from public.treatment_sessions as session
  using public.patient_treatments as treatment
  where session.treatment_id = treatment.id
    and treatment.patient_id = p_patient_id;

  delete from public.patient_treatment_profiles as treatment_profile
  where treatment_profile.patient_id = p_patient_id;

  delete from public.patient_treatments as treatment
  where treatment.patient_id = p_patient_id;

  delete from public.patients as patient
  where patient.id = p_patient_id;

  if not found then
    raise exception 'Não foi possível excluir o paciente.' using errcode = 'P0002';
  end if;

  return true;
end;
$function$;

-- 7. owner_id vira só "quem criou"; a integridade fica nas FKs com clinic_id
alter table public.patient_treatment_profiles
  drop constraint if exists patient_treatment_profiles_patient_owner_fkey;
alter table public.patient_treatments
  drop constraint if exists patient_treatments_patient_owner_fkey;
alter table public.treatment_sessions
  drop constraint if exists treatment_sessions_treatment_owner_fkey;

-- 8. Permissões das funções
revoke execute on function public.is_clinic_member(uuid) from public, anon;
revoke execute on function public.is_clinic_admin(uuid) from public, anon;
revoke execute on function public.is_member_of_photo_clinic(text) from public, anon;
revoke execute on function public.shares_clinic_with(uuid) from public, anon;
revoke execute on function public.create_clinic(text) from public, anon;
revoke execute on function public.delete_patient_permanently(uuid) from public, anon;
grant execute on function public.is_clinic_member(uuid) to authenticated;
grant execute on function public.is_clinic_admin(uuid) to authenticated;
grant execute on function public.is_member_of_photo_clinic(text) to authenticated;
grant execute on function public.shares_clinic_with(uuid) to authenticated;
grant execute on function public.create_clinic(text) to authenticated;
grant execute on function public.delete_patient_permanently(uuid) to authenticated;
