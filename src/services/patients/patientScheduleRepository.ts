import { createClient } from "@/lib/supabase/client"
import type { SchedulingForm } from "@/types"
import type { PaidKey } from "@/types"
import type { StatusSessaoKey } from "@/data/optionsSessionsData"

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
  if (form.serviceType === "sessoes") {
    const session = form.singleSession
    if (!session || !session.fullDate || !session.time.trim()) {
      throw new Error("Informe a data e o horário da sessão avulsa.")
    }

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
      .update({ updated_at: now })
      .eq("id", treatmentId)
      .eq("patient_id", patientId)
      .select("id")
      .single()
    if (treatmentError) throw new Error(treatmentError.message)
    if (!treatment) throw new Error("Não encontrei o atendimento deste paciente.")

    const { error: sessionError } = await supabase
      .from("treatment_sessions")
      .upsert(
        {
          treatment_id: treatmentId,
          session_number: 1,
          session_date: toDateOnly(session.fullDate),
          session_time: session.time,
          finish_status: session.finish,
          paid_status: session.paid,
          updated_at: now,
        },
        { onConflict: "treatment_id,session_number" }
      )
    if (sessionError) throw new Error(sessionError.message)
    return
  }

  if (form.serviceType !== "pacote") {
    throw new Error("Selecione um tipo de atendimento válido.")
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

export async function addSingleTreatmentSession(
  patientId: string,
  date: Date
): Promise<{ id: string; number: number; date: string }> {
  const supabase = createClient()
  const { data: treatment, error: treatmentError } = await supabase
    .from("patient_treatments")
    .select("id")
    .eq("patient_id", patientId)
    .eq("treatment_type", "single")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()
  if (treatmentError) throw new Error(treatmentError.message)
  if (!treatment) throw new Error("Não encontrei o atendimento avulso deste paciente.")

  const { data: existing, error: sessionsError } = await supabase
    .from("treatment_sessions")
    .select("session_number")
    .eq("treatment_id", treatment.id)
    .order("session_number", { ascending: false })
    .limit(1)
  if (sessionsError) throw new Error(sessionsError.message)

  const number = (existing?.[0]?.session_number ?? 0) + 1
  const sessionDate = toDateOnly(date)
  if (!sessionDate) throw new Error("Informe uma data válida para a sessão.")
  const { data, error } = await supabase
    .from("treatment_sessions")
    .insert({
      treatment_id: treatment.id,
      session_number: number,
      session_date: sessionDate,
      session_time: "16:00",
      finish_status: "pendente",
      paid_status: "pendente",
    })
    .select("id")
    .single()
  if (error) throw new Error(error.message)
  return { id: data.id, number, date: sessionDate }
}

export async function updateSingleTreatmentSessions(
  sessionIds: string[],
  fields: {
    finish_status?: StatusSessaoKey
    paid_status?: PaidKey
    session_date?: string
  }
): Promise<void> {
  if (sessionIds.length === 0) return
  const supabase = createClient()
  const { error } = await supabase
    .from("treatment_sessions")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .in("id", sessionIds)
  if (error) throw new Error(error.message)
}

export async function deleteSingleTreatmentSessions(
  sessionIds: string[]
): Promise<void> {
  if (sessionIds.length === 0) return
  const supabase = createClient()
  const { error } = await supabase
    .from("treatment_sessions")
    .delete()
    .in("id", sessionIds)
  if (error) throw new Error(error.message)
}
