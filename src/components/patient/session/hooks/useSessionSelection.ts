import { useState } from "react"

export function useSessionSelection(sessionIds: string[]) {
  const [selectedSessions, setSelectedSessions] = useState<string[]>([])

  const allSessionsSelected =
    sessionIds.length > 0 && selectedSessions.length === sessionIds.length

  function handleSelectSession(sessionId: string) {
    setSelectedSessions((prev) =>
      prev.includes(sessionId)
        ? prev.filter((item) => item !== sessionId)
        : [...prev, sessionId]
    )
  }

  function clearSelection() {
    setSelectedSessions([])
  }

  function selectAllSessions() {
    setSelectedSessions(sessionIds)
  }

  function handleSelectAllSessions() {
    if (allSessionsSelected) {
      clearSelection()
      return
    }

    selectAllSessions()
  }

  return {
    selectedSessions,
    allSessionsSelected,
    handleSelectSession,
    clearSelection,
    selectAllSessions,
    handleSelectAllSessions,
  }
}
