import { create } from "zustand"
import type { PatientType, imageType } from "@/types"

type Updater<T> = T | ((prev: T) => T)

const initialPatient: PatientType = {
  firstName: "",
  surName: "",
  address: {
    telephone: "",
    street: "",
    addressNumber: null,
    noNumber: false,
    neighborhood: "Centro",
    referenceHouse: "",
  },
}

type PatientFormState = {
  patient: PatientType
  image: imageType
  setPatient: (value: Updater<PatientType>) => void
  setImage: (value: Updater<imageType>) => void
  resetForm: () => void
}

export const usePatientFormStore = create<PatientFormState>((set) => ({
  patient: initialPatient,
  image: [],
  // aceita valor direto ou função, igual ao setState do React
  setPatient: (value) =>
    set((s) => ({
      patient: typeof value === "function" ? value(s.patient) : value,
    })),
  setImage: (value) =>
    set((s) => ({
      image: typeof value === "function" ? value(s.image) : value,
    })),
  resetForm: () => set({ patient: initialPatient, image: [] }),
}))
