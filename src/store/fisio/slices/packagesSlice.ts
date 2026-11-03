import type { DayOfWeek, Session, TreatmentPackage } from "@/types"
import type { StateCreator } from "zustand"
import type { FisioStore } from "../fisioStore"
import type { PatientId } from "./patientsSlice"

export type PackagesSlice = {
  updatePackageWeekDays: (
    patientId: PatientId,
    packageId: string,
    days: DayOfWeek[]
  ) => void
  updatePackageSchedule: (
    patientId: PatientId,
    packageId: string,
    startDate: Date,
    days: DayOfWeek[]
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
  updatePackageWeekDays: (patientId, packageId, days) =>
    set((state) => ({
      patients: state.patients.map((patient) =>
        patient.id === patientId && patient.typeService === "Pacote"
          ? {
              ...patient,
              packages: patient.packages.map((treatmentPackage) =>
                treatmentPackage.id === packageId
                  ? { ...treatmentPackage, fixedWeekDays: days }
                  : treatmentPackage
              ),
            }
          : patient
      ),
    })),
  updatePackageSchedule: (patientId, packageId, startDate, days) =>
    set((state) => ({
      patients: state.patients.map((patient) =>
        patient.id === patientId && patient.typeService === "Pacote"
          ? {
              ...patient,
              packages: patient.packages.map((treatmentPackage) =>
                treatmentPackage.id === packageId
                  ? {
                      ...treatmentPackage,
                      startDate,
                      fixedWeekDays: days,
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
