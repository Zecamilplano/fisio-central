import { LucideIcon } from "lucide-react"
import { Dispatch, SetStateAction } from "react"

export type PatientType = {
  firstName: string
  surName: string
  telephone: string
  street: string
  addressNumber: number | null
  noNumber: boolean
  neighborhood: string
  referenceHouse: string
}

export type PatientOptionalType = Partial<Record<keyof PatientType, string>>

export type totalNumberSessionType = {
  label: number | "+"
  value: number | "custom"
}

export type typeOfServiceParams = {
  selectedService: string | number | null
  customValueSession: string | number | null
  typeService: string
  setSelectedService: Dispatch<SetStateAction<string | number | null>>
  setCustomValueSession: Dispatch<SetStateAction<string | number | null>>
  setTypeService: Dispatch<SetStateAction<string>>
}

export type typeOfServiceDataType = {
  value: string
  titulo: string
  descricao: string
  Icone: LucideIcon
}

export type StepKey = "step1" | "step2" | "step3"

export type StepDataType = {
  active: boolean
  completed: boolean
}

export type StepType = Record<StepKey, StepDataType>

export type summaryCardType = {
  value: number
  label: string
}
