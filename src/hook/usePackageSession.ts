import type { ListPatient, PaidKey } from "@/types"
import { format, getDay, parseISO } from "date-fns"
import { useEffect, useState } from "react"
import { UsePackageSession, SessionChangeField } from "@/types"
import { StatusSessaoKey } from "@/data/optionsSessionsData"
import {
  useSessionSelection,
  useSessionStatus,
  useSessionDeletion,
  useSessionScheduling,
  useSessionCreation,
} from "@/components/patient/session/hooks/"

function usePackageSession({
  patient,
  currentPackageIndex,
}: UsePackageSession) {
  const sessionSelection = useSessionSelection(
    patient.session.map((session) => session.id)
  )

  const sessionStatus = useSessionStatus({
    patient,
    selectedSessions: sessionSelection.selectedSessions,
  })

  const sessionDeletion = useSessionDeletion({
    patient,
    selectedSessions: sessionSelection.selectedSessions,
    selectedSessionItems: sessionStatus.selectedSessionItems,
    clearSelection: sessionSelection.clearSelection,
    createReplacementDeletedSession,
  })

  const sessionScheduling = useSessionScheduling({
    patient,
  })

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

  const sessionCreation = useSessionCreation({
    patient,
    currentPackage,
    currentPackageSessions,
    getNextPackageDate: sessionScheduling.getNextPackageDate,
    getFirstPackageDate: sessionScheduling.getFirstPackageDate,
    closeAddSessionModal,
  })

  const [openSessionId, setOpenSessionId] = useState<string | null>(null)

  const [isAddSessionModalOpen, setIsAddSessionModalOpen] = useState(false)

  const completedCurrentPackageSessions = currentPackageSessions.filter(
    (session) => session.finish === "realizado"
  ).length

  const packageIsComplete =
    patient.typeService === "Pacote" && currentPackage
      ? completedCurrentPackageSessions >= currentPackage.totalSessions
      : false

  const selectedStatus = sessionStatus.selectedStatus

  const suggestedPackageStartDate =
    currentPackage && currentPackageSessions.length > 0
      ? sessionScheduling.getNextPackageDate(
          parseISO(currentPackageSessions.at(-1)!.date),
          currentPackage.fixedWeekDays
        )
      : new Date()

  function handleToggleSession(sessionId: string) {
    setOpenSessionId((currentId) =>
      currentId === sessionId ? null : sessionId
    )
  }

  function handleChange(
    sessionId: string,
    field: SessionChangeField,
    value: StatusSessaoKey | PaidKey | string
  ) {
    // REALIZAÇÃO
    if (field === "finish") {
      sessionStatus.changeSessionFinish(sessionId, value as StatusSessaoKey)
      return
    }

    // PAGAMENTO / CANCELAMENTO
    if (field === "paid") {
      sessionStatus.changeSessionPayment(sessionId, value as PaidKey)
      return
    }

    // REAGENDAMENTO
    if (field === "date") {
      sessionScheduling.handleChangeDate(sessionId, String(value))
      return
    }
  }

  function createReplacementDeletedSession(
    sessions: ListPatient["session"]
  ): ListPatient["session"][number] {
    const lastSession = sessions[sessions.length - 1]

    const weekDays = sessions
      .map((session) => getDay(parseISO(session.date)))
      .filter((day, index, array) => array.indexOf(day) === index)

    const nextDate = sessionScheduling.getNextSessionDate(
      parseISO(lastSession.date),
      weekDays
    )

    return {
      id: crypto.randomUUID(),
      packageId: lastSession.packageId,
      number: sessions.length + 1,
      date: format(nextDate, "yyyy-MM-dd"),
      finish: "pendente",
      paid: "pendente",
    }
  }

  function openAddSessionModal() {
    setIsAddSessionModalOpen(true)
  }

  function closeAddSessionModal() {
    setIsAddSessionModalOpen(false)
  }

  useEffect(() => {
    setOpenSessionId(null)
    sessionSelection.clearSelection()
    sessionDeletion.deleteActions.closeDeleteModal()
  }, [patient.id, currentPackageIndex])

  return {
    sessionState: {
      openSessionId,
      currentPackage,
      isAddSessionModalOpen,
      packageIsComplete,
      suggestedPackageStartDate,
    },

    selectionState: {
      selectedSessions: sessionSelection.selectedSessions,
      allSessionsSelected: sessionSelection.allSessionsSelected,
      selectedStatus,
    },

    deleteState: sessionDeletion.deleteState,

    sessionActions: {
      setOpenSessionId,
      handleToggleSession,
      handleChange,
      openDeleteModal: sessionDeletion.deleteActions.openDeleteModal,
      addSeparateSession: sessionCreation.addSeparateSession,
      openAddSessionModal,
      closeAddSessionModal,
      addSessionToCurrentPackage: sessionCreation.addSessionToCurrentPackage,
      createNextPackage: sessionCreation.createNextPackage,
    },

    selectionActions: {
      clearSelection: sessionSelection.clearSelection,
      handleSelectSession: sessionSelection.handleSelectSession,
      handleSelectAllSessions: sessionSelection.handleSelectAllSessions,
      changeFinishStatus: sessionStatus.changeFinishStatus,
      changePaymentStatus: sessionStatus.changePaymentStatus,
      selectedActions: {
        ...sessionStatus.selectedActions,
        clear: sessionSelection.clearSelection,
        delete: sessionDeletion.deleteActions.openSelectedDeleteModal,
      },
    },

    deleteActions: sessionDeletion.deleteActions,
  }
}

export { usePackageSession }

export type UsePackageSessionReturn = ReturnType<typeof usePackageSession>
