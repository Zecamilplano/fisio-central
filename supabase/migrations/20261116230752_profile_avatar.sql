-- Foto de perfil do profissional/usuário.
-- Arquivo em profile-photos/<user_id>/<arquivo>; o caminho fica em profiles.avatar_path.

alter table public.profiles
  add column avatar_path text
  check (avatar_path is null or avatar_path like id::text || '/%');

grant update (avatar_path) on public.profiles to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('profile-photos', 'profile-photos', false, 1048576,
        array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- dono da pasta = usuário logado
create or replace function public.is_own_profile_photo(p_name text)
returns boolean
language sql
stable
set search_path to ''
as $$
  select (storage.foldername(p_name))[1] = (select auth.uid())::text;
$$;

-- pode ver: a própria foto ou a de alguém da mesma clínica (equipe)
create or replace function public.can_read_profile_photo(p_name text)
returns boolean
language sql
stable
security definer
set search_path to ''
as $$
  select (storage.foldername(p_name))[1] = (select auth.uid())::text
      or exists (
        select 1
        from public.clinic_members me
        join public.clinic_members other on other.clinic_id = me.clinic_id
        where me.user_id = (select auth.uid())
          and me.status = 'active'
          and me.role <> 'patient'
          and other.user_id::text = (storage.foldername(p_name))[1]
      );
$$;

revoke execute on function public.is_own_profile_photo(text) from public, anon;
revoke execute on function public.can_read_profile_photo(text) from public, anon;
grant execute on function public.is_own_profile_photo(text) to authenticated;
grant execute on function public.can_read_profile_photo(text) to authenticated;

create policy "profile photo read" on storage.objects
  for select to authenticated
  using (bucket_id = 'profile-photos' and public.can_read_profile_photo(name));

create policy "profile photo insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'profile-photos' and public.is_own_profile_photo(name));

create policy "profile photo update" on storage.objects
  for update to authenticated
  using (bucket_id = 'profile-photos' and public.is_own_profile_photo(name))
  with check (bucket_id = 'profile-photos' and public.is_own_profile_photo(name));

create policy "profile photo delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'profile-photos' and public.is_own_profile_photo(name));
