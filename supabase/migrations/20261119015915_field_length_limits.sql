-- Limites de tamanho e de valores no banco (não dá para confiar só no frontend:
-- a API do Supabase pode ser chamada direto). Os valores são os mesmos de
-- src/data/fieldLimits.ts; ao mudar um, mude o outro.

alter table public.patients
  add constraint patients_first_name_length check (char_length(first_name) <= 60),
  add constraint patients_sur_name_length check (char_length(sur_name) <= 80),
  add constraint patients_telephone_length check (telephone is null or char_length(telephone) <= 20),
  add constraint patients_street_length check (street is null or char_length(street) <= 120),
  add constraint patients_neighborhood_length check (neighborhood is null or char_length(neighborhood) <= 80),
  add constraint patients_reference_house_length check (reference_house is null or char_length(reference_house) <= 200),
  add constraint patients_address_number_range check (address_number is null or address_number between 1 and 999999);

alter table public.profiles
  add constraint profiles_first_name_length check (first_name is null or char_length(first_name) <= 60),
  add constraint profiles_sur_name_length check (sur_name is null or char_length(sur_name) <= 80),
  add constraint profiles_crefito_length check (crefito is null or char_length(crefito) <= 30);

alter table public.clinics
  add constraint clinics_name_length check (char_length(btrim(name)) between 3 and 100);

alter table public.treatment_sessions
  add constraint treatment_sessions_finish_status_check
    check (finish_status in ('pendente', 'realizado', 'cancelado')),
  add constraint treatment_sessions_paid_status_check
    check (paid_status in ('pendente', 'realizado', 'cancelado'));

alter table public.patient_treatments
  add constraint patient_treatments_planned_sessions_max check (planned_sessions <= 100),
  add constraint patient_treatments_price_per_session_max check (price_per_session <= 999999.99);

alter table public.patient_treatment_profiles
  add constraint patient_treatment_profiles_sessions_before_max
    check (sessions_before_current_package <= 10000);

alter table public.signup_allowlist
  add constraint signup_allowlist_email_length check (char_length(email) <= 254),
  add constraint signup_allowlist_note_length check (note is null or char_length(note) <= 200);
