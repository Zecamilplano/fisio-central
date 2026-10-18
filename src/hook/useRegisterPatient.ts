import { InitialStep } from "@/data/registerPatientData"
import { StepKey, StepType } from "@/types/registerPatientsTypes"
import { useEffect, useRef, useState } from "react"
import { useGlobalPatient } from "@/context/patientContext"
import { useFormProfile } from "@/hook/useFormProfile"
import { scrollToFirstError } from "@/utils/form/scrollToFirstError"
import { useFormTypeService } from "./useFormTypeService"
import { useSchedulingSessions } from "./useSchedulingSessions"
import { createPatient, getPatientById } from "@/services/patients/patientRepository"
import { toast } from "react-toastify"

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
  const [restoreStatus, setRestoreStatus] = useState<"checking" | "ready" | "error">("checking")
  const patientCreated = useRef(false)
  const creatingPatient = useRef(false)

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

  useEffect(() => {
    let cancelled = false
    const patientId = localStorage.getItem("createdPatientId")

    if (!patientId) {
      setRestoreStatus("ready")
      return () => {
        cancelled = true
      }
    }

    // Evita inserir novamente enquanto confirma no banco o paciente já salvo.
    patientCreated.current = true
    const savedStep = localStorage.getItem("patientRegistrationStep")
    const activeStep: StepKey =
      savedStep === "step1" || savedStep === "step2" || savedStep === "step3"
        ? savedStep
        : "step2"

    void getPatientById(patientId)
      .then((patient) => {
        if (cancelled) return

        if (!patient) {
          localStorage.removeItem("createdPatientId")
          localStorage.setItem("patientRegistrationStep", "step1")
          patientCreated.current = false
          setStep(InitialStep)
          setRestoreStatus("ready")
          return
        }

        formProfile.setPatient(patient)
        localStorage.setItem("formProfile", JSON.stringify(patient))
        setStep({
          step1: {
            active: activeStep === "step1",
            completed: activeStep !== "step1",
          },
          step2: {
            active: activeStep === "step2",
            completed: activeStep === "step3",
          },
          step3: { active: activeStep === "step3", completed: false },
        })
        setRestoreStatus("ready")
      })
      .catch((error: unknown) => {
        if (cancelled) return
        setRestoreStatus("error")
        toast.error(
          error instanceof Error
            ? `Não foi possível recuperar o paciente: ${error.message}`
            : "Não foi possível recuperar o paciente salvo."
        )
      })

    return () => {
      cancelled = true
    }
  }, [formProfile.setPatient])

  useEffect(() => {
    const activeStep = (Object.keys(steps) as StepKey[]).find(
      (step) => steps[step].active
    )

    if (activeStep) {
      localStorage.setItem("patientRegistrationStep", activeStep)
    }
  }, [steps])

  async function handleNext(step: StepKey, photo?: File) {
    // console.log("step recebido", step, typeof step)

    if (step === "step1") {
      if (restoreStatus !== "ready") return

      const hasErrorForm = formProfile.validateAllFields()
      // const hasErrorImage = !hasValidPhoto
      const hasErrorImage = false

      if (hasErrorImage) {
        document.dispatchEvent(new Event("validateImage"))
      }

      const hasErrorFormProfile = hasErrorForm || hasErrorImage
      if (hasErrorFormProfile) {
        setShouldScroll(true)
        return
      }

      if (patientCreated.current) {
        setStep((prev) => ({
          ...prev,
          step1: { ...prev.step1, active: false, completed: true },
          step2: { ...prev.step2, active: true },
        }))
        return
      }

      if (creatingPatient.current) return
      creatingPatient.current = true

      try {
        const patientId = await createPatient(formProfile.patient, photo)

        localStorage.setItem("createdPatientId", patientId)

        patientCreated.current = true

        toast.success("Dados pessoais do paciente salvos com sucesso!")

        setStep((prev) => ({
          ...prev,
          step1: { ...prev.step1, active: false, completed: true },
          step2: { ...prev.step2, active: true },
        }))
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Não foi possível cadastrar o paciente."
        )
      } finally {
        creatingPatient.current = false
      }
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
