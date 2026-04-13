import { InitialStep } from "@/data/registerPatientData"
import { StepKey, StepType } from "@/types/patientsTypes"
import { useEffect, useRef, useState } from "react"
import { useGlobalPatient } from "@/context/patientContext"
import { useFormProfile } from "@/hook/useFormProfile"
import { scrollToFirstError } from "@/utils/form/scrollToFirstError"

function useRegisterPatient() {
  const [steps, setStep] = useState<StepType>(InitialStep)
  const { step1, step2, step3 } = steps
  const { isFormValid, hasValidPhoto } = useGlobalPatient()
  const form = useFormProfile()
  const formRef = useRef<HTMLFormElement>(null)
  const [shouldScroll, setShouldScroll] = useState(false)

  function handleNext(step: StepKey) {
    const hasErrorForm = form.validateAllFields()
    const hasErrorImage = !hasValidPhoto

    if (hasErrorForm || hasErrorImage) {
      if (hasErrorImage) {
        document.dispatchEvent(new Event("validateImage"))
      }

      setShouldScroll(true)
      return
    }

    setStep((prev) => ({
      ...prev,
      [step]: {
        ...prev[step],
        active: false,
        completed: true,
      },
    }))
  }

  useEffect(() => {
    if (!shouldScroll) return

    if (shouldScroll) {
      scrollToFirstError()
      setShouldScroll(false)
    }
  }, [shouldScroll, form.errorPatient])

  return { steps, step1, step2, step3, formRef, form, handleNext, isFormValid }
}

export { useRegisterPatient }
