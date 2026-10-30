"use client"
import { useGlobalPatient } from "@/context/patientContext"
import { PatientOptionalType, PatientType } from "@/types/registerPatientsTypes"
import { formatTelephone, unformatPhone } from "@/utils/form/phone"
import { registerPatientLimits } from "@/data/registerPatientLimits"
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

  useEffect(() => {
    const persistentMessages = new Set([
      "Nome obrigatório",
      "Sobrenome obrigatório",
      "Telefone obrigatório",
      "Rua obrigatória",
      "Número obrigatório",
      "Bairro obrigatório",
    ])
    const hasTransientError = Object.values(errorPatient).some(
      (message) => Boolean(message) && !persistentMessages.has(message!)
    )
    if (!hasTransientError) return

    const errorSnapshot = errorPatient
    const timer = setTimeout(() => {
      setErrorPatient((current) => {
        const next = { ...current }
        for (const [field, message] of Object.entries(errorSnapshot)) {
          if (
            message &&
            !persistentMessages.has(message) &&
            current[field as keyof PatientOptionalType] === message
          ) {
            next[field as keyof PatientOptionalType] = ""
          }
        }
        return next
      })
    }, 5000)

    return () => clearTimeout(timer)
  }, [errorPatient])

  type ProfileField =
    | "firstName"
    | "surName"
    | `address.${keyof PatientType["address"] & string}`

  // Função para obter dados dos input nome, sobrenome, rua etc..
  function handleChange(
    field: ProfileField,
    value: string | number | null | boolean
  ) {
    const [section, key] = field.split(".")
    const addressKey =
      section === "address" ? (key as keyof PatientType["address"]) : null
    let formatted = value

    if (field === "address.telephone" && typeof value === "string") {
      formatted = formatTelephone(value)
    }

    if (field === "address.addressNumber") {
      const numValue = value === null ? null : Number(value)
      formatted = numValue
    }

    setPatient((prev) =>
      section === "address"
        ? ({
            ...prev,
            address: { ...prev.address, [addressKey!]: formatted },
          } as PatientType)
        : ({ ...prev, [field]: formatted } as PatientType)
    )

    if (debounceRef.current[field]) {
      clearTimeout(debounceRef.current[field])
    }

    debounceRef.current[field] = setTimeout(() => {
      const dataSaved = JSON.parse(localStorage.getItem("formProfile") || "{}")

      const [savedSection, savedKey] = field.split(".")
      const newData =
        savedSection === "address"
          ? {
              ...dataSaved,
              address: { ...dataSaved.address, [savedKey]: formatted },
            }
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
      "address.telephone": "Informe um telefone com DDD e 10 ou 11 dígitos",
      "address.street": "Rua obrigatória",
      "address.addressNumber": "Número obrigatório",
      "address.noNumber": "",
      "address.neighborhood": "Bairro obrigatório",
      "address.referenceHouse": "",
    }

    let hasError = false
    let message = messages[field]

    // 🧠 valida dependendo do tipo
    if (typeof value === "string") {
      hasError = !value.trim()
      const normalizedValue = value.trim()

      if (
        (field === "firstName" || field === "surName") &&
        normalizedValue.length > 0 &&
        !/^[\p{L}\p{M}\s'.-]+$/u.test(normalizedValue)
      ) {
        hasError = true
        message = "Use apenas letras, espaços, hífen, apóstrofo ou ponto."
      }

      if (
        (field === "firstName" || field === "surName") &&
        normalizedValue.length > 0 &&
        normalizedValue.length < 2 &&
        /^[\p{L}\p{M}\s'.-]+$/u.test(normalizedValue)
      ) {
        hasError = true
        message = "Digite pelo menos 2 caracteres."
      }

      const maxLengthByField: Partial<Record<ProfileField, number>> = {
        firstName: registerPatientLimits.firstName,
        surName: registerPatientLimits.surName,
        "address.street": registerPatientLimits.street,
        "address.neighborhood": registerPatientLimits.neighborhood,
        "address.referenceHouse": registerPatientLimits.referenceHouse,
      }
      const maxLength = maxLengthByField[field]
      if (maxLength && value.length > maxLength) {
        hasError = true
        message = `Use no máximo ${maxLength} caracteres.`
      }
    }

    if (field === "address.telephone" && typeof value === "string") {
      const digitCount = unformatPhone(value).length
      hasError = digitCount !== 10 && digitCount !== 11
      if (!value.trim()) message = "Telefone obrigatório"
      if (digitCount > registerPatientLimits.telephoneDigits) {
        message = `Use no máximo ${registerPatientLimits.telephoneDigits} números, incluindo o DDD.`
      }
    }

    if (field === "address.referenceHouse" && !String(value ?? "").trim()) {
      setErrorPatient((prev) => ({ ...prev, referenceHouse: "" }))
      return false
    }
    if (field === "address.addressNumber") {
      const hasError =
        !patient.address.noNumber &&
        (typeof value !== "number" ||
          !Number.isInteger(value) ||
          value < 1 ||
          value > registerPatientLimits.addressNumber)

      setErrorPatient((prev) => ({
        ...prev,
        addressNumber: hasError
          ? value === null
            ? "Número obrigatório"
            : "Informe um número inteiro entre 1 e 999999, ou marque ‘Sem número’."
          : "",
      }))

      return hasError
    }

    if (hasError) {
      setErrorPatient((prev) => ({
        ...prev,
        [field]: message,
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

  function resetPatient() {
    Object.values(debounceRef.current).forEach(clearTimeout)
    debounceRef.current = {}

    const emptyPatient: PatientType = {
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
    }

    setPatient(emptyPatient)
    setErrorPatient({})
    setPatientGlobal(emptyPatient)
    localStorage.removeItem("formProfile")
  }

  useEffect(() => {
    const data = localStorage.getItem("formProfile")

    if (data) {
      const parsed = JSON.parse(data)

      // Compatibilidade com formulários salvos antes da estrutura address.
      const migrated: PatientType = {
        firstName: String(parsed.firstName ?? "").slice(
          0,
          registerPatientLimits.firstName
        ),
        surName: String(parsed.surName ?? "").slice(
          0,
          registerPatientLimits.surName
        ),
        address: {
          telephone: formatTelephone(
            String(parsed.address?.telephone ?? parsed.telephone ?? "")
          ),
          street: String(parsed.address?.street ?? parsed.street ?? "").slice(
            0,
            registerPatientLimits.street
          ),
          addressNumber: (() => {
            const number = Number(
              parsed.address?.addressNumber ?? parsed.addressNumber
            )
            return Number.isInteger(number) &&
              number >= 1 &&
              number <= registerPatientLimits.addressNumber
              ? number
              : null
          })(),
          noNumber: Boolean(parsed.address?.noNumber ?? parsed.noNumber),
          neighborhood: String(
            parsed.address?.neighborhood ?? parsed.neighborhood ?? "Centro"
          ).slice(0, registerPatientLimits.neighborhood),
          referenceHouse: String(
            parsed.address?.referenceHouse ?? parsed.referenceHouse ?? ""
          ).slice(0, registerPatientLimits.referenceHouse),
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
    resetPatient,
    handleChange,
    handleErrors,
    validateAllFields,
  }
}
export { useFormProfile }
