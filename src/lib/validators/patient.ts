import { PatientType } from "@/types"
import { registerPatientLimits as limits } from "@/data/fieldLimits"

export type PatientErrors = Partial<
  Record<
    | "firstName"
    | "surName"
    | "telephone"
    | "street"
    | "addressNumber"
    | "neighborhood"
    | "referenceHouse",
    string
  >
>

export const normalizeText = (v: string) => v.trim().replace(/\s+/g, " ")
export const onlyDigits = (v: string) => v.replace(/\D/g, "")

function checkRequired(value: string, label: string, min: number, max: number) {
  const v = normalizeText(value)
  if (!v) return `Informe ${label}.`
  if (v.length < min) return `Mínimo de ${min} caracteres.`
  if (v.length > max) return `Máximo de ${max} caracteres.`
}

export function validatePatient(p: PatientType): PatientErrors {
  const errors: PatientErrors = {}
  const a = p.address

  const firstName = checkRequired(p.firstName, "o primeiro nome", 2, limits.firstName)
  if (firstName) errors.firstName = firstName

  const surName = checkRequired(p.surName, "o sobrenome", 2, limits.surName)
  if (surName) errors.surName = surName

  const phone = onlyDigits(a.telephone)
  if (!phone) errors.telephone = "Informe o telefone."
  else if (phone.length < 10 || phone.length > 11)
    errors.telephone = "Informe o DDD e o número (10 ou 11 dígitos)."

  const street = checkRequired(a.street, "a rua", 3, limits.street)
  if (street) errors.street = street

  const neighborhood = checkRequired(a.neighborhood, "o bairro", 2, limits.neighborhood)
  if (neighborhood) errors.neighborhood = neighborhood

  if (!a.noNumber) {
    const n = a.addressNumber
    if (n === null)
      errors.addressNumber = 'Informe o número ou marque "sem número".'
    else if (!Number.isInteger(n) || n <= 0 || n > limits.addressNumber)
      errors.addressNumber = "Número inválido."
  }

  if (normalizeText(a.referenceHouse).length > limits.referenceHouse)
    errors.referenceHouse = `Máximo de ${limits.referenceHouse} caracteres.`

  return errors
}
