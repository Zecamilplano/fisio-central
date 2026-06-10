"use client"
import { PatientDetails } from "@/components/patient/list/patientDetails"
import "../../../styles/modal.css"
import { listPatientData } from "@/data"
import type { ListPatient, PaidKey } from "@/types/"
import { format, parseISO } from "date-fns"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import { SessionCardProvider } from "@/context/sessionCardContext"
import { generateReplacementSession } from "@/utils/sessions/generateReplacementSession"
import { PatientSidebar } from "@/components/patient/list/patientSidebar"
import { SubHeaderPatientList } from "@/components/patient/list/subHeaderPatient"
import { PatientEmptyState } from "@/components/patient/list/patientEmptyState"

function ListPatient() {
  const [listPatient, setListPatient] = useState<ListPatient[]>(listPatientData)

  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(
    null
  )
  const selectedPatient =
    listPatient.find((patient) => patient.id === selectedPatientId) ?? null
  console.log(selectedPatient)
  const [openSessionId, setOpenSessionId] = useState<string | null>(null)
  const [selectedSessions, setSelectedSessions] = useState<string[]>([])

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean
    sessionId: string | null
    sessionNumber: number | null
  }>({
    isOpen: false,
    sessionId: null,
    sessionNumber: null,
  })
  const [createReplacementSession, setCreateReplacementSession] =
    useState(false)
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(
    null
  )

  {
    /**/
  }

  //style status do modal
  const selectedSessionItems =
    selectedPatient?.session.filter((session) =>
      selectedSessions.includes(session.id)
    ) ?? []

  // status sessão
  const allFinished =
    selectedSessionItems.length > 0 &&
    selectedSessionItems.every((session) => session.finish === true)
  const allPending =
    selectedSessionItems.length > 0 &&
    selectedSessionItems.every((session) => session.finish === false)

  // status pagamento
  const allPaid =
    selectedSessionItems.length > 0 &&
    selectedSessionItems.every((session) => session.paid === "pago")

  const allCancelled =
    selectedSessionItems.length > 0 &&
    selectedSessionItems.every((session) => session.paid === "cancelado")

  const allUnpaid =
    selectedSessionItems.length > 0 &&
    selectedSessionItems.every((session) => session.paid === "pendente")

  function handleChange<K extends keyof ListPatient["session"][number]>(
    sessionId: string,
    field: K | "delete",
    value?: boolean | string
  ) {
    setListPatient((prev) => {
      return prev.map((patient) => {
        if (patient.id !== selectedPatient?.id) {
          return patient
        }

        let updatedSessions: typeof patient.session

        if (field === "delete") {
          updatedSessions = patient.session
            .filter((session) => session.id !== sessionId)
            .map((session, index) => ({
              ...session,
              number: index + 1,
            }))
        } else {
          updatedSessions = patient.session.map((session) => {
            if (session.id !== sessionId) {
              return session
            }
            return {
              ...session,
              [field]: value,
            }
          })
        }

        return {
          ...patient,
          session: updatedSessions,
        }
      })
    })
  }

  function openDeleteModal(sessionId: string, sessionNumber: number) {
    const session = selectedPatient?.session.find(
      (item) => item.id === sessionId
    )

    if (session?.finish) {
      toast.error("Não é possível excluir uma sessão realizada.")
      return
    }

    setDeleteModal({
      isOpen: true,
      sessionId,
      sessionNumber,
    })
  }

  function closeDeleteModal() {
    setCreateReplacementSession(false)

    setDeleteModal({
      isOpen: false,
      sessionId: null,
      sessionNumber: null,
    })
  }
  //
  function confirmDelete() {
    const session = selectedPatient?.session.find(
      (item) => item.id === deleteModal.sessionId
    )

    if (session?.finish) {
      toast.error("Não é possível excluir uma sessão realizada.")
      closeDeleteModal()
      return
    }

    if (deleteModal.sessionId) {
      if (!session?.date) return

      toast.success(
        createReplacementSession
          ? `Sessão #${session.number} de ${format(
              parseISO(session.date),
              "dd/MM/yyyy"
            )} excluída e uma nova sessão foi adicionada ao final da agenda.`
          : `Sessão #${session.number} de ${format(
              parseISO(session.date),
              "dd/MM/yyyy"
            )} excluída com sucesso.`
      )

      setDeletingSessionId(deleteModal.sessionId)
      closeDeleteModal()

      setTimeout(() => {
        handleChange(deleteModal.sessionId!, "delete")
        if (createReplacementSession && selectedPatient) {
          addReplacementSession(selectedPatient.id)
        }

        setDeletingSessionId(null)
      }, 400)
    }
  }

  function addReplacementSession(patientId: number) {
    setListPatient((prev) =>
      prev.map((patient) => {
        if (patient.id !== patientId) {
          return patient
        }

        const newSession = generateReplacementSession(patient)

        if (!newSession) {
          return patient
        }

        const updatedPatient = {
          ...patient,
          session: [...patient.session, newSession],
        }

        return updatedPatient
      })
    )
  }

  function handleSelectSession(id: string) {
    setSelectedSessions((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const clearSelection = () => setSelectedSessions([])

  function changeFinishStatus(value: boolean) {
    setListPatient((prev) =>
      prev.map((patient) => ({
        ...patient,
        session: patient.session.map((session) =>
          selectedSessions.includes(session.id)
            ? { ...session, finish: value }
            : session
        ),
      }))
    )
  }

  function changePaymentStatus(value: PaidKey) {
    setListPatient((prev) =>
      prev.map((patient) => {
        if (patient.id !== selectedPatientId) {
          return patient
        }

        return {
          ...patient,
          session: patient.session.map((session) =>
            selectedSessions.includes(session.id)
              ? { ...session, paid: value }
              : session
          ),
        }
      })
    )
  }

  useEffect(() => {
    function handleEsc(event: KeyboardEvent) {
      if (event.key === "Escape" && deleteModal.isOpen) {
        closeDeleteModal()
      }
    }

    window.addEventListener("keydown", handleEsc)

    return () => {
      window.removeEventListener("keydown", handleEsc)
    }
  }, [deleteModal.isOpen])

  return (
    <section className="font-open-sans ">
      {/*Barra de pesquisa | botão adicionar paciente*/}
      <SubHeaderPatientList />

      <div className="flex flex-col lg:flex-row lg:items-stretch lg:min-h-130 lg:max-h-[calc(100vh-210px)] px-2 pb-2">
        <PatientSidebar
          patients={listPatient}
          selectedPatientId={selectedPatientId}
          onSelectPatient={setSelectedPatientId}
        />

        {/*Tela sem informação do paciente*/}
        {selectedPatient === null && <PatientEmptyState />}

        {selectedPatient !== null && (
          <>
            {/*Detalhes do paciente*/}
            <SessionCardProvider
              value={{
                openSessionId,
                deletingSessionId,
                selectedSessions,
                setOpenSessionId,
                handleSelectSession,
                openDeleteModal,
                handleChange,
              }}
            >
              <PatientDetails
                patient={selectedPatient}
                allFinished={allFinished}
                selectedSessions={selectedSessions}
                allPending={allPending}
                allPaid={allPaid}
                allCancelled={allCancelled}
                allUnpaid={allUnpaid}
                deleteModal={deleteModal}
                createReplacementSession={createReplacementSession}
                setCreateReplacementSession={setCreateReplacementSession}
                closeDeleteModal={closeDeleteModal}
                confirmDelete={confirmDelete}
                changeFinishStatus={changeFinishStatus}
                changePaymentStatus={changePaymentStatus}
                clearSelection={clearSelection}
              />
            </SessionCardProvider>
          </>
        )}
      </div>
    </section>
  )
}

export default ListPatient
