import { listPatientData } from "@/data"
import { ListPatient } from "@/types"
import { create } from "zustand"

type PatientId = ListPatient["id"]

type FisioStore = {
  patients: ListPatient[]

  setListPatients: (patients: ListPatient[]) => void

  addPatient: (patient: ListPatient) => void

  updatePatient: (
    patientId: PatientId,
    updater: (patient: ListPatient) => ListPatient
  ) => void

  removePatient: (patientId: PatientId) => void
}

const useFisioStore = create<FisioStore>((set) => ({
  patients: listPatientData,

  setListPatients: (patients) => {
    set({ patients })
  },

  addPatient: (patient) => {
    set((state) => ({
      patients: [...state.patients, patient],
    }))
  },

  updatePatient: (patientId, updater) => {
    set((state) => ({
      patients: state.patients.map((patient) =>
        patient.id === patientId ? updater(patient) : patient
      ),
    }))
  },

  removePatient: (patientId) => {
    set((state) => ({
      patients: state.patients.filter((patient) => patient.id !== patientId),
    }))
  },
}))

export { useFisioStore }
export type { FisioStore }
