import { useFisioStore } from "@/store/fisio/fisioStore"
import type { DayOfWeek, ListPatient } from "@/types"
import { addDays, format, getDay, parseISO } from "date-fns"
import {
  updatePendingTreatmentSessionTime,
  updateTreatmentPackageWeekDays,
  updateTreatmentSessionSchedule,
} from "@/services/patients/patientScheduleRepository"
import { toast } from "react-toastify"

const weekDayMap: Record<DayOfWeek, number> = {
  Segunda: 1,
  Terça: 2,
  Quarta: 3,
  Quinta: 4,
  Sexta: 5,
  Sábado: 6,
}

type UseSessionSchedulingProps = {
  patient: ListPatient
}

type ScheduleUpdate = { id: string; session_date: string }

export function useSessionScheduling({ patient }: UseSessionSchedulingProps) {
  const rescheduleSessions = useFisioStore((state) => state.rescheduleSessions)
  const changeSessionTimeInStore = useFisioStore(
    (state) => state.changeSessionTime
  )
  const updatePackageWeekDaysInStore = useFisioStore(
    (state) => state.updatePackageWeekDays
  )

  function getNextSessionDate(lastDate: Date, weekDays: number[]) {
    let nextDate = addDays(lastDate, 1)

    while (!weekDays.includes(getDay(nextDate))) {
      nextDate = addDays(nextDate, 1)
    }

    return nextDate
  }

  function getNextPackageDate(lastDate: Date, fixedWeekDays: DayOfWeek[]) {
    const allowedDays = fixedWeekDays.map((day) => weekDayMap[day])
    if (allowedDays.length === 0) throw new Error("Selecione os dias do pacote.")

    let nextDate = addDays(lastDate, 1)
    while (!allowedDays.includes(getDay(nextDate))) {
      nextDate = addDays(nextDate, 1)
    }
    return nextDate
  }

  function getFirstPackageDate(startDate: Date, fixedWeekDays: DayOfWeek[]) {
    const allowedDays = fixedWeekDays.map((day) => weekDayMap[day])
    if (allowedDays.length === 0) throw new Error("Selecione os dias do pacote.")

    let firstDate = new Date(startDate)
    while (!allowedDays.includes(getDay(firstDate))) {
      firstDate = addDays(firstDate, 1)
    }
    return firstDate
  }

  function maxDate(firstDate: Date | undefined, secondDate: Date) {
    return !firstDate || secondDate > firstDate ? secondDate : firstDate
  }

  async function persistSchedule(updates: ScheduleUpdate[]) {
    const changedUpdates = updates.filter((update) => {
      const current = patient.session.find((session) => session.id === update.id)
      return current?.date.slice(0, 10) !== update.session_date
    })
    if (changedUpdates.length > 0) {
      await updateTreatmentSessionSchedule(changedUpdates)
      rescheduleSessions(
        patient.id,
        changedUpdates.map(({ id, session_date }) => ({
          id,
          date: session_date,
        }))
      )
    }
    return changedUpdates
  }

  async function handleChangeDate(sessionId: string, value: string) {
    const changedSession = patient.session.find((session) => session.id === sessionId)
    if (!changedSession) return
    if (changedSession.finish !== "pendente") {
      toast.error("Só é possível alterar a agenda de sessões pendentes.")
      return
    }

    const selectedDate = value.slice(0, 10)
    const scheduleUpdates: ScheduleUpdate[] = [
      { id: sessionId, session_date: selectedDate },
    ]

    try {
      await persistSchedule(scheduleUpdates)
      toast.success("Data da sessão salva no servidor.")
    } catch (error) {
      toast.error(
        error instanceof Error
          ? `Falha ao salvar a data da sessão: ${error.message}`
          : "Falha ao salvar a data da sessão."
      )
    }
  }

  async function handleChangeTime(sessionId: string, value: string) {
    const session = patient.session.find((item) => item.id === sessionId)
    if (!session || session.finish !== "pendente") {
      toast.error("Só é possível alterar o horário de sessões pendentes.")
      return
    }

    try {
      await updatePendingTreatmentSessionTime(sessionId, value)
      changeSessionTimeInStore(patient.id, sessionId, value)
      toast.success("Horário da sessão salvo no servidor.")
    } catch (error) {
      toast.error(
        error instanceof Error
          ? `Falha ao salvar o horário da sessão: ${error.message}`
          : "Falha ao salvar o horário da sessão."
      )
    }
  }

  async function handleChangePackageDays(
    packageId: string,
    fixedWeekDays: DayOfWeek[],
    showSuccessToast = true
  ): Promise<boolean> {
    if (patient.typeService !== "Pacote") {
      toast.error("Os dias da semana só podem ser alterados em pacotes.")
      return false
    }
    if (fixedWeekDays.length === 0) {
      toast.error("Selecione ao menos um dia da semana.")
      return false
    }

    const treatmentPackage = patient.packages.find((item) => item.id === packageId)
    if (!treatmentPackage) {
      toast.error("Não encontrei este pacote.")
      return false
    }

    const packageSessions = patient.session
      .filter((session) => session.packageId === packageId)
      .sort((a, b) => a.number - b.number)
    const updates: ScheduleUpdate[] = []
    let previousDate: Date | undefined

    for (const session of packageSessions) {
      if (session.finish !== "pendente") {
        previousDate = maxDate(previousDate, parseISO(session.date))
        continue
      }

      const oldDate = parseISO(session.date)
      const nextDate = previousDate
        ? getNextPackageDate(previousDate, fixedWeekDays)
        : getFirstPackageDate(oldDate, fixedWeekDays)
      const formattedDate = format(nextDate, "yyyy-MM-dd")
      if (session.date.slice(0, 10) !== formattedDate) {
        updates.push({ id: session.id, session_date: formattedDate })
      }
      previousDate = nextDate
    }

    try {
      await persistSchedule(updates)
      await updateTreatmentPackageWeekDays(packageId, fixedWeekDays)
      updatePackageWeekDaysInStore(patient.id, packageId, fixedWeekDays)
      if (showSuccessToast) {
        toast.success("Dias do pacote e agenda das sessões pendentes atualizados.")
      }
      return true
    } catch (error) {
      toast.error(
        error instanceof Error
          ? `Falha ao salvar os dias do pacote: ${error.message}`
          : "Falha ao salvar os dias do pacote."
      )
      return false
    }
  }

  async function handleChangeGlobalSchedule(
    startDate: string,
    sessionsPerWeek: number,
    fixedWeekDays: DayOfWeek[],
    showSuccessToast = true
  ): Promise<boolean> {
    const parsedStartDate = parseISO(startDate)
    if (!startDate || Number.isNaN(parsedStartDate.getTime())) {
      toast.error("Informe a data inicial da agenda.")
      return false
    }
    if (
      !Number.isInteger(sessionsPerWeek) ||
      sessionsPerWeek < 1 ||
      sessionsPerWeek > 6 ||
      fixedWeekDays.length !== sessionsPerWeek ||
      new Set(fixedWeekDays).size !== fixedWeekDays.length
    ) {
      toast.error("Selecione exatamente os dias indicados pela frequência semanal.")
      return false
    }

    const pendingSessions = patient.session
      .filter((session) => session.finish === "pendente")
      .sort(
        (a, b) =>
          a.date.localeCompare(b.date) || a.number - b.number
      )
    if (pendingSessions.length === 0) {
      toast.error("Não há sessões pendentes para atualizar.")
      return false
    }

    try {
      let nextDate = getFirstPackageDate(parsedStartDate, fixedWeekDays)
      const updates: ScheduleUpdate[] = []
      for (const session of pendingSessions) {
        updates.push({ id: session.id, session_date: format(nextDate, "yyyy-MM-dd") })
        nextDate = getNextPackageDate(nextDate, fixedWeekDays)
      }

      await persistSchedule(updates)

      if (patient.typeService === "Pacote") {
        const packageIds = [...new Set(
          pendingSessions
            .map((session) => session.packageId)
            .filter((packageId): packageId is string => Boolean(packageId))
        )]
        for (const packageId of packageIds) {
          await updateTreatmentPackageWeekDays(packageId, fixedWeekDays)
          updatePackageWeekDaysInStore(patient.id, packageId, fixedWeekDays)
        }
      }

      if (showSuccessToast) {
        toast.success("Agenda das sessões pendentes atualizada no servidor.")
      }
      return true
    } catch (error) {
      toast.error(
        error instanceof Error
          ? `Falha ao salvar a agenda: ${error.message}`
          : "Falha ao salvar a agenda."
      )
      return false
    }
  }

  return {
    handleChangeDate,
    handleChangeTime,
    handleChangePackageDays,
    handleChangeGlobalSchedule,
    getNextSessionDate,
    getNextPackageDate,
    getFirstPackageDate,
  }
}
