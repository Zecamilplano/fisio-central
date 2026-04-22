import { totalNumberSession } from "@/data/registerPatientData"
import { LucideIcon } from "lucide-react"
import { Dispatch, SetStateAction } from "react"

export type TypeServiceType = "pacote" | "sessoes"

export type ErrorTypeService = {
  service: string
  package?: string
}

export type totalNumberSessionType = {
  label: number | "+"
  value: string
}
export type PackageSelectType = (typeof totalNumberSession)[number]["value"]

export type typeOfServiceParams = {
  selectedService: string | number | null
  customValueSession: string | number | null
  typeService: string
  setSelectedService: Dispatch<SetStateAction<string | number | null>>
  setCustomValueSession: Dispatch<SetStateAction<string | number | null>>
  setTypeService: Dispatch<SetStateAction<string>>
}

export type serviceTypeOptionsDataType = {
  value: TypeServiceType
  titulo: string
  descricao: string
  Icone: LucideIcon
}
