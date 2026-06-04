import { LucideIcon } from "lucide-react"

export type TypeService = "Pacote" | "Sessão avulsa"
export type PaidStatus = "pago" | "pendente"
export type ContactInfoKey = "tel" | "address" | "reference"
export type PaidKey = "pendente" | "pago" | "cancelado"
export type SessionPackageInfoKey =
  | "sessao"
  | "restante"
  | "total"
  | "preco_sessao"
type SessionSeparateInfoKey =
  | "sessao_feita"
  | "sessao_agendada"
  | "preco_sessao"
type WeekDay =
  | 1 // segunda
  | 2 // terça
  | 3 // quarta
  | 4 // quinta
  | 5 // sexta
  | 6 // sábado

type ContactInfoData = {
  Icon: LucideIcon
  label: string
  value: string
}

export type ContactInfo = Record<ContactInfoKey, ContactInfoData>

type InfoData = {
  label: string
  value: number
}

export type SessionPackageInfo = Record<SessionPackageInfoKey, InfoData>

type SessionSeparateInfo = Record<SessionSeparateInfoKey, InfoData>

export type Session = {
  id: string
  number: number
  date: string
  finish: boolean
  paid: PaidKey
}

export type ListPatient = {
  id: number
  name: string
  image: string | null
  typeService: TypeService

  startDate: Date
  daysOfWeek: WeekDay[]

  contactInfo: ContactInfo
  sessionPackageInfo?: SessionPackageInfo
  separateSessionInfo?: SessionSeparateInfo
  session: Session[]
}
