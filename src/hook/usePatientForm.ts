"use client"

import { useMemo } from "react"
import { validatePatient } from "@/lib/validators/patient"
import { usePatientFormStore } from "@/store/clinic/patientFormStore"

// Estado compartilhado dos dados pessoais do cadastro (validação incluída).
// O salvamento fica em useRegisterPatient -> services/patients/patientRepository.
export function usePatientForm() {
  const patient = usePatientFormStore((s) => s.patient)
  const setPatient = usePatientFormStore((s) => s.setPatient)
  const image = usePatientFormStore((s) => s.image)
  const setImage = usePatientFormStore((s) => s.setImage)
  const resetForm = usePatientFormStore((s) => s.resetForm)

  const errors = useMemo(() => validatePatient(patient), [patient])
  const isFormValid = Object.keys(errors).length === 0

  return {
    patient,
    setPatient,
    image,
    setImage,
    errors,
    isFormValid,
    resetForm,
  }
}
