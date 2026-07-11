import type { DayOfWeek, ListPatient, PaidKey, Session } from "@/types"
import { addDays, format, getDay, parseISO } from "date-fns"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"

type UsePackageSession = {
  patient: ListPatient
  setListPatient: React.Dispatch<React.SetStateAction<ListPatient[]>>
  currentPackageIndex: number
}

type DeleteModal = {
  isOpen: boolean
  sessionId: string | null
  sessionNumber: number | null
}

type SessionChangeField = "finish" | "paid" | "date" | "time"

const weekDayMap = {
  Domingo: 0,
  Segunda: 1,
  Terça: 2,
  Quarta: 3,
  Quinta: 4,
  Sexta: 5,
  Sábado: 6,
} as const

function usePackageSession({
  patient,
  setListPatient,
  currentPackageIndex,
}: UsePackageSession) {
  const [selectedSessions, setSelectedSessions] = useState<string[]>([])
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(
    null
  )
  const [openSessionId, setOpenSessionId] = useState<string | null>(null)

  const [deleteModal, setDeleteModal] = useState<DeleteModal>({
    isOpen: false,
    sessionId: null,
    sessionNumber: null,
  })

  const [createReplacementSession, setCreateReplacementSession] =
    useState(false)

  const [isAddSessionModalOpen, setIsAddSessionModalOpen] = useState(false)

  const selectedSessionItems =
    patient.session.filter((session) =>
      selectedSessions.includes(session.id)
    ) ?? []

  const allFinished =
    selectedSessionItems.length > 0 &&
    selectedSessionItems.every((session) => session.finish === true)

  const allPending =
    selectedSessionItems.length > 0 &&
    selectedSessionItems.every((session) => session.finish === false)

  const allPaid =
    selectedSessionItems.length > 0 &&
    selectedSessionItems.every((session) => session.paid === "pago")

  const allCancelled =
    selectedSessionItems.length > 0 &&
    selectedSessionItems.every((session) => session.paid === "cancelado")

  const allUnpaid =
    selectedSessionItems.length > 0 &&
    selectedSessionItems.every((session) => session.paid === "pendente")

  const allSessionsSelected =
    patient.session.length > 0 &&
    selectedSessions.length === patient.session.length

  const isDeletingAllSessions =
    selectedSessions.length > 0 &&
    selectedSessions.length === patient.session.length

  const isSingleSession = patient?.typeService === "Sessão avulsa"

  const currentPackage =
    patient.typeService === "Pacote"
      ? patient.packages[currentPackageIndex]
      : null

  const currentPackageSessions =
    patient.typeService === "Pacote" && currentPackage
      ? patient.session.filter(
          (session) => session.packageId === currentPackage.id
        )
      : []

  const completedCurrentPackageSessions = currentPackageSessions.filter(
    (session) => session.finish
  ).length

  const packageIsComplete =
    patient.typeService === "Pacote" && currentPackage
      ? completedCurrentPackageSessions >= currentPackage.totalSessions
      : false

  const suggestedPackageStartDate =
    currentPackage && currentPackageSessions.length > 0
      ? getNextPackageDate(
          parseISO(currentPackageSessions.at(-1)!.date),
          currentPackage.fixedWeekDays
        )
      : new Date()
  function clearSelection() {
    setSelectedSessions([])
  }

  function handleSelectSession(sessionId: string) {
    setSelectedSessions((prev) =>
      prev.includes(sessionId)
        ? prev.filter((item) => item !== sessionId)
        : [...prev, sessionId]
    )
  }

  function selectAllSessions() {
    setSelectedSessions(patient.session.map((session) => session.id))
  }

  function handleSelectAllSessions() {
    if (allSessionsSelected) {
      clearSelection()
      return
    }

    selectAllSessions()
  }

  function closeDeleteModal() {
    setCreateReplacementSession(false)

    setDeleteModal({
      isOpen: false,
      sessionId: null,
      sessionNumber: null,
    })
  }

  function openDeleteModal(sessionId: string, sessionNumber: number) {
    const session = patient.session.find((item) => item.id === sessionId)

    if (session?.finish) {
      toast.error(
        `A sessão #${session.number} já foi realizada e não pode ser excluída.`
      )
      closeDeleteModal()
      return
    }

    setDeleteModal({
      isOpen: true,
      sessionId,
      sessionNumber,
    })
  }

  function handleChange(
    sessionId: string,
    field: SessionChangeField,
    value: boolean | PaidKey | string
  ) {
    setListPatient((prev) =>
      prev.map((item) => {
        if (item.id !== patient.id) return item

        if (field === "date") {
          const changedSession = item.session.find(
            (session) => session.id === sessionId
          )

          if (!changedSession?.packageId) {
            return {
              ...item,
              session: item.session.map((session) =>
                session.id === sessionId
                  ? { ...session, date: String(value) }
                  : session
              ),
            }
          }

          const packageSessions = item.session
            .filter((session) => session.packageId === changedSession.packageId)
            .sort((a, b) => a.number - b.number)

          const otherSessions = item.session.filter(
            (session) => session.packageId !== changedSession.packageId
          )

          const changedIndex = packageSessions.findIndex(
            (session) => session.id === sessionId
          )

          const oldDates = packageSessions.map((session) => session.date)

          const updatedPackageSessions = packageSessions.map(
            (session, index) => {
              if (index < changedIndex) return session

              if (index === changedIndex) {
                return {
                  ...session,
                  date: String(value),
                }
              }

              return {
                ...session,
                date: oldDates[index - 1],
              }
            }
          )

          return {
            ...item,
            session: [...otherSessions, ...updatedPackageSessions],
          }
        }

        const changedSession = item.session.find(
          (session) => session.id === sessionId
        )

        if (!changedSession?.packageId) {
          return {
            ...item,
            session: item.session.map((session) =>
              session.id === sessionId
                ? { ...session, date: String(value) }
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
              date: String(value),
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

  function changeFinishStatus(value: boolean) {
    setListPatient((prev) =>
      prev.map((item) => {
        if (item.id !== patient.id) return item

        return {
          ...item,
          session: item.session.map((session) =>
            selectedSessions.includes(session.id)
              ? { ...session, finish: value }
              : session
          ),
        }
      })
    )
  }

  function changePaymentStatus(value: PaidKey) {
    setListPatient((prev) =>
      prev.map((item) => {
        if (item.id !== patient.id) return item

        return {
          ...item,
          session: item.session.map((session) =>
            selectedSessions.includes(session.id)
              ? { ...session, paid: value }
              : session
          ),
        }
      })
    )
  }

  function getNextSessionDate(lastDate: Date, weekDays: number[]) {
    let nextDate = addDays(lastDate, 1)

    while (!weekDays.includes(getDay(nextDate))) {
      nextDate = addDays(nextDate, 1)
    }

    return nextDate
  }

  function createReplacementDeletedSession(
    sessions: ListPatient["session"]
  ): ListPatient["session"][number] {
    const lastSession = sessions[sessions.length - 1]

    const weekDays = sessions
      .map((session) => getDay(parseISO(session.date)))
      .filter((day, index, array) => array.indexOf(day) === index)

    const nextDate = getNextSessionDate(parseISO(lastSession.date), weekDays)

    return {
      id: crypto.randomUUID(),
      packageId: lastSession.packageId,
      number: sessions.length + 1,
      date: format(nextDate, "yyyy-MM-dd"),
      finish: false,
      paid: "pendente",
    }
  }

  function confirmDelete() {
    const sessionsToDelete =
      deleteModal.sessionId !== null
        ? [deleteModal.sessionId]
        : selectedSessions

    if (sessionsToDelete.length === 0) return

    const hasFinishedSession = patient.session.some(
      (session) => sessionsToDelete.includes(session.id) && session.finish
    )

    if (hasFinishedSession) {
      toast.error("Não é possível excluir sessões já realizadas.")
      closeDeleteModal()
      return
    }

    const shouldCreateReplacement = createReplacementSession
    const amountDeleted = sessionsToDelete.length

    setDeletingSessionId(sessionsToDelete[0])

    setTimeout(() => {
      setListPatient((prev) =>
        prev.map((item) => {
          if (item.id !== patient.id) return item

          const filteredSessions = item.session.filter(
            (session) => !sessionsToDelete.includes(session.id)
          )

          const reorderedSessions = filteredSessions.map((session, index) => ({
            ...session,
            number: index + 1,
          }))

          if (!shouldCreateReplacement) {
            return {
              ...item,
              session: reorderedSessions,
            }
          }

          let sessionsWithReplacement = [...reorderedSessions]

          for (let index = 0; index < amountDeleted; index++) {
            const replacementSession = createReplacementDeletedSession(
              sessionsWithReplacement
            )

            sessionsWithReplacement = [
              ...sessionsWithReplacement,
              replacementSession,
            ]
          }

          return {
            ...item,
            session: sessionsWithReplacement,
          }
        })
      )

      clearSelection()

      toast.success(
        shouldCreateReplacement
          ? `${amountDeleted} sessão(ões) excluída(s) e ${amountDeleted} nova(s) adicionada(s) ao final da agenda.`
          : `${amountDeleted} sessão(ões) excluída(s) com sucesso.`
      )

      setDeletingSessionId(null)
      closeDeleteModal()
    }, 300)
  }

  function openSelectedDeleteModal() {
    if (selectedSessionItems.length === 0) return

    const hasFinishedSession = selectedSessionItems.some(
      (session) => session.finish
    )

    if (hasFinishedSession) {
      toast.error("Não é possível excluir sessões já realizadas.")
      return
    }

    setDeleteModal({
      isOpen: true,
      sessionId: null,
      sessionNumber: null,
    })
  }

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
      finish: false,
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

  function openAddSessionModal() {
    setIsAddSessionModalOpen(true)
  }

  function closeAddSessionModal() {
    setIsAddSessionModalOpen(false)
  }

  function getNextPackageDate(lastDate: Date, fixedWeekDays: string[]) {
    const allowedDays: number[] = fixedWeekDays.map(
      (day) => weekDayMap[day as keyof typeof weekDayMap]
    )

    const nextDate = new Date(lastDate)

    do {
      nextDate.setDate(nextDate.getDate() + 1)
    } while (!allowedDays.includes(nextDate.getDay()))

    return nextDate
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

  function getFirstPackageDate(startDate: Date, fixedWeekDays: string[]) {
    const allowedDays: number[] = fixedWeekDays.map(
      (day) => weekDayMap[day as keyof typeof weekDayMap]
    )

    let firstDate = new Date(startDate)

    while (!allowedDays.includes(firstDate.getDay())) {
      firstDate = addDays(firstDate, 1)
    }

    return firstDate
  }

  function createPackageSessions(data: {
    packageId: string
    startDate: Date
    totalSessions: number
    fixedWeekDays: string[]
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
        finish: false,
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

  useEffect(() => {
    setOpenSessionId(null)
    clearSelection()
    closeDeleteModal()
    setDeletingSessionId(null)
  }, [patient.id, currentPackageIndex])

  return {
    sessionState: {
      openSessionId,
      currentPackage,
      deletingSessionId,
      isAddSessionModalOpen,
      packageIsComplete,
      suggestedPackageStartDate,
    },

    selectionState: {
      selectedSessions,
      allSessionsSelected,
      isSingleSession,
      allFinished,
      allPending,
      allPaid,
      allUnpaid,
      allCancelled,
    },

    deleteState: {
      deleteModal,
      createReplacementSession,
      isDeletingAllSessions,
    },

    sessionActions: {
      setOpenSessionId,
      handleChange,
      openDeleteModal,
      addSeparateSession,
      openAddSessionModal,
      closeAddSessionModal,
      addSessionToCurrentPackage,
      createNextPackage,
    },

    selectionActions: {
      clearSelection,
      handleSelectSession,
      handleSelectAllSessions,
      changeFinishStatus,
      changePaymentStatus,
    },

    deleteActions: {
      openSelectedDeleteModal,
      setCreateReplacementSession,
      closeDeleteModal,
      confirmDelete,
    },
  }
}

export { usePackageSession }
