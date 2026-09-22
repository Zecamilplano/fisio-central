import { create } from "zustand"
import {
  createEvolutionsSlice,
  type EvolutionsSlice,
} from "./slices/evolutionsSlice"
import { createPackagesSlice, type PackagesSlice } from "./slices/packagesSlice"
import { createPatientsSlice, type PatientsSlice } from "./slices/patientsSlice"
import { createSessionsSlice, type SessionsSlice } from "./slices/sessionsSlice"

export type FisioStore = PatientsSlice &
  SessionsSlice &
  PackagesSlice &
  EvolutionsSlice

const useFisioStore = create<FisioStore>()((...args) => ({
  ...createPatientsSlice(...args),
  ...createSessionsSlice(...args),
  ...createPackagesSlice(...args),
  ...createEvolutionsSlice(...args),
}))

export { useFisioStore }
