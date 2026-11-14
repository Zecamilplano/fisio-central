-- 1. Cria perfis para usuários do Auth criados antes do trigger on_auth_user_created
insert into public.profiles (id, first_name, sur_name, crefito)
select u.id,
       u.raw_user_meta_data ->> 'first_name',
       u.raw_user_meta_data ->> 'sur_name',
       u.raw_user_meta_data ->> 'crefito'
from auth.users u
where not exists (select 1 from public.profiles p where p.id = u.id);

-- 2. create_clinic garante o perfil antes de inserir em clinic_members
create or replace function public.create_clinic(p_name text)
returns uuid
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_user uuid := auth.uid();
  v_name text;
  v_is_first boolean;
  v_clinic_id uuid;
begin
  if v_user is null then
    raise exception 'not authenticated';
  end if;

  v_name := btrim(regexp_replace(coalesce(p_name, ''), '\s+', ' ', 'g'));
  if char_length(v_name) < 3 or char_length(v_name) > 100 then
    raise exception 'invalid clinic name';
  end if;

  v_is_first := not exists (select 1 from public.clinics);

  if not v_is_first and not exists (
    select 1 from public.profiles where id = v_user and is_platform_admin
  ) then
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

  if v_is_first then
    update public.profiles set is_platform_admin = true where id = v_user;
  end if;

  return v_clinic_id;
end;
$function$;
