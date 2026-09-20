import type { DayOfWeek, ListPatient, Session, TreatmentPackage } from "@/types"
import { parseISO } from "date-fns"

type UseSessionCreationProps = {
  patient: ListPatient
  setListPatient: React.Dispatch<React.SetStateAction<ListPatient[]>>
  currentPackage: TreatmentPackage | null
  currentPackageSessions: Session[]
  getNextPackageDate: (lastDate: Date, fixedWeekDays: DayOfWeek[]) => Date
  getFirstPackageDate: (startDate: Date, fixedWeekDays: DayOfWeek[]) => Date
  closeAddSessionModal: () => void
}

export function useSessionCreation({
  patient,
  setListPatient,
  currentPackage,
  currentPackageSessions,
  getNextPackageDate,
  getFirstPackageDate,
  closeAddSessionModal,
}: UseSessionCreationProps) {
  function createSessionNumber(sessions: Session[]) {
    return sessions.length + 1
  }

  function createBaseSession(
    sessions: Session[],
    date: Date,
    packageId?: string
  ): Session {
    return {
      id: crypto.randomUUID(),
      number: createSessionNumber(sessions),
      packageId,
      date: date.toISOString(),
      finish: "pendente",
      paid: "pendente",
    }
  }

  function addSeparateSession(selectedDate: Date) {
    const newSession = createBaseSession(patient.session, selectedDate)

    setListPatient((prev) =>
      prev.map((item) => {
        if (item.id !== patient.id) return item

        return {
          ...item,
          session: [...item.session, newSession],
        }
      })
    )

    closeAddSessionModal()
  }

  function addSessionToCurrentPackage() {
    if (patient.typeService !== "Pacote") return
    if (!currentPackage) return

    const lastPackageSession = currentPackageSessions.at(-1)

    const lastDate = lastPackageSession
      ? parseISO(lastPackageSession.date)
      : currentPackage.startDate

    const nextDate = getNextPackageDate(lastDate, currentPackage.fixedWeekDays)

    const newSession = createBaseSession(
      patient.session,
      nextDate,
      currentPackage.id
    )

    setListPatient((prev) =>
      prev.map((item) => {
        if (item.id !== patient.id) return item

        return {
          ...item,
          session: [...item.session, newSession],
        }
      })
    )

    closeAddSessionModal()
  }

  function createPackageSessions(data: {
    packageId: string
    startDate: Date
    totalSessions: number
    fixedWeekDays: DayOfWeek[]
    currentSessions: Session[]
  }) {
    const sessions: Session[] = []
    let currentDate = getFirstPackageDate(data.startDate, data.fixedWeekDays)

    for (let index = 0; index < data.totalSessions; index++) {
      const sessionDate =
        index === 0
          ? currentDate
          : getNextPackageDate(currentDate, data.fixedWeekDays)

      sessions.push({
        id: crypto.randomUUID(),
        packageId: data.packageId,
        number: index + 1,
        date: sessionDate.toISOString(),
        finish: "pendente",
        paid: "pendente",
      })

      currentDate = sessionDate
    }

    return sessions
  }

  function getLastPackageSessionDate(packageId: string) {
    const packageSessions = patient.session.filter(
      (session) => session.packageId === packageId
    )

    const lastSession = packageSessions.at(-1)

    return lastSession ? parseISO(lastSession.date) : new Date()
  }

  function createNextPackage(data: {
    startDate: Date
    totalSessions: number
    valueSession: number
    fixedWeekDays: DayOfWeek[]
  }) {
    if (patient.typeService !== "Pacote") return
    if (!currentPackage) return

    const newPackageId = crypto.randomUUID()

    const newPackage = {
      id: newPackageId,
      startDate: data.startDate,
      totalSessions: data.totalSessions,
      migratedSessions: 0,
      valueSession: data.valueSession,
      fixedWeekDays: data.fixedWeekDays,
      defaultTime: "16:00",
      current: true,
    }

    const newPackageSessions = createPackageSessions({
      packageId: newPackageId,
      startDate: data.startDate,
      totalSessions: data.totalSessions,
      fixedWeekDays: data.fixedWeekDays,
      currentSessions: patient.session,
    })

    setListPatient((prev) =>
      prev.map((item) => {
        if (item.id !== patient.id) return item
        if (item.typeService !== "Pacote") return item

        return {
          ...item,
          packages: [
            ...item.packages.map((packageItem) =>
              packageItem.current
                ? {
                    ...packageItem,
                    current: false,
                    endDate: getLastPackageSessionDate(packageItem.id),
                  }
                : packageItem
            ),

            newPackage,
          ],
          session: [...item.session, ...newPackageSessions],
        }
      })
    )

    closeAddSessionModal()
  }

  return {
    addSeparateSession,
    addSessionToCurrentPackage,
    createNextPackage,
  }
}
