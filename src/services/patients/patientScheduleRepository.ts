import { createClient } from "@/lib/supabase/client"
import type { SchedulingForm } from "@/types"

function toDateOnly(value: Date | string | null): string | null {
  if (!value) return null

  if (typeof value === "string") {
    const isoDate = value.match(/^(\d{4}-\d{2}-\d{2})/)
    if (isoDate) return isoDate[1]

    const brazilianDate = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
    if (brazilianDate) {
      const [, day, month, year] = brazilianDate
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
    }
  }

  const date = typeof value === "string" ? new Date(value) : value
  if (Number.isNaN(date.getTime())) {
    throw new Error("Uma das datas da agenda é inválida.")
  }

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export async function savePackageSchedule(
  patientId: string,
  treatmentId: string,
  form: SchedulingForm,
  plannedSessions: number
): Promise<void> {
  if (form.serviceType !== "pacote") {
    throw new Error("O salvamento da sessão avulsa será implementado depois.")
  }

  if (!form.package.startDate) {
    throw new Error("Informe a data inicial do pacote.")
  }

  if (
    !Number.isInteger(plannedSessions) ||
    plannedSessions < 1 ||
    form.package.sessions.length !== plannedSessions
  ) {
    throw new Error("A agenda precisa conter todas as sessões do pacote.")
  }

  const packageStartDate = toDateOnly(form.package.startDate)
  const now = new Date().toISOString()
  const supabase = createClient()

  const { error: profileError } = await supabase
    .from("patient_treatment_profiles")
    .upsert(
      {
        patient_id: patientId,
        initial_start_date: toDateOnly(form.initialDateSession),
        sessions_before_current_package: form.totalSessions ?? 0,
        updated_at: now,
      },
      { onConflict: "patient_id" }
    )

  if (profileError) throw new Error(profileError.message)

  const { data: treatment, error: treatmentError } = await supabase
    .from("patient_treatments")
    .update({ package_start_date: packageStartDate, updated_at: now })
    .eq("id", treatmentId)
    .eq("patient_id", patientId)
    .select("id")
    .single()

  if (treatmentError) throw new Error(treatmentError.message)
  if (!treatment) throw new Error("Não encontrei o pacote deste paciente.")

  const sessions = form.package.sessions.map((session) => {
    const sessionDate = toDateOnly(session.fullDate)
    if (!sessionDate || !session.time) {
      throw new Error("Há uma sessão sem data ou horário.")
    }

    return {
      treatment_id: treatmentId,
      session_number: session.sessionNumber,
      session_date: sessionDate,
      session_time: session.time,
      finish_status: session.finish,
      paid_status: session.paid,
      updated_at: now,
    }
  })

  const { error: sessionsError } = await supabase
    .from("treatment_sessions")
    .upsert(sessions, { onConflict: "treatment_id,session_number" })

  if (sessionsError) throw new Error(sessionsError.message)

  const sessionNumbers = sessions.map((session) => session.session_number)
  const { data: savedSessions, error: savedSessionsError } = await supabase
    .from("treatment_sessions")
    .select("id, session_number")
    .eq("treatment_id", treatmentId)

  if (savedSessionsError) throw new Error(savedSessionsError.message)

  const obsoleteSessionIds = (savedSessions ?? [])
    .filter((session) => !sessionNumbers.includes(session.session_number))
    .map((session) => session.id)

  if (obsoleteSessionIds.length > 0) {
    const { error: deleteError } = await supabase
      .from("treatment_sessions")
      .delete()
      .in("id", obsoleteSessionIds)

    if (deleteError) throw new Error(deleteError.message)
  }
}
