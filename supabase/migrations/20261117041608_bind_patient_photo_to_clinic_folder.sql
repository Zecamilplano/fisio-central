-- Auditoria run-1, pista 4: a leitura da foto pelo paciente não estava presa à pasta da clínica.
-- 1) is_own_patient_photo passa a exigir que a pasta do objeto seja a clínica do paciente.
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
      and p.clinic_id::text = (storage.foldername(p_name))[1]
  );
$$;

-- 2) photo_path só pode apontar para a pasta da própria clínica (mesma ideia do avatar_path).
alter table public.patients
  add constraint patients_photo_path_in_clinic_folder
  check (photo_path is null or photo_path like clinic_id::text || '/%');
