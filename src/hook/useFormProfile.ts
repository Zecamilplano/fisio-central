"use client"

import { useGlobalPatient } from "@/context/patientContext"
import { PatientOptionalType, PatientType } from "@/types/patientsTypes"
import { formatTelephone } from "@/utils/form/phone"
import { useState, useRef, useEffect } from "react"

function useFormProfile() {
  const [patient, setPatient] = useState<PatientType>({
    firstName: "",
    surName: "",
    telephone: "",
    street: "",
    addressNumber: null,
    noNumber: false,
    neighborhood: "Centro",
    referenceHouse: "",
  })
  const [errorPatient, setErrorPatient] = useState<PatientOptionalType>({})

  const debounceRef = useRef<Record<string, NodeJS.Timeout>>({})

  // Função para obter dados dos input nome, sobrenome, rua etc..
  function handleChange<K extends keyof PatientType>(
    field: K,
    value: PatientType[K]
  ) {
    let formatted: PatientType[K] = value

    if (field === "telephone" && typeof value === "string") {
      formatted = formatTelephone(value) as PatientType[K]
    }

    if (field === "addressNumber") {
      const numValue = value === "" ? null : Number(value)

      formatted = numValue as PatientType[K]
    }

    setPatient(
      (prev) =>
        ({
          ...prev,
          [field]: formatted,
        }) as PatientType
    )

    if (debounceRef.current[field]) {
      clearTimeout(debounceRef.current[field])
    }

    debounceRef.current[field] = setTimeout(() => {
      const dataSaved = JSON.parse(localStorage.getItem("formProfile") || "{}")

      const newData = {
        ...dataSaved,
        [field]: value,
      }

      localStorage.setItem("formProfile", JSON.stringify(newData))

      // console.log("Salvou", field, value)
    }, 800)
  }

  function handleErrors<K extends keyof PatientType>(
    field: K,
    value: PatientType[K]
  ) {
    const messages: Record<keyof PatientType, string> = {
      firstName: "Nome obrigatório",
      surName: "Sobrenome obrigatório",
      telephone: "Telefone obrigatório",
      street: "Rua obrigatória",
      addressNumber: "Número obrigatório",
      noNumber: "", // sem erro direto
      neighborhood: "Bairro obrigatório",
      referenceHouse: "",
    }

    let hasError = false

    // 🧠 valida dependendo do tipo
    if (typeof value === "string") {
      hasError = !value.trim()
    }

    if (field === "addressNumber") {
      const hasError = !patient.noNumber && value === null

      setErrorPatient((prev) => ({
        ...prev,
        addressNumber: hasError ? messages.addressNumber : "",
      }))

      return hasError
    }

    if (hasError) {
      setErrorPatient((prev) => ({
        ...prev,
        [field]: messages[field],
      }))
    } else {
      setErrorPatient((prev) => ({
        ...prev,
        [field]: "",
      }))
    }

    return hasError
  }

  function validateAllFields() {
    const fields = Object.entries(patient)

    let hasError = false

    fields.forEach(([field, value]) => {
      const error = handleErrors(field as keyof PatientType, value as any)

      if (error) hasError = true
    })

    return hasError
  }

  useEffect(() => {
    const data = localStorage.getItem("formProfile")

    if (data) {
      const parsed = JSON.parse(data)

      setPatient((prev) => ({
        ...prev,
        ...parsed,
      }))
    }
  }, [])

  const { setPatientGlobal } = useGlobalPatient()

  useEffect(() => {
    const timeout = setTimeout(() => {
      setPatientGlobal(patient)
    }, 800)

    return () => clearTimeout(timeout)
  }, [patient])

  return {
    patient,
    setPatient,
    errorPatient,
    setErrorPatient,
    handleChange,
    handleErrors,
    validateAllFields,
  }
}
export { useFormProfile }
