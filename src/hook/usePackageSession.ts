import type { ListPatient, PaidKey } from "@/types"
import { addDays, format, getDay, parseISO } from "date-fns"
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
  const currentPackage =
    patient.typeService === "Pacote"
      ? patient.packages[currentPackageIndex]
      : null

  const visibleSessions =
    patient.typeService === "Pacote" && currentPackage
      ? patient.session.filter(
          (session) =>
            session.packageId === currentPackage.id ||
            session.originPackageId === currentPackage.id ||
            (!session.packageId && !session.originPackageId)
        )
      : patient.session

  const sessionSelection = useSessionSelection(
    patient.session.map((session) => session.id),
    visibleSessions.map((session) => session.id)
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
  })

  const [openSessionId, setOpenSessionId] = useState<string | null>(null)

  const [isAddSessionModalOpen, setIsAddSessionModalOpen] = useState(false)
  const [addSessionModalMode, setAddSessionModalMode] = useState<
    "options" | "next-package"
  >("options")

  const completedCurrentPackageSessions = currentPackageSessions.filter(
    (session) => session.finish === "realizado"
  ).length

  const packageIsComplete =
    patient.typeService === "Pacote" && currentPackage
      ? completedCurrentPackageSessions >= currentPackage.totalSessions
      : false
  const hasPendingExtraSessions = currentPackage
    ? patient.session.some(
        (session) =>
          session.originPackageId === currentPackage.id &&
          session.isExtra &&
          session.finish !== "realizado"
      )
    : false
  const missingPackageSessions = currentPackage
    ? Math.max(0, currentPackage.totalSessions - currentPackageSessions.length)
    : 0

  const selectedStatus = sessionStatus.selectedStatus

  const packageTimelineSessions = currentPackage
    ? patient.session
        .filter((session) => session.packageId === currentPackage.id)
        .sort((a, b) => a.date.localeCompare(b.date))
    : []

  const suggestedPackageStartDate =
    currentPackage && packageTimelineSessions.length > 0
      ? currentPackage.fixedWeekDays.length > 0
        ? sessionScheduling.getNextPackageDate(
            parseISO(packageTimelineSessions.at(-1)!.date),
            currentPackage.fixedWeekDays
          )
        : addDays(parseISO(packageTimelineSessions.at(-1)!.date), 1)
      : currentPackage?.startDate ?? new Date()

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

    if (field === "time") {
      sessionScheduling.handleChangeTime(sessionId, String(value))
      return
    }
  }

  function createReplacementDeletedSession(
    sessions: ListPatient["session"],
    treatmentId?: string
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
      ...(treatmentId ? { packageId: treatmentId } : {}),
      number: sessions.length + 1,
      date: format(nextDate, "yyyy-MM-dd"),
      finish: "pendente",
      paid: "pendente",
    }
  }

  function openAddSessionModal() {
    setAddSessionModalMode("options")
    setIsAddSessionModalOpen(true)
  }

  function openNewPackageModal() {
    setAddSessionModalMode("next-package")
    setIsAddSessionModalOpen(true)
  }

  function closeAddSessionModal() {
    setIsAddSessionModalOpen(false)
    setAddSessionModalMode("options")
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
      currentPackageSessions,
      missingPackageSessions,
      isAddSessionModalOpen,
      addSessionModalMode,
      packageIsComplete,
      canContinueToNextPackage: packageIsComplete && !hasPendingExtraSessions,
      hasPendingExtraSessions,
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
      changePackageWeekDays: sessionScheduling.handleChangePackageDays,
      applyGlobalSchedule: sessionScheduling.handleChangeGlobalSchedule,
      openDeleteModal: sessionDeletion.deleteActions.openDeleteModal,
      addSeparateSession: sessionCreation.addSeparateSession,
      openAddSessionModal,
      openNewPackageModal,
      closeAddSessionModal,
      restoreMissingPackageSession:
        sessionCreation.restoreMissingPackageSession,
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
