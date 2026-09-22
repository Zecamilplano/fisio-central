import type { EvolutionSaveData } from "@/components/patient/evolution"
import type { Session } from "@/types"
import type { StateCreator } from "zustand"
import type { FisioStore } from "../fisioStore"

type SessionId = Session["id"]

export type EvolutionsSlice = {
  evolutions: Record<SessionId, EvolutionSaveData>
  saveEvolution: (sessionId: SessionId, evolution: EvolutionSaveData) => void
  updateEvolution: (sessionId: SessionId, evolution: EvolutionSaveData) => void
  removeEvolution: (sessionId: SessionId) => void
}

export const createEvolutionsSlice: StateCreator<
  FisioStore,
  [],
  [],
  EvolutionsSlice
> = (set) => ({
  evolutions: {},
  saveEvolution: (sessionId, evolution) =>
    set((state) => ({
      evolutions: { ...state.evolutions, [sessionId]: evolution },
    })),
  updateEvolution: (sessionId, evolution) =>
    set((state) => ({
      evolutions: { ...state.evolutions, [sessionId]: evolution },
    })),
  removeEvolution: (sessionId) =>
    set((state) => {
      const { [sessionId]: _, ...evolutions } = state.evolutions

      return { evolutions }
    }),
})
