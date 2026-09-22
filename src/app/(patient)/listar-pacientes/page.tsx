"use client"
import { PatientDetails } from "@/components/patient/list/patientDetails"
import { useEffect, useState } from "react"
import {
  PatientSidebar,
  SubHeaderPatientList,
  PatientEmptyState,
} from "@/components/patient/list"
import { useFisioStore } from "@/store/fisio/fisioStore"

function ListPatient() {
  const listPatient = useFisioStore((state) => state.patients)

  const [currentPackageIndex, setCurrentPackageIndex] = useState(0)
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(
    null
  )
  const [search, setSearch] = useState<string>("")

  const findPatient =
    search.length > 1
      ? listPatient.filter((patient) =>
          patient.name.toLocaleLowerCase().includes(search)
        )
      : listPatient

  const selectedPatient =
    listPatient.find((patient) => patient.id === selectedPatientId) ?? null

  useEffect(() => {
    setCurrentPackageIndex(0)
  }, [selectedPatientId])

  return (
    <section className="font-open-sans ">
      {/*Barra de pesquisa | botão adicionar paciente*/}
      <SubHeaderPatientList onSearchChange={setSearch} />

      <div className="flex flex-col lg:flex-row lg:items-stretch lg:min-h-130 lg:max-h-[calc(100vh-210px)] px-2 pb-2">
        <PatientSidebar
          patients={findPatient}
          search={search}
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
              currentPackageIndex={currentPackageIndex}
              setCurrentPackageIndex={setCurrentPackageIndex}
              // packageSession={packageSession}
            />
          </>
        )}
      </div>
    </section>
  )
}

export default ListPatient
