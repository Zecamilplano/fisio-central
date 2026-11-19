// Rascunho do primeiro cadastro no localStorage.
// Senha e confirmação NUNCA são salvas (texto puro no navegador é inseguro).
// Vale por 1 hora desde a última edição, como os rascunhos do cadastro de paciente.

import { profileLimits } from "@/data/fieldLimits"
import type { FirstRegistrationValues } from "./types"

export const FIRST_REGISTRATION_DRAFT_KEY = "firstRegistrationDraft"
export const FIRST_REGISTRATION_DRAFT_TTL_MS = 60 * 60 * 1000

type DraftFields = Pick<
  FirstRegistrationValues,
  "firstName" | "surName" | "email" | "crefito" | "title"
>

const TEXT_LIMITS: Record<Exclude<keyof DraftFields, "title">, number> = {
  firstName: profileLimits.firstName,
  surName: profileLimits.surName,
  email: profileLimits.email,
  crefito: profileLimits.crefito,
}

export function serializeDraft(values: FirstRegistrationValues, now: number) {
  const draft: DraftFields & { updatedAt: number } = {
    firstName: values.firstName,
    surName: values.surName,
    email: values.email,
    crefito: values.crefito,
    title: values.title,
    updatedAt: now,
  }
  return JSON.stringify(draft)
}

export function hasDraftContent(values: FirstRegistrationValues) {
  return Boolean(
    values.firstName || values.surName || values.email || values.crefito || values.title
  )
}

// devolve só campos válidos (tipo, tamanho, título permitido) ou null se o
// rascunho estiver vencido, corrompido ou vazio
export function parseDraft(raw: string | null, now: number): Partial<DraftFields> | null {
  if (!raw) return null
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return null
  }
  if (!parsed || typeof parsed !== "object") return null

  const data = parsed as Record<string, unknown>
  const updatedAt = data.updatedAt
  if (
    typeof updatedAt !== "number" ||
    now - updatedAt < 0 ||
    now - updatedAt > FIRST_REGISTRATION_DRAFT_TTL_MS
  ) {
    return null
  }

  const draft: Partial<DraftFields> = {}
  for (const [field, limit] of Object.entries(TEXT_LIMITS) as [keyof typeof TEXT_LIMITS, number][]) {
    const value = data[field]
    if (typeof value === "string") draft[field] = value.slice(0, limit)
  }
  if (data.title === "Dr." || data.title === "Dra." || data.title === "") {
    draft.title = data.title
  }

  return Object.keys(draft).length > 0 ? draft : null
}
