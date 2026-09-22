import { listPatientData } from "@/data"
import type { ListPatient } from "@/types"
import type { StateCreator } from "zustand"
import type { FisioStore } from "../fisioStore"

export type PatientId = ListPatient["id"]

export type PatientsSlice = {
  patients: ListPatient[]
  setListPatients: (patients: ListPatient[]) => void
  addPatient: (patient: ListPatient) => void
  updatePatient: (
    patientId: PatientId,
    updater: (patient: ListPatient) => ListPatient
  ) => void
  removePatient: (patientId: PatientId) => void
}

export const createPatientsSlice: StateCreator<
  FisioStore,
  [],
  [],
  PatientsSlice
> = (set) => ({
  patients: listPatientData,
  setListPatients: (patients) => set({ patients }),
  addPatient: (patient) =>
    set((state) => ({ patients: [...state.patients, patient] })),
  updatePatient: (patientId, updater) =>
    set((state) => ({
      patients: state.patients.map((patient) =>
        patient.id === patientId ? updater(patient) : patient
      ),
    })),
  removePatient: (patientId) =>
    set((state) => ({
      patients: state.patients.filter((patient) => patient.id !== patientId),
    })),
})
