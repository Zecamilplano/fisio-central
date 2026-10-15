"use client"

import { useEffect, useRef, useState, type FormEvent } from "react"
import { scrollToFirstError } from "@/utils/form/scrollToFirstError"

export type FirstRegistrationValues = {
  firstName: string
  surName: string
  email: string
  password: string
  confirmPassword: string
  crefito: string
}

export type FirstRegistrationField = keyof FirstRegistrationValues
type FirstRegistrationErrors = Partial<Record<FirstRegistrationField, string>>

const initialValues: FirstRegistrationValues = {
  firstName: "",
  surName: "",
  email: "",
  password: "",
  confirmPassword: "",
  crefito: "",
}

const fieldOrder: FirstRegistrationField[] = [
  "firstName",
  "surName",
  "email",
  "password",
  "confirmPassword",
  "crefito",
]

function validateForm(values: FirstRegistrationValues): FirstRegistrationErrors {
  const errors: FirstRegistrationErrors = {}
  const firstName = values.firstName.trim()
  const surName = values.surName.trim()
  const email = values.email.trim()
  const crefito = values.crefito.trim()

  if (!firstName) {
    errors.firstName = "Informe seu primeiro nome."
  } else if (firstName.length < 2) {
    errors.firstName = "Digite pelo menos 2 caracteres."
  } else if (firstName.length > 60) {
    errors.firstName = "Use no máximo 60 caracteres."
  }

  if (!surName) {
    errors.surName = "Informe seu sobrenome."
  } else if (surName.length < 2) {
    errors.surName = "Digite pelo menos 2 caracteres."
  } else if (surName.length > 80) {
    errors.surName = "Use no máximo 80 caracteres."
  }

  if (!email) {
    errors.email = "Informe seu email."
  } else if (email.length > 254) {
    errors.email = "Use no máximo 254 caracteres."
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    errors.email = "Digite um email válido."
  }

  if (!values.password.trim()) {
    errors.password = "Informe sua senha."
  } else if (values.password.length < 8) {
    errors.password = "A senha precisa ter pelo menos 8 caracteres."
  } else if (values.password.length > 64) {
    errors.password = "Use no máximo 64 caracteres."
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = "Confirme sua senha."
  } else if (values.confirmPassword.length < 8) {
    errors.confirmPassword = "A confirmação precisa ter pelo menos 8 caracteres."
  } else if (values.confirmPassword.length > 64) {
    errors.confirmPassword = "Use no máximo 64 caracteres."
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = "As senhas não coincidem."
  }

  if (!crefito) {
    errors.crefito = "Informe seu número de CREFITO."
  } else if (crefito.length > 30) {
    errors.crefito = "Use no máximo 30 caracteres."
  }

  return errors
}

export function useFirstRegistration() {
  const [values, setValues] = useState<FirstRegistrationValues>(initialValues)
  const [errors, setErrors] = useState<FirstRegistrationErrors>({})
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false)
  const [shouldFocusFirstError, setShouldFocusFirstError] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (!shouldFocusFirstError) return

    scrollToFirstError(formRef.current ?? undefined)
    setShouldFocusFirstError(false)
  }, [errors, shouldFocusFirstError])

  function handleChange(field: FirstRegistrationField, value: string) {
    const nextValues = { ...values, [field]: value }
    setValues(nextValues)

    if (hasAttemptedSubmit) {
      setErrors(validateForm(nextValues))
      return
    }

    const fieldErrors = validateForm(nextValues)
    setErrors((previous) => ({
      ...previous,
      [field]: fieldErrors[field] ?? "",
      ...(field === "confirmPassword" ||
      (field === "password" && nextValues.confirmPassword)
        ? { confirmPassword: fieldErrors.confirmPassword ?? "" }
        : {}),
    }))
  }

  function handleBlur(field: FirstRegistrationField) {
    const fieldErrors = validateForm(values)
    setErrors((previous) => ({
      ...previous,
      [field]: fieldErrors[field] ?? "",
      ...(field === "password" && values.confirmPassword
        ? { confirmPassword: fieldErrors.confirmPassword ?? "" }
        : {}),
    }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setHasAttemptedSubmit(true)

    const nextErrors = validateForm(values)
    setErrors(nextErrors)

    if (fieldOrder.some((field) => nextErrors[field])) {
      setShouldFocusFirstError(true)
    }
  }

  return { values, errors, formRef, handleChange, handleBlur, handleSubmit }
}
