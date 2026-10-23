import type { Session, TreatmentPackage } from "@/types"
import type { StateCreator } from "zustand"
import type { FisioStore } from "../fisioStore"
import type { PatientId } from "./patientsSlice"

export type PackagesSlice = {
  increasePackageSessionCount: (
    patientId: PatientId,
    packageId: string,
    count?: number
  ) => void
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
  increasePackageSessionCount: (patientId, packageId, count = 1) =>
    set((state) => ({
      patients: state.patients.map((patient) =>
        patient.id === patientId && patient.typeService === "Pacote"
          ? {
              ...patient,
              packages: patient.packages.map((treatmentPackage) =>
                treatmentPackage.id === packageId
                  ? {
                      ...treatmentPackage,
                      totalSessions: treatmentPackage.totalSessions + count,
                    }
                  : treatmentPackage
              ),
            }
          : patient
      ),
    })),
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
