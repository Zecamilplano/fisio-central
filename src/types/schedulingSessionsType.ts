import { TypeServiceType } from "./typeServiceType"
import type { Session } from "./session"

export type summaryCardType = {
  value: number
  label: string
}[]

export type PaymentType = "metade" | "integral" | "depois"

export type Session_ = Pick<Session, "finish" | "paid"> & {
  sessionNumber: number
  fullDate: string
  weekDay: string
  time: string
}

export type SummaryItem = {
  label: "Agendadas" | "Restante" | "Total"
  value: number
}

export type Package = {
  startDate: Date | null
  defaultTime: string
  paymentType: PaymentType
  paidSessionsCount: number | null

  weeklyAmount: number | null
  selectedDays: Record<string, boolean>
  sessions: Session_[]
  summary: SummaryItem[]
}

export type SingleSession = Pick<Session, "finish" | "paid"> & {
  fullDate: Date
  weekDay: string
  time: string
}

export type SchedulingForm = {
  initialDateSession: Date | null
  totalSessions: number | null
  serviceType: TypeServiceType | null
  package: Package
  singleSession: SingleSession | null
}

export type SchedulingErrorForm = {
  startDate: string[]
  defaultTime: string[]
  paymentType: string[]

  weeklyAmount: string[]
  selectedDays: string[]
  sessions: string[]
  weekDay: string[]
}
