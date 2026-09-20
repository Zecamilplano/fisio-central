import type { ListPatient, Session } from "@/types"
import { useState } from "react"
import { toast } from "react-toastify"

type UseSessionDeletionProps = {
  patient: ListPatient
  selectedSessions: string[]
  selectedSessionItems: Session[]
  setListPatient: React.Dispatch<React.SetStateAction<ListPatient[]>>
  clearSelection: () => void
  createReplacementDeletedSession: (sessions: Session[]) => Session
}

export function useSessionDeletion({
  patient,
  selectedSessions,
  selectedSessionItems,
  setListPatient,
  clearSelection,
  createReplacementDeletedSession,
}: UseSessionDeletionProps) {
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(
    null
  )

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    sessionId: null as string | null,
    sessionNumber: null as number | null,
  })

  const [createReplacementSession, setCreateReplacementSession] =
    useState(false)

  const isDeletingAllSessions =
    selectedSessions.length > 0 &&
    selectedSessions.length === patient.session.length

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

    if (session?.finish === "realizado") {
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

  function openSelectedDeleteModal() {
    if (selectedSessionItems.length === 0) return

    const hasFinishedSession = selectedSessionItems.some(
      (session) => session.finish === "realizado"
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

  function confirmDelete() {
    const sessionsToDelete =
      deleteModal.sessionId !== null
        ? [deleteModal.sessionId]
        : selectedSessions

    if (sessionsToDelete.length === 0) return

    const hasFinishedSession = patient.session.some(
      (session) =>
        sessionsToDelete.includes(session.id) && session.finish === "realizado"
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

  return {
    deleteState: {
      deleteModal,
      deletingSessionId,
      createReplacementSession,
      isDeletingAllSessions,
    },

    deleteActions: {
      openDeleteModal,
      openSelectedDeleteModal,
      closeDeleteModal,
      setCreateReplacementSession,
      confirmDelete,
    },
  }
}
