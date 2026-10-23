import type { ListPatient, Session } from "@/types"
import { useFisioStore } from "@/store/fisio/fisioStore"
import { useState } from "react"
import { deleteSingleTreatmentSessions } from "@/services/patients/patientScheduleRepository"
import { addSingleTreatmentSession } from "@/services/patients/patientScheduleRepository"
import { toast } from "react-toastify"

type UseSessionDeletionProps = {
  patient: ListPatient
  selectedSessions: string[]
  selectedSessionItems: Session[]
  clearSelection: () => void
  createReplacementDeletedSession: (sessions: Session[]) => Session
}

export function useSessionDeletion({
  patient,
  selectedSessions,
  selectedSessionItems,
  clearSelection,
  createReplacementDeletedSession,
}: UseSessionDeletionProps) {
  const deleteSessions = useFisioStore((state) => state.deleteSessions)
  const addSession = useFisioStore((state) => state.addSession)
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
      void (async () => {
        if (patient.typeService === "Sessão avulsa") {
          try {
            await deleteSingleTreatmentSessions(sessionsToDelete)
          } catch (error) {
            toast.error(
              error instanceof Error
                ? `Não foi possível excluir a sessão: ${error.message}`
                : "Não foi possível excluir a sessão."
            )
            setDeletingSessionId(null)
            return
          }
        }

      deleteSessions(patient.id, sessionsToDelete)

      if (shouldCreateReplacement) {
        let sessions = patient.session
          .filter((session) => !sessionsToDelete.includes(session.id))
          .map((session, index) => ({ ...session, number: index + 1 }))

        for (let index = 0; index < amountDeleted; index++) {
          let replacementSession = createReplacementDeletedSession(sessions)
          if (patient.typeService === "Sessão avulsa") {
            try {
              const saved = await addSingleTreatmentSession(
                patient.id,
                new Date(replacementSession.date)
              )
              replacementSession = {
                ...replacementSession,
                id: saved.id,
                number: saved.number,
                date: saved.date,
                time: "16:00",
              }
            } catch (error) {
              toast.error(
                error instanceof Error
                  ? `Não foi possível criar a sessão substituta: ${error.message}`
                  : "Não foi possível criar a sessão substituta."
              )
              setDeletingSessionId(null)
              return
            }
          }
          sessions = [...sessions, replacementSession]
          addSession(patient.id, replacementSession)
        }
      }

      clearSelection()

      toast.success(
        shouldCreateReplacement
          ? `${amountDeleted} sessão(ões) excluída(s) e ${amountDeleted} nova(s) adicionada(s) ao final da agenda.`
          : `${amountDeleted} sessão(ões) excluída(s) com sucesso.`
      )

      setDeletingSessionId(null)
      closeDeleteModal()
      })()
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
