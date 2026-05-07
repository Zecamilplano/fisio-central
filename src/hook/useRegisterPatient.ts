import { InitialStep } from "@/data/registerPatientData"
import { StepKey, StepType } from "@/types/registerPatientsTypes"
import { useEffect, useRef, useState } from "react"
import { useGlobalPatient } from "@/context/patientContext"
import { useFormProfile } from "@/hook/useFormProfile"
import { scrollToFirstError } from "@/utils/form/scrollToFirstError"
import { useFormTypeService } from "./useFormTypeService"
import { useSchedulingSessions } from "./useSchedulingSessions"

function useRegisterPatient() {
  const [steps, setStep] = useState<StepType>(InitialStep)
  const { step1, step2, step3 } = steps
  const { isFormValid, hasValidPhoto } = useGlobalPatient()
  const formProfile = useFormProfile()
  const formTypeService = useFormTypeService()

  const formScheduling = useSchedulingSessions(
    formTypeService.serviceForm.totalSessions ?? 0,
    formTypeService.serviceForm.selectService
  )

  const formRef = useRef<HTMLFormElement>(null)
  const [shouldScroll, setShouldScroll] = useState(false)

  const isNextActive = step2.active && formTypeService.validate(false)

  function handlePrev(current: StepKey, previous: StepKey) {
    setStep((prev) => ({
      ...prev,
      [current]: {
        ...prev[current],
        active: false,
      },
      [previous]: {
        ...prev[previous],
        active: true,
        completed: false,
      },
    }))
  }

  function handleNext(step: StepKey) {
    // console.log("step recebido", step, typeof step)

    if (step === "step1") {
      const hasErrorForm = formProfile.validateAllFields()
      const hasErrorImage = !hasValidPhoto

      if (hasErrorImage) {
        document.dispatchEvent(new Event("validateImage"))
      }

      const hasErrorFormProfile = hasErrorForm || hasErrorImage
      if (!hasErrorFormProfile) return

      setStep((prev) => {
        const next = {
          ...prev,
          step1: { ...prev.step1, active: false, completed: true },
          step2: { ...prev.step2, active: true },
        }

        return next
      })
    }

    if (step === "step2") {
      formTypeService.setSubmitted(true)

      const isValid = formTypeService.validate(true)

      if (!isValid) return

      setStep((prev) => {
        // console.log("step dentro do setStep:", step)
        // console.log("step === step1:", step === "step2")
        if (step === "step2") {
          const next = {
            ...prev,
            step2: { ...prev.step2, active: false, completed: true },
            step3: { ...prev.step3, active: true },
          }
          // console.log("novo estado:", next) // ← o step2.active está true aqui?
          return next
        }
        return prev
      })
    }
  }

  useEffect(() => {
    if (!shouldScroll) return

    if (shouldScroll) {
      scrollToFirstError()
      setShouldScroll(false)
    }
  }, [shouldScroll, formProfile.errorPatient])

  useEffect(() => {
    setStep((prev) => ({
      ...prev,
      step3: {
        ...prev.step3,
        completed: formScheduling.isSchedulingFormValid,
      },
    }))
  }, [formScheduling.isSchedulingFormValid])

  function handleStepClick(stepKey: StepKey) {
    const stepOrder: StepKey[] = ["step1", "step2", "step3"]
    const clickedIndex = stepOrder.indexOf(stepKey)

    if (clickedIndex > 0 && !steps[stepOrder[clickedIndex - 1]].completed)
      return

    setStep((prev) => {
      const updated = { ...prev }

      stepOrder.forEach((key, index) => {
        updated[key] = {
          ...prev[key],
          active: index === clickedIndex,
        }
      })
      return updated
    })
  }

  return {
    steps,
    step1,
    step2,
    step3,
    formRef,
    formProfile,
    formTypeService,
    formScheduling,
    handlePrev,
    handleNext,
    handleStepClick,
    isFormValid,
    isNextActive,
  }
}

export { useRegisterPatient }
