// ================================
// Shared Types
// ================================

export type Exercise = {
  id: string
  name: string
  details: string
}

export type VitalSigns = {
  bloodPressure: string
  heartRate: string
  respiratoryRate: string
  oxygenSaturation: string
  observations: string
}

// ================================
// Form
// ================================

export type EvolutionFormData = {
  goals: string[]
  complications: string | null

  exercises: Exercise[]

  vitalSigns: VitalSigns

  conducts: string[]
  orientations: string[]

  progress: string

  painBefore: number | null
  painAfter: number | null

  nextConducts: string[]
}

// ================================
// Saved Evolution
// ================================

export type Evolution = EvolutionFormData & {
  id: string
  sessionId: string
  patientId: string

  professionalName: string
  professionalRegistration: string
}

export type EvolutionFormErrors = Partial<
  Record<keyof EvolutionFormData | "painScale", string>
>

// ================================
// Form Props
// ================================

export type EvolutionFormProps = {
  mode?: "create" | "edit"

  initialData?: EvolutionFormData

  onCancel: () => void
  onSave: (data: EvolutionSaveData) => void
}

// Use evolution form

export type StringListField =
  | "goals"
  | "conducts"
  | "orientations"
  | "nextConducts"

export type ExerciseField = "name" | "details"

export type UseEvolutionFormParams = Pick<
  EvolutionFormProps,
  "initialData" | "onSave"
>

export type WarningField =
  | "goals"
  | "conducts"
  | "orientations"
  | "nextConducts"
  | "exercises"
  | "complications"
  | "progress"
  | "updatePainBefore"
  | "updatePainAfter"
  | keyof VitalSigns

export type EvolutionSaveData = Omit<
  EvolutionFormData,
  "complications" | "progress" | "painBefore" | "painAfter"
> & {
  complications?: string
  progress?: string
  painBefore?: number
  painAfter?: number
}
export type TemporaryWarning = {
  field: WarningField
  message: string
}
