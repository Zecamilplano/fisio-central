alter table public.treatment_sessions
  add column is_extra boolean not null default false,
  add column origin_package_id uuid;

alter table public.treatment_sessions
  add constraint treatment_sessions_origin_package_id_fkey
  foreign key (origin_package_id)
  references public.patient_treatments (id)
  on delete set null;

create index treatment_sessions_origin_package_id_idx
  on public.treatment_sessions (origin_package_id);
