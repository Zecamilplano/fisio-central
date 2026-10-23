import type { ListPatient, Session } from "@/types"
import { useFisioStore } from "@/store/fisio/fisioStore"
import { useState } from "react"
import { parseISO } from "date-fns"
import {
  addSingleTreatmentSession,
  addTreatmentSession,
  deleteTreatmentSessions,
} from "@/services/patients/patientScheduleRepository"
import { toast } from "react-toastify"

type UseSessionDeletionProps = {
  patient: ListPatient
  selectedSessions: string[]
  selectedSessionItems: Session[]
  clearSelection: () => void
  createReplacementDeletedSession: (
    sessions: Session[],
    treatmentId?: string
  ) => Session
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
    if (patient.session.length <= 1) {
      toast.error(
        "Esta sessão não pode ser excluída porque é a única sessão do paciente."
      )
      return
    }

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

    if (patient.session.length <= 1) {
      toast.error(
        "Esta sessão não pode ser excluída porque é a única sessão do paciente."
      )
      return
    }

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

    if (patient.session.length <= 1) {
      toast.error(
        "Esta sessão não pode ser excluída porque é a única sessão do paciente."
      )
      closeDeleteModal()
      return
    }

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
        try {
          await deleteTreatmentSessions(sessionsToDelete)
        } catch (error) {
          toast.error(
            error instanceof Error
              ? `Não foi possível excluir a sessão: ${error.message}`
              : "Não foi possível excluir a sessão."
          )
          setDeletingSessionId(null)
          return
        }

        deleteSessions(patient.id, sessionsToDelete)

        if (shouldCreateReplacement) {
          const removedSessions = patient.session.filter((session) =>
            sessionsToDelete.includes(session.id)
          )
          const remainingSessions = patient.session.filter(
            (session) => !sessionsToDelete.includes(session.id)
          )
          const replacementSessions = [...remainingSessions]

          for (const removedSession of removedSessions) {
            const treatmentSessions = replacementSessions.filter(
              (session) => session.packageId === removedSession.packageId
            )
            const replacementSession = createReplacementDeletedSession(
              treatmentSessions.length ? treatmentSessions : [removedSession],
              removedSession.packageId
            )

            try {
              const saved = removedSession.packageId
                ? await addTreatmentSession(
                    removedSession.packageId,
                    parseISO(replacementSession.date),
                    replacementSession.time ?? "16:00"
                  )
                : await addSingleTreatmentSession(
                    patient.id,
                    parseISO(replacementSession.date)
                  )

              const savedReplacement = {
                ...replacementSession,
                id: saved.id,
                number: saved.number,
                date: saved.date,
              }
              replacementSessions.push(savedReplacement)
              addSession(patient.id, savedReplacement)
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
