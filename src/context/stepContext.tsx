"use client"
import { StepKey } from "@/types/patientsTypes"
import { createContext, useContext, useState } from "react"

type StepContextType = {
  hasTriedNext: HasTriedNextType
  setHasTriedNext: React.Dispatch<React.SetStateAction<HasTriedNextType>>
}

type HasTriedNextType = Record<StepKey, boolean>

const StepContext = createContext<StepContextType | null>(null)

export function StepProvider({ children }: { children: React.ReactNode }) {
  const [hasTriedNext, setHasTriedNext] = useState<HasTriedNextType>({
    step1: false,
    step2: false,
    step3: false,
  }) // tentou ir para o próximo

  return (
    <StepContext.Provider value={{ hasTriedNext, setHasTriedNext }}>
      {children}
    </StepContext.Provider>
  )
}

export function useStepContext() {
  const context = useContext(StepContext)
  if (!context)
    throw new Error("useStepContext deve ser usado dentro do provider")
  return context
}
