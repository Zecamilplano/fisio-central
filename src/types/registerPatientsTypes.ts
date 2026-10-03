export type PatientAddressType = {
  telephone: string
  street: string
  addressNumber: number | null
  noNumber: boolean
  neighborhood: string
  referenceHouse: string
}

export type PatientType = {
  firstName: string
  surName: string
  address: PatientAddressType
}

export type PatientOptionalType = Partial<
  Record<keyof PatientAddressType | "firstName" | "surName", string>
>

export type StepKey = "step1" | "step2" | "step3"

export type StepDataType = {
  active: boolean
  completed: boolean
}

export type StepType = Record<StepKey, StepDataType>
