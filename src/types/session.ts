import { Evolution } from "@/components/patient/evolution"
import {
  SelectedSessionsActionHandlers,
  SelectedSessionsStatus,
} from "@/components/patient/session/selectedSessionsActions"
import { StatusSessaoKey } from "@/data/optionsSessionsData"

export type PaidKey = "pendente" | "realizado" | "cancelado"
export type SessionChangeField = "finish" | "paid" | "date" | "time"
export type SessionChangeValue = StatusSessaoKey | PaidKey | string

export type Session = {
  id: string
  number: number
  packageId?: string
  date: string
  originalDate?: Date
  time?: string
  finish: StatusSessaoKey
  paid: PaidKey

  evolution?: Evolution
}

export type DeleteModal = {
  isOpen: boolean
  sessionId: string | null
  sessionNumber: number | null
}

export type SessionController = {
  selectedSessions: string[]
  openSessionId: string | null
  deletingSessionId: string | null

  selectedStatus: SelectedSessionsStatus
  selectedAction: SelectedSessionsActionHandlers

  selectSession: (sessionId: string) => void
  toggleSession: (sessionId: string) => void

  openDeleteModal: (sessionId: string, sessionNumber: number) => void

  changeSession: (
    sessionId: string,
    field: SessionChangeField,
    value: SessionChangeValue
  ) => void
}
