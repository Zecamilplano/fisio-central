create or replace function public.delete_patient_permanently(p_patient_id uuid)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $function$
begin
  if (select auth.uid()) is null then
    raise exception 'Usuário não autenticado.' using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.patients as patient
    where patient.id = p_patient_id
      and patient.owner_id = (select auth.uid())
  ) then
    raise exception 'Paciente não encontrado.' using errcode = 'P0002';
  end if;

  delete from public.treatment_session_evolutions as evolution
  using public.treatment_sessions as session,
        public.patient_treatments as treatment
  where evolution.session_id = session.id
    and session.treatment_id = treatment.id
    and treatment.patient_id = p_patient_id
    and treatment.owner_id = (select auth.uid())
    and session.owner_id = (select auth.uid())
    and evolution.owner_id = (select auth.uid());

  delete from public.treatment_sessions as session
  using public.patient_treatments as treatment
  where session.treatment_id = treatment.id
    and treatment.patient_id = p_patient_id
    and treatment.owner_id = (select auth.uid())
    and session.owner_id = (select auth.uid());

  delete from public.patient_treatment_profiles as treatment_profile
  where treatment_profile.patient_id = p_patient_id
    and treatment_profile.owner_id = (select auth.uid());

  delete from public.patient_treatments as treatment
  where treatment.patient_id = p_patient_id
    and treatment.owner_id = (select auth.uid());

  delete from public.patients as patient
  where patient.id = p_patient_id
    and patient.owner_id = (select auth.uid());

  if not found then
    raise exception 'Não foi possível excluir o paciente.' using errcode = 'P0002';
  end if;

  return true;
end;
$function$;

revoke all on function public.delete_patient_permanently(uuid) from public, anon;
grant execute on function public.delete_patient_permanently(uuid) to authenticated;
