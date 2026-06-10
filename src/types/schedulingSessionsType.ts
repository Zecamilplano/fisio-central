import { daysOfWeek } from "@/data/registerPatientData"
import { TypeServiceType } from "./typeServiceType"

export type summaryCardType = {
  value: number
  label: string
}[]

export type DayOfWeek = (typeof daysOfWeek)[number]

export type Session_ = {
  sessionNumber: number
  fullDate: string
  weekDay: string
}

export type SummaryItem = {
  label: "Agendadas" | "Restante" | "Total"
  value: number
}

export type Package = {
  totalSessions: number | null
  weeklyAmount: number | null
  selectedDays: Record<string, boolean>
  sessions: Session_[]
  summary: SummaryItem[]
}

export type SingleSession = {
  fullDate: Date
  weekDay: string
}

export type SchedulingForm = {
  serviceType: TypeServiceType | null
  package: Package
  singleSession: SingleSession | null
}

export type SchedulingErrorForm = {
  weeklyAmount: string[]
  selectedDays: string[]
  sessions: string[]
  weekDay: string[]
}
