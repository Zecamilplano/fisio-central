create table public.treatment_session_evolutions (
  session_id uuid primary key
    references public.treatment_sessions (id) on delete restrict,
  owner_id uuid not null default auth.uid()
    references auth.users (id) on delete cascade,
  data jsonb not null
    check (jsonb_typeof(data) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.treatment_session_evolutions enable row level security;

grant select, insert, update, delete
  on public.treatment_session_evolutions to authenticated;

create policy "Users can read their session evolutions"
  on public.treatment_session_evolutions
  for select to authenticated
  using (
    owner_id = (select auth.uid())
    and exists (
      select 1
      from public.treatment_sessions as session
      where session.id = session_id
        and session.owner_id = (select auth.uid())
    )
  );

create policy "Users can create their session evolutions"
  on public.treatment_session_evolutions
  for insert to authenticated
  with check (
    owner_id = (select auth.uid())
    and exists (
      select 1
      from public.treatment_sessions as session
      where session.id = session_id
        and session.owner_id = (select auth.uid())
    )
  );

create policy "Users can update their session evolutions"
  on public.treatment_session_evolutions
  for update to authenticated
  using (
    owner_id = (select auth.uid())
    and exists (
      select 1
      from public.treatment_sessions as session
      where session.id = session_id
        and session.owner_id = (select auth.uid())
    )
  )
  with check (
    owner_id = (select auth.uid())
    and exists (
      select 1
      from public.treatment_sessions as session
      where session.id = session_id
        and session.owner_id = (select auth.uid())
    )
  );

create policy "Users can delete their session evolutions"
  on public.treatment_session_evolutions
  for delete to authenticated
  using (
    owner_id = (select auth.uid())
    and exists (
      select 1
      from public.treatment_sessions as session
      where session.id = session_id
        and session.owner_id = (select auth.uid())
    )
  );

create index treatment_session_evolutions_owner_id_idx
  on public.treatment_session_evolutions (owner_id);
