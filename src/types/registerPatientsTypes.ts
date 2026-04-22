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
