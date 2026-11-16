-- Forma de tratamento do profissional (Dr. / Dra. / sem título) no perfil
-- e gravada junto com o autor de cada evolução.

-- 1. Perfil
alter table public.profiles
  add column title text check (title in ('Dr.', 'Dra.'));

-- o próprio usuário pode alterar o título (além de nome, sobrenome e CREFITO)
grant update (title) on public.profiles to authenticated;

-- 2. Novo usuário: lê o título dos metadados do cadastro (só valores válidos)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path to ''
as $$
begin
  insert into public.profiles (id, first_name, sur_name, crefito, title)
  values (
    new.id,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'sur_name',
    new.raw_user_meta_data ->> 'crefito',
    case
      when new.raw_user_meta_data ->> 'title' in ('Dr.', 'Dra.')
        then new.raw_user_meta_data ->> 'title'
    end
  );
  return new;
end;
$$;

-- 3. Evolução: título fixo junto com o nome do autor
alter table public.treatment_session_evolutions
  add column author_title text;

update public.treatment_session_evolutions e
set author_title = p.title
from public.profiles p
where p.id = e.owner_id;

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
           nullif(btrim(p.crefito), ''),
           p.title
      into new.author_name, new.author_crefito, new.author_title
    from public.profiles p
    where p.id = new.owner_id;

    new.created_at := now();
    new.updated_at := now();
    new.updated_by := null;
  else
    new.owner_id := old.owner_id;
    new.author_name := old.author_name;
    new.author_crefito := old.author_crefito;
    new.author_title := old.author_title;
    new.session_id := old.session_id;
    new.clinic_id := old.clinic_id;
    new.created_at := old.created_at;
    new.updated_at := now();
    new.updated_by := coalesce(v_uid, old.updated_by);
  end if;

  return new;
end;
$$;
