import { daysOfWeek } from "@/data"
import { LucideIcon } from "lucide-react"
import { Session } from "./session"

export type TypeService = "Pacote" | "Sessão avulsa"
export type ContactInfoKey = "tel" | "address" | "reference"
export type DayOfWeek = (typeof daysOfWeek)[number]

type ContactInfoData = {
  Icon: LucideIcon
  label: string
  value: string
}

export type ContactInfo = Record<ContactInfoKey, ContactInfoData>

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
  setListPatient: React.Dispatch<React.SetStateAction<ListPatient[]>>
  currentPackageIndex: number
}

export type SeparateSessionInfo = {
  priceSession: number
}

type PackagePatient = {
  id: number
  name: string
  image: string | null

  typeService: "Pacote"

  startDate: Date
  contactInfo: ContactInfo

  packages: TreatmentPackage[]

  session: Session[]
}

type SeparatePatient = {
  id: number
  name: string
  image: string | null

  typeService: "Sessão avulsa"

  startDate: Date
  contactInfo: ContactInfo

  separateSessionInfo: {
    priceSession: number
  }

  session: Session[]
}

export type ListPatient = PackagePatient | SeparatePatient
