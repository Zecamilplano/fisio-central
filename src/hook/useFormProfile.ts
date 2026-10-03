"use client"
import { useGlobalPatient } from "@/context/patientContext"
import { PatientOptionalType, PatientType } from "@/types/registerPatientsTypes"
import { formatTelephone } from "@/utils/form/phone"
import { useState, useRef, useEffect } from "react"

function useFormProfile() {
  const [patient, setPatient] = useState<PatientType>({
    firstName: "",
    surName: "",
    address: {
      telephone: "",
      street: "",
      addressNumber: null,
      noNumber: false,
      neighborhood: "Centro",
      referenceHouse: "",
    },
  })
  const [errorPatient, setErrorPatient] = useState<PatientOptionalType>({})

  const debounceRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  type ProfileField = "firstName" | "surName" | `address.${keyof PatientType["address"] & string}`

  // Função para obter dados dos input nome, sobrenome, rua etc..
  function handleChange(
    field: ProfileField,
    value: string | number | null | boolean
  ) {
    const [section, key] = field.split(".")
    const addressKey = section === "address" ? key as keyof PatientType["address"] : null
    let formatted = value

    if (field === "address.telephone" && typeof value === "string") {
      formatted = formatTelephone(value)
    }

    if (field === "address.addressNumber") {
      const numValue = value === null ? null : Number(value)
      formatted = numValue
    }

    setPatient((prev) => section === "address"
      ? { ...prev, address: { ...prev.address, [addressKey!]: formatted } } as PatientType
      : { ...prev, [field]: formatted } as PatientType)

    if (debounceRef.current[field]) {
      clearTimeout(debounceRef.current[field])
    }

    debounceRef.current[field] = setTimeout(() => {
      const dataSaved = JSON.parse(localStorage.getItem("formProfile") || "{}")

      const [savedSection, savedKey] = field.split(".")
      const newData = savedSection === "address"
        ? { ...dataSaved, address: { ...dataSaved.address, [savedKey]: formatted } }
        : { ...dataSaved, [field]: formatted }

      localStorage.setItem("formProfile", JSON.stringify(newData))

      // console.log("Salvou", field, value)
    }, 800)
  }

  function handleErrors(
    field: ProfileField,
    value: string | number | null | boolean
  ) {
    const messages: Record<ProfileField, string> = {
      firstName: "Nome obrigatório",
      surName: "Sobrenome obrigatório",
      "address.telephone": "Telefone obrigatório",
      "address.street": "Rua obrigatória",
      "address.addressNumber": "Número obrigatório",
      "address.noNumber": "",
      "address.neighborhood": "Bairro obrigatório",
      "address.referenceHouse": "",
    }

    let hasError = false

    // 🧠 valida dependendo do tipo
    if (typeof value === "string") {
      hasError = !value.trim()
    }

    if (field === "address.addressNumber") {
      const hasError = !patient.address.noNumber && value === null

      setErrorPatient((prev) => ({
        ...prev,
        addressNumber: hasError ? messages[field] : "",
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
    const fields: [ProfileField, string | number | null | boolean][] = [
      ["firstName", patient.firstName],
      ["surName", patient.surName],
      ["address.telephone", patient.address.telephone],
      ["address.street", patient.address.street],
      ["address.addressNumber", patient.address.addressNumber],
      ["address.noNumber", patient.address.noNumber],
      ["address.neighborhood", patient.address.neighborhood],
      ["address.referenceHouse", patient.address.referenceHouse],
    ]
    let hasError = false
    fields.forEach(([field, value]) => {
      if (handleErrors(field, value)) hasError = true
    })
    return hasError
  }

  useEffect(() => {
    const data = localStorage.getItem("formProfile")

    if (data) {
      const parsed = JSON.parse(data)

      // Compatibilidade com formulários salvos antes da estrutura address.
      const migrated: PatientType = {
        firstName: parsed.firstName ?? "",
        surName: parsed.surName ?? "",
        address: {
          telephone: parsed.address?.telephone ?? parsed.telephone ?? "",
          street: parsed.address?.street ?? parsed.street ?? "",
          addressNumber: parsed.address?.addressNumber ?? parsed.addressNumber ?? null,
          noNumber: parsed.address?.noNumber ?? parsed.noNumber ?? false,
          neighborhood: parsed.address?.neighborhood ?? parsed.neighborhood ?? "Centro",
          referenceHouse: parsed.address?.referenceHouse ?? parsed.referenceHouse ?? "",
        },
      }
      setPatient(migrated)
      localStorage.setItem("formProfile", JSON.stringify(migrated))
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
