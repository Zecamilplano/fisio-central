-- auth.uid() dentro de (select ...) é avaliado uma vez por consulta, não por linha.
alter policy "paciente le o proprio registro" on public.patients
  using (auth_user_id = (select auth.uid()));

alter policy "paciente le os proprios tratamentos" on public.patient_treatments
  using (exists (
    select 1 from public.patients p
    where p.id = patient_treatments.patient_id
      and p.auth_user_id = (select auth.uid())
  ));

alter policy "paciente le as proprias sessoes" on public.treatment_sessions
  using (exists (
    select 1
    from public.patient_treatments t
    join public.patients p on p.id = t.patient_id
    where t.id = treatment_sessions.treatment_id
      and p.auth_user_id = (select auth.uid())
  ));

create index if not exists patients_auth_user_id_idx
  on public.patients (auth_user_id)
  where auth_user_id is not null;
