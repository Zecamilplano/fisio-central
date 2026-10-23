import { useFisioStore } from "@/store/fisio/fisioStore"
import { DayOfWeek, ListPatient } from "@/types"
import { addDays, format, getDay, parseISO } from "date-fns"
import {
  updateTreatmentSessions,
  updateTreatmentSessionSchedule,
} from "@/services/patients/patientScheduleRepository"
import { toast } from "react-toastify"

const weekDayMap = {
  Domingo: 0,
  Segunda: 1,
  Terça: 2,
  Quarta: 3,
  Quinta: 4,
  Sexta: 5,
  Sábado: 6,
} as const

type UseSessionSchedulingProps = {
  patient: ListPatient
}

export function useSessionScheduling({ patient }: UseSessionSchedulingProps) {
  const rescheduleSession = useFisioStore((state) => state.rescheduleSession)
  const changeSessionTimeInStore = useFisioStore(
    (state) => state.changeSessionTime
  )
  function getNextSessionDate(lastDate: Date, weekDays: number[]) {
    let nextDate = addDays(lastDate, 1)

    while (!weekDays.includes(getDay(nextDate))) {
      nextDate = addDays(nextDate, 1)
    }

    return nextDate
  }

  function getNextPackageDate(lastDate: Date, fixedWeekDays: DayOfWeek[]) {
    const allowedDays: number[] = fixedWeekDays.map(
      (day) => weekDayMap[day as keyof typeof weekDayMap]
    )

    const nextDate = new Date(lastDate)

    do {
      nextDate.setDate(nextDate.getDate() + 1)
    } while (!allowedDays.includes(nextDate.getDay()))

    return nextDate
  }

  function getFirstPackageDate(startDate: Date, fixedWeekDays: DayOfWeek[]) {
    const allowedDays: number[] = fixedWeekDays.map(
      (day) => weekDayMap[day as keyof typeof weekDayMap]
    )

    let firstDate = new Date(startDate)

    while (!allowedDays.includes(firstDate.getDay())) {
      firstDate = addDays(firstDate, 1)
    }

    return firstDate
  }

  async function handleChangeDate(sessionId: string, value: string) {
    const changedSession = patient.session.find(
      (session) => session.id === sessionId
    )
    if (!changedSession) return

    const scheduleUpdates: Array<{ id: string; session_date: string }> = [
      { id: sessionId, session_date: value.slice(0, 10) },
    ]

    if (patient.typeService === "Pacote" && changedSession.packageId) {
      const treatmentPackage = patient.packages.find(
        (item) => item.id === changedSession.packageId
      )
      if (!treatmentPackage) {
        toast.error("Não encontrei o pacote desta sessão.")
        return
      }

      const packageSessions = patient.session
        .filter((session) => session.packageId === changedSession.packageId)
        .sort((a, b) => a.number - b.number)
      const changedIndex = packageSessions.findIndex(
        (session) => session.id === sessionId
      )

      if (changedIndex >= 0) {
        let previousDate = parseISO(value)
        for (
          let index = changedIndex + 1;
          index < packageSessions.length;
          index++
        ) {
          previousDate = getNextPackageDate(
            previousDate,
            treatmentPackage.fixedWeekDays
          )
          scheduleUpdates.push({
            id: packageSessions[index].id,
            session_date: format(previousDate, "yyyy-MM-dd"),
          })
        }
      }
    }

    try {
      await updateTreatmentSessionSchedule(scheduleUpdates)
    } catch (error) {
      toast.error(
        error instanceof Error
          ? `Falha ao salvar a data da sessão: ${error.message}`
          : "Falha ao salvar a data da sessão."
      )
      return
    }
    rescheduleSession(patient.id, sessionId, value)
    toast.success(
      patient.typeService === "Pacote"
        ? "Data e agenda do pacote salvas no servidor."
        : "Data da sessão salva no servidor."
    )
  }

  async function handleChangeTime(sessionId: string, value: string) {
    try {
      await updateTreatmentSessions([sessionId], { session_time: value })
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

  return {
    handleChangeDate,
    handleChangeTime,
    getNextSessionDate,
    getNextPackageDate,
    getFirstPackageDate,
  }
}
