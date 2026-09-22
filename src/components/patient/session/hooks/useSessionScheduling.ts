import { useFisioStore } from "@/store/fisio/fisioStore"
import { DayOfWeek, ListPatient } from "@/types"
import { addDays, getDay } from "date-fns"

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

  function handleChangeDate(sessionId: string, value: string) {
    rescheduleSession(patient.id, sessionId, value)
  }

  return {
    handleChangeDate,
    getNextSessionDate,
    getNextPackageDate,
    getFirstPackageDate,
  }
}
