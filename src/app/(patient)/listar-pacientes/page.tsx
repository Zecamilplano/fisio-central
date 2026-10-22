"use client"
import { PatientDetails } from "@/components/patient/list/patientDetails"
import {
  PatientSidebar,
  SubHeaderPatientList,
  PatientEmptyState,
} from "@/components/patient/list"
import { useFisioStore } from "@/store/fisio/fisioStore"
import { getPatientsForList } from "@/services/patients/patientListRepository"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"

function ListPatient() {
  const listPatient = useFisioStore((state) => state.patients)
  const setListPatients = useFisioStore((state) => state.setListPatients)

  const [currentPackageIndex, setCurrentPackageIndex] = useState(0)
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(
    null
  )
  const [search, setSearch] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    void getPatientsForList()
      .then((patients) => {
        if (cancelled) return
        setListPatients(patients)
        const requestedPatientId = new URLSearchParams(
          window.location.search
        ).get("patientId")
        if (requestedPatientId) {
          const requestedPatient = patients.find(
            (patient) => patient.id === requestedPatientId
          )
          if (requestedPatient) setSelectedPatientId(requestedPatient.id)
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          toast.error(
            error instanceof Error
              ? `Não foi possível carregar os pacientes: ${error.message}`
              : "Não foi possível carregar os pacientes."
          )
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [setListPatients])

  const findPatient =
    search.length > 1
      ? listPatient.filter((patient) =>
        `${patient.firstName} ${patient.surName}`
          .toLocaleLowerCase()
          .includes(search)
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
        {selectedPatient === null &&
          (isLoading ? (
            <div className="flex w-full items-center justify-center rounded-r-md bg-white p-6 text-slate-500">
              Carregando pacientes...
            </div>
          ) : (
            <PatientEmptyState />
          ))}

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
