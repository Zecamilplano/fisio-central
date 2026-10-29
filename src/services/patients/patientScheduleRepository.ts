import { createClient } from "@/lib/supabase/client"
import type { DayOfWeek, PaidKey, SchedulingForm } from "@/types"
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
  const sessionsBeforeCurrentPackage = Number(form.totalSessions ?? 0)
  if (
    !Number.isSafeInteger(sessionsBeforeCurrentPackage) ||
    sessionsBeforeCurrentPackage < 0
  ) {
    throw new Error("Informe um número inteiro válido para as sessões já realizadas.")
  }

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
          sessions_before_current_package: sessionsBeforeCurrentPackage,
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
        sessions_before_current_package: sessionsBeforeCurrentPackage,
        updated_at: now,
      },
      { onConflict: "patient_id" }
    )

  if (profileError) throw new Error(profileError.message)

  const { data: treatment, error: treatmentError } = await supabase
    .from("patient_treatments")
    .update({
      package_start_date: packageStartDate,
      fixed_week_days: Object.entries(form.package.selectedDays)
        .filter(([, selected]) => selected)
        .map(([day]) => day as DayOfWeek),
      updated_at: now,
    })
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
  date: Date,
  originPackageId?: string
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
  if (!treatment) {
    throw new Error("Não encontrei o atendimento avulso deste paciente.")
  }

  return addTreatmentSession(treatment.id, date, "16:00", originPackageId)
}

export async function addTreatmentSession(
  treatmentId: string,
  date: Date,
  time = "16:00",
  originPackageId?: string
): Promise<{ id: string; number: number; date: string }> {
  const supabase = createClient()

  const { data: existing, error: sessionsError } = await supabase
    .from("treatment_sessions")
    .select("session_number")
    .eq("treatment_id", treatmentId)
    .order("session_number", { ascending: false })
    .limit(1)
  if (sessionsError) throw new Error(sessionsError.message)

  const number = (existing?.[0]?.session_number ?? 0) + 1
  const sessionDate = toDateOnly(date)
  if (!sessionDate) throw new Error("Informe uma data válida para a sessão.")
  const { data, error } = await supabase
    .from("treatment_sessions")
    .insert({
      treatment_id: treatmentId,
      is_extra: Boolean(originPackageId),
      origin_package_id: originPackageId ?? null,
      session_number: number,
      session_date: sessionDate,
      session_time: time,
      finish_status: "pendente",
      paid_status: "pendente",
      updated_at: new Date().toISOString(),
    })
    .select("id")
    .single()
  if (error) throw new Error(error.message)
  return { id: data.id, number, date: sessionDate }
}

export async function addPackageSession(
  treatmentId: string,
  date: Date,
  time = "16:00"
): Promise<{ id: string; number: number; date: string }> {
  const supabase = createClient()
  const { data: treatment, error: treatmentError } = await supabase
    .from("patient_treatments")
    .select("planned_sessions, treatment_type")
    .eq("id", treatmentId)
    .single()
  if (treatmentError) throw new Error(treatmentError.message)
  if (treatment.treatment_type !== "package") {
    throw new Error("O atendimento selecionado não é um pacote.")
  }

  const { count, error: sessionsError } = await supabase
    .from("treatment_sessions")
    .select("id", { count: "exact", head: true })
    .eq("treatment_id", treatmentId)
  if (sessionsError) throw new Error(sessionsError.message)
  if ((count ?? 0) >= treatment.planned_sessions) {
    throw new Error("Este pacote não tem sessões excluídas para repor.")
  }

  return addTreatmentSession(treatmentId, date, time)
}

export async function addStandaloneSessionToPatient(
  patientId: string,
  date: Date,
  pricePerSession: number,
  time = "16:00",
  originPackageId?: string
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

  let treatmentId = treatment?.id
  let createdTreatmentRow = false
  if (!treatmentId) {
    const { data: newTreatment, error: createError } = await supabase
      .from("patient_treatments")
      .insert({
        patient_id: patientId,
        treatment_type: "single",
        price_per_session: pricePerSession,
        planned_sessions: 1,
        status: "in_progress",
      })
      .select("id")
      .single()
    if (createError) throw new Error(createError.message)
    treatmentId = newTreatment.id
    createdTreatmentRow = true
  }

  try {
    return await addTreatmentSession(treatmentId, date, time, originPackageId)
  } catch (error) {
    if (createdTreatmentRow) {
      const { error: cleanupError } = await supabase
        .from("patient_treatments")
        .delete()
        .eq("id", treatmentId)
      if (cleanupError) {
        const originalMessage =
          error instanceof Error
            ? error.message
            : "Falha ao adicionar a sessão."
        throw new Error(
          `${originalMessage} Não foi possível remover o atendimento vazio: ${cleanupError.message}`
        )
      }
    }
    throw error
  }
}

export async function createNextPackageTreatment(data: {
  patientId: string
  previousTreatmentId: string
  startDate: Date
  pricePerSession: number
  totalSessions: number
  fixedWeekDays: DayOfWeek[]
  sessions: Array<{ date: Date; time: string }>
}): Promise<{ id: string; sessions: Array<{ id: string; number: number; date: string; time: string }> }> {
  const supabase = createClient()
  const { data: pendingExtraSession, error: pendingExtraError } = await supabase
    .from("treatment_sessions")
    .select("id")
    .eq("origin_package_id", data.previousTreatmentId)
    .eq("is_extra", true)
    .neq("finish_status", "realizado")
    .limit(1)
    .maybeSingle()
  if (pendingExtraError) throw new Error(pendingExtraError.message)
  if (pendingExtraSession) {
    throw new Error(
      "Conclua a sessão avulsa extra antes de seguir com o próximo pacote."
    )
  }

  if (!Number.isInteger(data.totalSessions) || data.totalSessions < 1) {
    throw new Error("Informe uma quantidade válida de sessões para o pacote.")
  }
  if (data.sessions.length !== data.totalSessions) {
    throw new Error("A agenda precisa conter todas as sessões do pacote.")
  }
  const normalizedSessions = data.sessions.map((session) => {
    const sessionDate = toDateOnly(session.date)
    if (!sessionDate || !session.time.trim()) {
      throw new Error("Informe data e horário para todas as sessões do pacote.")
    }
    return { ...session, date: sessionDate }
  })

  const { data: treatment, error: createError } = await supabase
    .from("patient_treatments")
    .insert({
      patient_id: data.patientId,
      treatment_type: "package",
      price_per_session: data.pricePerSession,
      planned_sessions: data.totalSessions,
      fixed_week_days: data.fixedWeekDays,
      package_start_date: toDateOnly(data.startDate),
      status: "in_progress",
    })
    .select("id")
    .single()
  if (createError) throw new Error(createError.message)

  const treatmentId = treatment.id
  const sessionRows = normalizedSessions.map((session, index) => ({
    treatment_id: treatmentId,
    session_number: index + 1,
    session_date: session.date,
    session_time: session.time,
    finish_status: "pendente",
    paid_status: "pendente",
  }))

  const { data: savedSessions, error: sessionsError } = await supabase
    .from("treatment_sessions")
    .insert(sessionRows)
    .select("id, session_number, session_date, session_time")
  if (sessionsError || savedSessions?.length !== data.totalSessions) {
    const { error: cleanupError } = await supabase
      .from("patient_treatments")
      .delete()
      .eq("id", treatmentId)
    if (cleanupError) {
      const originalMessage =
        sessionsError?.message ?? "O pacote não gravou todas as sessões."
      throw new Error(
        `${originalMessage} Falha ao remover o pacote incompleto: ${cleanupError.message}`
      )
    }
    throw new Error(sessionsError?.message ?? "O pacote não gravou todas as sessões.")
  }

  const { error: previousTreatmentError } = await supabase
    .from("patient_treatments")
    .update({ status: "completed", updated_at: new Date().toISOString() })
    .eq("id", data.previousTreatmentId)
    .eq("patient_id", data.patientId)
    .select("id")
    .single()
  if (previousTreatmentError) {
    const sessionIds = (savedSessions ?? []).map((session) => session.id)
    if (sessionIds.length > 0) {
      const { error: sessionCleanupError } = await supabase
        .from("treatment_sessions")
        .delete()
        .in("id", sessionIds)
      if (sessionCleanupError) {
        throw new Error(
          `${previousTreatmentError.message} Falha ao remover as novas sessões: ${sessionCleanupError.message}`
        )
      }
    }
    const { error: treatmentCleanupError } = await supabase
      .from("patient_treatments")
      .delete()
      .eq("id", treatmentId)
    if (treatmentCleanupError) {
      throw new Error(
        `${previousTreatmentError.message} Falha ao remover o pacote incompleto: ${treatmentCleanupError.message}`
      )
    }
    throw new Error(previousTreatmentError.message)
  }

  return {
    id: treatmentId,
    sessions: (savedSessions ?? [])
      .sort((a, b) => a.session_number - b.session_number)
      .map((session) => ({
        id: session.id,
        number: session.session_number,
        date: session.session_date,
        time: session.session_time.slice(0, 5),
      })),
  }
}

export async function updateTreatmentSessions(
  sessionIds: string[],
  fields: {
    finish_status?: StatusSessaoKey
    paid_status?: PaidKey
    session_date?: string
    session_time?: string
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

export async function updateTreatmentSessionSchedule(
  updates: Array<{ id: string; session_date: string }>
): Promise<void> {
  const supabase = createClient()
  for (const { id, session_date } of updates) {
    const { data, error } = await supabase
      .from("treatment_sessions")
      .update({ session_date, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("finish_status", "pendente")
      .select("id")
      .maybeSingle()
    if (error) throw new Error(error.message)
    if (!data) {
      throw new Error("Uma das sessões não está mais pendente e não foi alterada.")
    }
  }
}

export async function updatePendingTreatmentSessionTime(
  sessionId: string,
  session_time: string
): Promise<void> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("treatment_sessions")
    .update({ session_time, updated_at: new Date().toISOString() })
    .eq("id", sessionId)
    .eq("finish_status", "pendente")
    .select("id")
    .maybeSingle()
  if (error) throw new Error(error.message)
  if (!data) throw new Error("Esta sessão não está mais pendente.")
}

export async function updateTreatmentPackageWeekDays(
  treatmentId: string,
  fixedWeekDays: DayOfWeek[]
): Promise<void> {
  const allowedDays: DayOfWeek[] = [
    "Segunda",
    "Terça",
    "Quarta",
    "Quinta",
    "Sexta",
    "Sábado",
  ]
  if (
    fixedWeekDays.length === 0 ||
    fixedWeekDays.some((day) => !allowedDays.includes(day)) ||
    new Set(fixedWeekDays).size !== fixedWeekDays.length
  ) {
    throw new Error("Selecione dias da semana válidos para o pacote.")
  }
  const supabase = createClient()
  const { data: pendingSession, error: pendingSessionError } = await supabase
    .from("treatment_sessions")
    .select("id")
    .eq("treatment_id", treatmentId)
    .eq("finish_status", "pendente")
    .limit(1)
    .maybeSingle()
  if (pendingSessionError) throw new Error(pendingSessionError.message)
  if (!pendingSession) {
    throw new Error("Os dias só podem ser alterados enquanto houver sessões pendentes.")
  }

  const { data, error } = await supabase
    .from("patient_treatments")
    .update({
      fixed_week_days: fixedWeekDays,
      updated_at: new Date().toISOString(),
    })
    .eq("id", treatmentId)
    .eq("treatment_type", "package")
    .select("id")
    .maybeSingle()
  if (error) throw new Error(error.message)
  if (!data) throw new Error("Não encontrei o pacote para atualizar os dias.")
}

export async function deleteTreatmentSessions(
  sessionIds: string[]
): Promise<void> {
  if (sessionIds.length === 0) return
  const supabase = createClient()

  const { data: evolutions, error: evolutionsError } = await supabase
    .from("treatment_session_evolutions")
    .select("session_id")
    .in("session_id", sessionIds)
  if (evolutionsError) throw new Error(evolutionsError.message)
  if (evolutions?.length) {
    throw new Error(
      "Esta sessão tem uma evolução clínica e não pode ser excluída."
    )
  }

  const { data: sessions, error: lookupError } = await supabase
    .from("treatment_sessions")
    .select("id, treatment_id, session_number")
    .in("id", sessionIds)
  if (lookupError) throw new Error(lookupError.message)

  const { error } = await supabase
    .from("treatment_sessions")
    .delete()
    .in("id", sessionIds)
  if (error) throw new Error(error.message)

  const treatmentIds = [
    ...new Set((sessions ?? []).map((session) => session.treatment_id)),
  ]
  for (const treatmentId of treatmentIds) {
    const { data: remaining, error: remainingError } = await supabase
      .from("treatment_sessions")
      .select("id, session_number")
      .eq("treatment_id", treatmentId)
      .order("session_number", { ascending: true })
    if (remainingError) throw new Error(remainingError.message)

    const rows = remaining ?? []
    const offset =
      Math.max(0, ...rows.map((row) => row.session_number)) + rows.length + 1
    const staged = await Promise.all(
      rows.map((row, index) =>
        supabase
          .from("treatment_sessions")
          .update({ session_number: offset + index })
          .eq("id", row.id)
      )
    )
    const stageError = staged.find((result) => result.error)?.error
    if (stageError) throw new Error(stageError.message)

    const renumbered = await Promise.all(
      rows.map((row, index) =>
        supabase
          .from("treatment_sessions")
          .update({
            session_number: index + 1,
            updated_at: new Date().toISOString(),
          })
          .eq("id", row.id)
      )
    )
    const renumberError = renumbered.find((result) => result.error)?.error
    if (renumberError) throw new Error(renumberError.message)
  }
}
