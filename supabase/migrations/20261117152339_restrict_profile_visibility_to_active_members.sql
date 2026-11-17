-- Perfis e fotos de perfil de outro usuário só ficam visíveis para a equipe
-- quando esse usuário é membro ATIVO da mesma clínica. Antes, um vínculo
-- inativo/pendente (ex.: inserido por um admin) já liberava a leitura.
-- O próprio usuário continua lendo o seu perfil/foto pelas outras regras.
-- Os nomes nas evoluções são cópias gravadas na própria evolução, então
-- desativar um membro não apaga a autoria dos registros antigos.

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
      and other.status = 'active'
  );
$$;

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
          and other.status = 'active'
          and other.user_id::text = (storage.foldername(p_name))[1]
      );
$$;
