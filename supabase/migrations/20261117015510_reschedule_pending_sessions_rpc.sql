-- Remarca várias sessões pendentes numa única transação: ou todas mudam, ou nenhuma.
-- (antes eram vários UPDATEs separados; uma falha no meio deixava a agenda pela metade)
-- security invoker: a RLS de treatment_sessions continua valendo.
create or replace function public.reschedule_pending_sessions(p_updates jsonb)
returns integer
language plpgsql
security invoker
set search_path to ''
as $$
declare
  v_item jsonb;
  v_count integer := 0;
begin
  if (select auth.uid()) is null then
    raise exception 'Usuário não autenticado.' using errcode = '42501';
  end if;

  if jsonb_typeof(p_updates) <> 'array' or jsonb_array_length(p_updates) > 500 then
    raise exception 'Lista de remarcações inválida.' using errcode = '22023';
  end if;

  for v_item in select * from jsonb_array_elements(p_updates)
  loop
    update public.treatment_sessions
    set session_date = (v_item ->> 'session_date')::date,
        updated_at = now()
    where id = (v_item ->> 'id')::uuid
      and finish_status = 'pendente';

    if not found then
      raise exception 'Uma das sessões não está mais pendente e não foi alterada.'
        using errcode = 'P0002';
    end if;

    v_count := v_count + 1;
  end loop;

  return v_count;
end;
$$;

revoke execute on function public.reschedule_pending_sessions(jsonb) from public, anon;
grant execute on function public.reschedule_pending_sessions(jsonb) to authenticated;
