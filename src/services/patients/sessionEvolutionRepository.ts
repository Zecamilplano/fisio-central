import { assertCanEdit } from "@/lib/clinic/assertCanEdit"
import type { EvolutionSaveData } from "@/components/patient/evolution"
import { createClient } from "@/lib/supabase/client"
import { getClinicId } from "@/lib/clinic/getClinicId"

// Profissional que registrou a evolução. Preenchido pelo banco (trigger
// set_evolution_author) a partir do perfil de quem estava logado; o app só lê.
export type EvolutionAuthor = {
  title: string | null // "Dr.", "Dra." ou null (sem título)
  name: string | null
  crefito: string | null
}

type SessionEvolutionRow = {
  session_id: string
  data: EvolutionSaveData
  author_title: string | null
  author_name: string | null
  author_crefito: string | null
}

export async function getSessionEvolutions(): Promise<{
  evolutions: Record<string, EvolutionSaveData>
  authors: Record<string, EvolutionAuthor>
}> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("treatment_session_evolutions")
    .select("session_id, data, author_title, author_name, author_crefito")
    .eq("clinic_id", getClinicId()) // defesa extra além da RLS

  if (error) throw new Error(error.message)

  const rows = (data ?? []) as SessionEvolutionRow[]
  return {
    evolutions: Object.fromEntries(rows.map((row) => [row.session_id, row.data])),
    authors: Object.fromEntries(
      rows.map((row) => [
        row.session_id,
        {
          title: row.author_title,
          name: row.author_name,
          crefito: row.author_crefito,
        },
      ])
    ),
  }
}

export async function saveSessionEvolution(
  sessionId: string,
  evolution: EvolutionSaveData
): Promise<EvolutionAuthor> {
  assertCanEdit()
  const supabase = createClient()
  // autor, datas e quem editou são definidos pelo banco; não enviar daqui
  const { data, error } = await supabase
    .from("treatment_session_evolutions")
    .upsert(
      {
        session_id: sessionId,
        clinic_id: getClinicId(),
        data: evolution,
      },
      { onConflict: "session_id" }
    )
    .select("author_title, author_name, author_crefito")
    .single()

  if (error) throw new Error(error.message)

  return {
    title: data.author_title,
    name: data.author_name,
    crefito: data.author_crefito,
  }
}
