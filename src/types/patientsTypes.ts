import { LucideIcon } from "lucide-react"
import { Dispatch, SetStateAction } from "react"

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

export type stepDataType = {
  active: boolean
  completed: boolean
}

export type summaryCardType = {
  value: number
  label: string
}
