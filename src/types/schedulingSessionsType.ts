import { daysOfWeek } from "@/data/registerPatientData"
import { TypeServiceType } from "./typeServiceType"

export type summaryCardType = {
  value: number
  label: string
}[]

export type DayOfWeek = (typeof daysOfWeek)[number]
export type PaymentType = "metade" | "integral" | "depois"

export type Session_ = {
  sessionNumber: number
  fullDate: string
  weekDay: string
  time: string
  paid: "pago" | "pendente"
}

export type SummaryItem = {
  label: "Agendadas" | "Restante" | "Total"
  value: number
}

export type Package = {
  startDate: Date | null
  defaultTime: string
  paymentType: PaymentType

  totalSessions: number | null
  weeklyAmount: number | null
  selectedDays: Record<string, boolean>
  sessions: Session_[]
  summary: SummaryItem[]
}

export type SingleSession = {
  fullDate: Date
  weekDay: string
  time: string
  paid: "pago" | "pendente"
}

export type SchedulingForm = {
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
