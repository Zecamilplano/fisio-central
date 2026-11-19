import type { DayOfWeek, ListPatient } from "@/types"
import type { PatientType } from "@/types/registerPatientsTypes"
import { daysOfWeek } from "@/data"
import { format, getDay, parseISO } from "date-fns"
import { unformatPhone } from "@/utils/form/phone"
import { registerPatientLimits } from "@/data/fieldLimits"

export type FormErrors = Partial<
  Record<
    | "firstName"
    | "surName"
    | "telephone"
    | "street"
    | "addressNumber"
    | "neighborhood"
    | "referenceHouse"
    | "photo"
    | "schedule",
    string
  >
>

// mesmos limites do cadastro (e do banco): fonte única em src/data/fieldLimits.ts
export const characterLimits = {
  firstName: registerPatientLimits.firstName,
  surName: registerPatientLimits.surName,
  street: registerPatientLimits.street,
  neighborhood: registerPatientLimits.neighborhood,
  referenceHouse: registerPatientLimits.referenceHouse,
} as const

export const inputBaseClass =
  "w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition"

export function fieldClass(error?: string) {
  return error
    ? `${inputBaseClass} border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100`
    : `${inputBaseClass} border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-100`
}

export function normalizedPatient(patient: PatientType) {
  return {
    firstName: patient.firstName.trim(),
    surName: patient.surName.trim(),
    telephone: unformatPhone(patient.address.telephone),
    street: patient.address.street.trim(),
    addressNumber: patient.address.noNumber
      ? null
      : patient.address.addressNumber,
    noNumber: patient.address.noNumber,
    neighborhood: patient.address.neighborhood.trim(),
    referenceHouse: patient.address.referenceHouse.trim(),
  }
}

export function getGlobalScheduleDefaults(patient: ListPatient) {
  const pendingSessions = patient.session
    .filter((session) => session.finish === "pendente")
    .sort((a, b) => a.date.localeCompare(b.date) || a.number - b.number)
  const startDate =
    pendingSessions[0]?.date.slice(0, 10) ?? format(patient.startDate, "yyyy-MM-dd")

  const currentPackage =
    patient.typeService === "Pacote"
      ? patient.packages.find((item) => item.current) ?? patient.packages.at(-1)
      : undefined
  const days = currentPackage?.fixedWeekDays.length
    ? [...currentPackage.fixedWeekDays]
    : [
        ...new Set(
          pendingSessions
            .map((session) => {
              const weekday = getDay(parseISO(session.date))
              return weekday > 0 ? daysOfWeek[weekday - 1] : undefined
            })
            .filter((day): day is DayOfWeek => Boolean(day))
        ),
      ]

  const fallbackWeekday = getDay(parseISO(startDate))
  const fallbackDay =
    (fallbackWeekday > 0 ? daysOfWeek[fallbackWeekday - 1] : undefined) ??
    daysOfWeek[0]
  const selectedDays = days.length ? days : [fallbackDay]

  return {
    startDate,
    sessionsPerWeek: selectedDays.length,
    days: selectedDays,
  }
}

export function sameWeekDays(first: DayOfWeek[], second: DayOfWeek[]) {
  return first.length === second.length &&
    first.every((day) => second.includes(day))
}

// comparação do nome digitado na confirmação de exclusão
export function normalizeConfirmation(value: string) {
  return value.normalize("NFC").trim().toLocaleLowerCase("pt-BR")
}

// Validação dos dados pessoais (mesmas regras de antes, movidas do modal)
export function validatePatientProfile(form: PatientType): FormErrors {
  const errors: FormErrors = {}
  const normalized = normalizedPatient(form)

  if (!normalized.firstName) errors.firstName = "Informe o primeiro nome."
  if (!normalized.surName) errors.surName = "Informe o sobrenome."
  if (![10, 11].includes(normalized.telephone.length)) {
    errors.telephone = "Informe um telefone com DDD e 10 ou 11 dígitos."
  }
  if (!normalized.street) errors.street = "Informe a rua."
  if (
    !form.address.noNumber &&
    (form.address.addressNumber === null ||
      !Number.isInteger(form.address.addressNumber) ||
      form.address.addressNumber < 1 ||
      form.address.addressNumber > registerPatientLimits.addressNumber)
  ) {
    errors.addressNumber = `Informe um número inteiro entre 1 e ${registerPatientLimits.addressNumber}, ou marque "Sem número".`
  }
  if (!normalized.neighborhood) {
    errors.neighborhood = "Informe o bairro."
  }
  if (form.firstName.trim().length > characterLimits.firstName) {
    errors.firstName = `Use até ${characterLimits.firstName} caracteres.`
  }
  if (form.surName.trim().length > characterLimits.surName) {
    errors.surName = `Use até ${characterLimits.surName} caracteres.`
  }
  if (form.address.street.trim().length > characterLimits.street) {
    errors.street = `Use até ${characterLimits.street} caracteres.`
  }
  if (form.address.neighborhood.trim().length > characterLimits.neighborhood) {
    errors.neighborhood = `Use até ${characterLimits.neighborhood} caracteres.`
  }
  if (form.address.referenceHouse.trim().length > characterLimits.referenceHouse) {
    errors.referenceHouse = `Use até ${characterLimits.referenceHouse} caracteres.`
  }

  return errors
}
