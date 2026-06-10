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
import { usePatientSessions } from "@/hook/usePatientSessions"

function ListPatient() {
  const [listPatient, setListPatient] = useState<ListPatient[]>(listPatientData)

  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(
    null
  )
  const {
    selectedPatient,
    openSessionId,
    setOpenSessionId,
    selectedSessions,
    deletingSessionId,
    deleteModal,
    createReplacementSession,
    setCreateReplacementSession,
    allFinished,
    allPending,
    allPaid,
    allCancelled,
    allUnpaid,
    handleChange,
    openDeleteModal,
    closeDeleteModal,
    confirmDelete,
    handleSelectSession,
    changeFinishStatus,
    changePaymentStatus,
    clearSelection,
  } = usePatientSessions({
    listPatient,
    setListPatient,
    selectedPatientId,
  })

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
