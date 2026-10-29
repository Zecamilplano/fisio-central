import { useState } from "react"

export function useSessionSelection(
  sessionIds: string[],
  selectAllSessionIds: string[] = sessionIds
) {
  const [selectedSessions, setSelectedSessions] = useState<string[]>([])

  const allSessionsSelected =
    selectAllSessionIds.length > 0 &&
    selectAllSessionIds.every((sessionId) => selectedSessions.includes(sessionId))

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
    setSelectedSessions(selectAllSessionIds)
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
