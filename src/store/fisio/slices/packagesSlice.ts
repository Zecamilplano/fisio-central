import type { Session, TreatmentPackage } from "@/types"
import type { StateCreator } from "zustand"
import type { FisioStore } from "../fisioStore"
import type { PatientId } from "./patientsSlice"

export type PackagesSlice = {
  startNextPackage: (
    patientId: PatientId,
    treatmentPackage: TreatmentPackage,
    sessions: Session[],
    previousPackageEndDate: Date
  ) => void
}

export const createPackagesSlice: StateCreator<
  FisioStore,
  [],
  [],
  PackagesSlice
> = (set) => ({
  startNextPackage: (
    patientId,
    treatmentPackage,
    sessions,
    previousPackageEndDate
  ) =>
    set((state) => ({
      patients: state.patients.map((patient) => {
        if (patient.id !== patientId || patient.typeService !== "Pacote") {
          return patient
        }

        return {
          ...patient,
          packages: [
            ...patient.packages.map((item) =>
              item.current
                ? { ...item, current: false, endDate: previousPackageEndDate }
                : item
            ),
            treatmentPackage,
          ],
          session: [...patient.session, ...sessions],
        }
      }),
    })),
})
