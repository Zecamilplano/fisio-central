"use client"

import { useState } from "react"
import { listPatientData } from "@/data"
import type { ListPatient } from "@/types"
import { PatientSidebar } from "./patientSidebar"
import { PatientDetails } from "./patientDetails"
import { PatientEmptyState } from "./patientEmptyState"

export function PatientManagement() {
  const [listPatient, setListPatient] = useState<ListPatient[]>(listPatientData)
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(
    null
  )

  const selectedPatient =
    listPatient.find((patient) => patient.id === selectedPatientId) ?? null

  return (
    <section className="font-open-sans">
      {/* Header depois pode virar PatientHeader */}

      <div className="flex flex-col px-2 pb-2 lg:min-h-130 lg:max-h-[calc(100vh-210px)] lg:flex-row lg:items-stretch">
        <PatientSidebar
          patients={listPatient}
          selectedPatientId={selectedPatientId}
          onSelectPatient={setSelectedPatientId}
        />

        {selectedPatient === null ? (
          <PatientEmptyState />
        ) : (
          <PatientDetails patient={selectedPatient} />
        )}
      </div>
    </section>
  )
}
