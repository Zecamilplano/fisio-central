import { ErrorTypeService, ServiceForm } from "@/types"
import { useEffect, useRef, useState } from "react"

const serviceFormData: ServiceForm = {
  selectService: null,
  totalSessions: null,
  selectPackage: null,
  priceSession: "60",
}

const STORAGE_KEY = "typeServiceForm"

function useFormTypeService() {
  const [serviceForm, setServiceForm] = useState<ServiceForm>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : serviceFormData
    } catch {
      return serviceFormData
    }
  })
  const [error, setError] = useState<ErrorTypeService | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const inputRef = useRef<HTMLInputElement | null>(null)
  const isCustom = serviceForm?.selectPackage === "custom"

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(serviceForm))
    } catch {
      console.error("Erro ao salvar no localStorage.")
    }
  }, [serviceForm])

  useEffect(() => {
    if (isCustom) {
      inputRef.current?.focus()
    }
  }, [isCustom])

  function handleChange<K extends keyof typeof serviceForm>(
    field: K,
    value: (typeof serviceForm)[K]
  ) {
    console.log(`field ${field}: value ${value}`)

    setServiceForm((prev) => {
      const newData = { ...prev, [field]: value }

      if (field === "selectService" && value === "sessoes") {
        newData.totalSessions = null
      }

      if (field === "selectPackage") {
        if (value !== "custom") {
          newData.totalSessions = Number(value) // converte direto pra number
        } else {
          newData.totalSessions = null // aguarda digitar
        }
      }

      if (field === "selectService" && value === "sessoes") {
        newData.totalSessions = null
        newData.selectPackage = null
      }

      const newError = validateFormTypeService(newData)

      setError(newError)
      // console.log("teste", serviceForm.selectPackage)
      return newData
    })
  }

  function validateFormTypeService(form = serviceForm) {
    const newError: ErrorTypeService = { service: "" }

    if (!form.selectService) {
      newError.service = "Selecione o tipo de serviço"
    }

    const isInvalidTotalSessions =
      form.selectService === "pacote" && !form.totalSessions

    if (isInvalidTotalSessions) {
      newError.package = "Escolha a quantidade de sessões"
    }

    return newError
  }

  function validate(showError = true) {
    const newError = validateFormTypeService()

    if (showError) {
      setError(newError)
    }

    return !newError.service && !newError.package
  }

  return {
    serviceForm,
    setServiceForm,
    error,
    handleChange,
    validateFormTypeService,
    submitted,
    setSubmitted,
    inputRef,
    validate,
  }
}

export { useFormTypeService }
