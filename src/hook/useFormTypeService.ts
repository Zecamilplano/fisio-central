import { ErrorTypeService, PackageSelectType, TypeServiceType } from "@/types"
import { useEffect, useRef, useState } from "react"

function useFormTypeService() {
  const [serviceForm, setServiceForm] = useState({
    selectService: null as TypeServiceType | null,
    totalSessions: null as PackageSelectType | null,
  })
  const [error, setError] = useState<ErrorTypeService | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const inputRef = useRef<HTMLInputElement | null>(null)
  const isCustom = serviceForm.totalSessions === "custom"

  useEffect(() => {
    if (isCustom) {
      inputRef.current?.focus()
    }
  }, [isCustom])

  function handleChange<K extends keyof typeof serviceForm>(
    field: K,
    value: (typeof serviceForm)[K]
  ) {
    setServiceForm((prev) => {
      const newData = { ...prev, [field]: value }

      if (field === "selectService" && value === "sessoes") {
        newData.totalSessions = null
      }

      const newError = validateFormTypeService(newData)

      setError(newError)
      return newData
    })
  }

  function validateFormTypeService(form = serviceForm) {
    const newError: ErrorTypeService = { service: "" }

    if (!form.selectService) {
      newError.service = "Selecione o tipo de serviço"
    }

    const isInvalidTotalSessions =
      form.selectService === "pacote" &&
      (!form.totalSessions || form.totalSessions === "custom")

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
