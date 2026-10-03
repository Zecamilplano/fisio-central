import { daysOfWeek } from "@/data"
import { Session } from "./session"
import type { PatientType } from "./registerPatientsTypes"

export type TypeService = "Pacote" | "Sessão avulsa"
export type DayOfWeek = (typeof daysOfWeek)[number]

export type TreatmentPackage = {
  id: string
  startDate: Date
  endDate?: Date

  totalSessions: number
  migratedSessions: number

  valueSession: number
  fixedWeekDays: DayOfWeek[]
  defaultTime: string
  current: boolean
}

export type UsePackageSession = {
  patient: ListPatient
  currentPackageIndex: number
}

export type SeparateSessionInfo = {
  priceSession: number
}

type PackagePatient = PatientType & {
  id: number
  image: string | null

  typeService: "Pacote"

  startDate: Date
  packages: TreatmentPackage[]

  session: Session[]
}

type SeparatePatient = PatientType & {
  id: number
  image: string | null

  typeService: "Sessão avulsa"

  startDate: Date
  separateSessionInfo: {
    priceSession: number
  }

  session: Session[]
}

export type ListPatient = PackagePatient | SeparatePatient
