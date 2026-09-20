import { DayOfWeek, ListPatient, Session } from "@/types"
import { addDays, format, getDay, parseISO } from "date-fns"

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
  setListPatient: React.Dispatch<React.SetStateAction<ListPatient[]>>
}

export function useSessionScheduling({
  patient,
  setListPatient,
}: UseSessionSchedulingProps) {
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
    setListPatient((prev) =>
      prev.map((item) => {
        if (item.id !== patient.id) return item

        const changedSession = item.session.find(
          (session) => session.id === sessionId
        )

        if (!changedSession) return item

        // Sessão avulsa
        if (!changedSession.packageId) {
          return {
            ...item,
            session: item.session.map((session) =>
              session.id === sessionId
                ? {
                    ...session,
                    date: value,
                  }
                : session
            ),
          }
        }

        if (item.typeService !== "Pacote") return item

        const currentPackage = item.packages.find(
          (packageItem) => packageItem.id === changedSession.packageId
        )

        if (!currentPackage) return item

        const packageSessions = item.session
          .filter((session) => session.packageId === changedSession.packageId)
          .sort((a, b) => a.number - b.number)

        const changedIndex = packageSessions.findIndex(
          (session) => session.id === sessionId
        )

        if (changedIndex === -1) return item

        const updatedPackageSessions: Session[] = []

        for (let index = 0; index < packageSessions.length; index++) {
          const session = packageSessions[index]

          if (index < changedIndex) {
            updatedPackageSessions.push(session)
            continue
          }

          if (index === changedIndex) {
            updatedPackageSessions.push({
              ...session,
              date: value,
            })
            continue
          }

          const previousSession = updatedPackageSessions[index - 1]

          const nextDate = getNextPackageDate(
            parseISO(previousSession.date),
            currentPackage.fixedWeekDays
          )

          updatedPackageSessions.push({
            ...session,
            date: format(nextDate, "yyyy-MM-dd"),
          })
        }

        const otherSessions = item.session.filter(
          (session) => session.packageId !== changedSession.packageId
        )

        return {
          ...item,
          session: [...otherSessions, ...updatedPackageSessions],
        }
      })
    )
  }

  return {
    handleChangeDate,
    getNextSessionDate,
    getNextPackageDate,
    getFirstPackageDate,
  }
}
