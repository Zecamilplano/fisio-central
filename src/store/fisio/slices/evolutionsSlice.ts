import type { EvolutionSaveData } from "@/components/patient/evolution"
import type { Session } from "@/types"
import type { EvolutionAuthor } from "@/services/patients/sessionEvolutionRepository"
import type { StateCreator } from "zustand"
import type { FisioStore } from "../fisioStore"

type SessionId = Session["id"]

export type EvolutionsSlice = {
  evolutions: Record<SessionId, EvolutionSaveData>
  evolutionAuthors: Record<SessionId, EvolutionAuthor>
  setEvolutions: (evolutions: Record<SessionId, EvolutionSaveData>) => void
  setEvolutionAuthors: (authors: Record<SessionId, EvolutionAuthor>) => void
  setEvolutionAuthor: (sessionId: SessionId, author: EvolutionAuthor) => void
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
  evolutionAuthors: {},
  setEvolutions: (evolutions) => set({ evolutions }),
  setEvolutionAuthors: (evolutionAuthors) => set({ evolutionAuthors }),
  setEvolutionAuthor: (sessionId, author) =>
    set((state) => ({
      evolutionAuthors: { ...state.evolutionAuthors, [sessionId]: author },
    })),
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
      const { [sessionId]: __, ...evolutionAuthors } = state.evolutionAuthors

      return { evolutions, evolutionAuthors }
    }),
})
