"use client"

import { createContext, useContext } from "react"
import type { Session } from "@/types"

type SessionCardContextData = {
  openSessionId: string | null
  deletingSessionId: string | null
  selectedSessions: string[]

  setOpenSessionId: React.Dispatch<React.SetStateAction<string | null>>
  handleSelectSession: (id: string) => void
  openDeleteModal: (sessionId: string, sessionNumber: number) => void

  handleChange: <K extends keyof Session>(
    sessionId: string,
    field: K | "delete",
    value?: boolean | string
  ) => void
}

const SessionCardContext = createContext<SessionCardContextData | null>(null)

export function SessionCardProvider({
  children,
  value,
}: {
  children: React.ReactNode
  value: SessionCardContextData
}) {
  return (
    <SessionCardContext.Provider value={value}>
      {children}
    </SessionCardContext.Provider>
  )
}

export function useSessionCardContext() {
  const context = useContext(SessionCardContext)

  if (!context) {
    throw new Error(
      "useSessionCardContext deve ser usado dentro de SessionCardProvider"
    )
  }

  return context
}
