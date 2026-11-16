-- Autor da evolução gravado pelo banco (não pelo navegador) e proteção do prontuário.

-- 1. Autor fixo no registro (nome e CREFITO no momento do registro) + quem editou por último
alter table public.treatment_session_evolutions
  add column author_name text,
  add column author_crefito text,
  add column updated_by uuid references auth.users (id);

update public.treatment_session_evolutions e
set author_name = nullif(btrim(concat_ws(' ', p.first_name, p.sur_name)), ''),
    author_crefito = nullif(btrim(p.crefito), '')
from public.profiles p
where p.id = e.owner_id;

-- 2. Trigger: no INSERT o autor é sempre quem está logado; no UPDATE autor,
--    sessão, clínica e criação não mudam, e registra quem editou.
create or replace function public.set_evolution_author()
returns trigger
language plpgsql
security definer
set search_path to ''
as $$
declare
  v_uid uuid := (select auth.uid());
begin
  if tg_op = 'INSERT' then
    if v_uid is not null then
      new.owner_id := v_uid;
    end if;

    select nullif(btrim(concat_ws(' ', p.first_name, p.sur_name)), ''),
           nullif(btrim(p.crefito), '')
      into new.author_name, new.author_crefito
    from public.profiles p
    where p.id = new.owner_id;

    new.created_at := now();
    new.updated_at := now();
    new.updated_by := null;
  else
    new.owner_id := old.owner_id;
    new.author_name := old.author_name;
    new.author_crefito := old.author_crefito;
    new.session_id := old.session_id;
    new.clinic_id := old.clinic_id;
    new.created_at := old.created_at;
    new.updated_at := now();
    new.updated_by := coalesce(v_uid, old.updated_by);
  end if;

  return new;
end;
$$;

revoke execute on function public.set_evolution_author() from public, anon, authenticated;

create trigger set_evolution_author
  before insert or update on public.treatment_session_evolutions
  for each row execute function public.set_evolution_author();

-- 3. Limite de tamanho do registro (evita payloads enormes)
alter table public.treatment_session_evolutions
  add constraint treatment_session_evolutions_data_size
  check (pg_column_size(data) <= 65536);

-- 4. Excluir evolução (prontuário) só o admin; a equipe lê, cria e edita
drop policy "clinic members full access" on public.treatment_session_evolutions;

create policy "staff reads evolutions" on public.treatment_session_evolutions
  for select to authenticated using (public.is_clinic_member(clinic_id));

create policy "staff creates evolutions" on public.treatment_session_evolutions
  for insert to authenticated with check (public.is_clinic_member(clinic_id));

create policy "staff updates evolutions" on public.treatment_session_evolutions
  for update to authenticated
  using (public.is_clinic_member(clinic_id))
  with check (public.is_clinic_member(clinic_id));

create policy "admin deletes evolutions" on public.treatment_session_evolutions
  for delete to authenticated using (public.is_clinic_admin(clinic_id));
