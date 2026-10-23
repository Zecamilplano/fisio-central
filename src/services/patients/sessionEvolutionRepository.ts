import type { EvolutionSaveData } from "@/components/patient/evolution"
import { createClient } from "@/lib/supabase/client"

type SessionEvolutionRow = {
  session_id: string
  data: EvolutionSaveData
}

export async function getSessionEvolutions(): Promise<
  Record<string, EvolutionSaveData>
> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("treatment_session_evolutions")
    .select("session_id, data")

  if (error) throw new Error(error.message)

  return Object.fromEntries(
    ((data ?? []) as SessionEvolutionRow[]).map((row) => [
      row.session_id,
      row.data,
    ])
  )
}

export async function saveSessionEvolution(
  sessionId: string,
  evolution: EvolutionSaveData
): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from("treatment_session_evolutions")
    .upsert(
      {
        session_id: sessionId,
        data: evolution,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "session_id" }
    )

  if (error) throw new Error(error.message)
}
