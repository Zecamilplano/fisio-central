"use client"
import { PatientDetails } from "@/components/patient/list/patientDetails"
import "../../../styles/modal.css"
import { listPatientData } from "@/data"
import type { ListPatient, PaidKey } from "@/types/"
import { useState } from "react"
import { SessionCardProvider } from "@/context/sessionCardContext"
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
    openDeleteModal,
    handleChange,
    handleSelectSession,
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
            <PatientDetails
              patient={selectedPatient}
              setListPatient={setListPatient}
            />
          </>
        )}
      </div>
    </section>
  )
}

export default ListPatient
