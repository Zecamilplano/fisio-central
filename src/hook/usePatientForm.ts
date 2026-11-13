"use client"

import { useMemo, useState } from "react"
import { validatePatient } from "@/lib/validators/patient"
import { usePatientFormStore } from "@/store/clinic/patientFormStore"
import { useRouter } from "next/navigation"
import { createPatient } from "@/lib/patients/createPatient"
import { toast } from "react-toastify"

export function usePatientForm() {
  const patient = usePatientFormStore((s) => s.patient)
  const setPatient = usePatientFormStore((s) => s.setPatient)
  const image = usePatientFormStore((s) => s.image)
  const setImage = usePatientFormStore((s) => s.setImage)
  const resetForm = usePatientFormStore((s) => s.resetForm)

  const errors = useMemo(() => validatePatient(patient), [patient])
  const isFormValid = Object.keys(errors).length === 0

  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // devolve true se salvou
  async function register(next: "add" | "view") {
    if (submitting || !isFormValid) return false

    setSubmitting(true)
    setSubmitError(null)

    const { id, error } = await createPatient(patient)

    if (error || !id) {
      setSubmitError(error ?? "Não foi possível cadastrar o paciente.")
      setSubmitting(false)
      return false
    }

    resetForm()
    toast.success("Paciente cadastrado!")
    setSubmitting(false)

    if (next === "view") router.push("/listar-pacientes") // ou a rota de detalhe, quando existir
    return true
  }

  return {
    patient,
    setPatient,
    image,
    setImage,
    errors,
    isFormValid,
    resetForm,
    register,
    submitting,
    submitError,
  }
}
