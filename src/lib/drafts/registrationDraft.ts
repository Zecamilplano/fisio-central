// Rascunho do cadastro de paciente guardado no navegador (localStorage).
// Contém dados pessoais, então fica vinculado ao usuário que o escreveu e expira
// 1 hora após a última edição. (Auditoria run-1, pista 3.)

export const REGISTRATION_DRAFT_KEYS = [
  "createdPatientId",
  "patientRegistrationStep",
  "formProfile",
  "typeServiceForm",
  "schedulingForm",
] as const

const META_KEY = "registrationDraftMeta"
export const REGISTRATION_DRAFT_TTL_MS = 60 * 60 * 1000 // 1 hora

type DraftMeta = { userId: string; updatedAt: number }

function readMeta(): DraftMeta | null {
  try {
    const meta = JSON.parse(localStorage.getItem(META_KEY) ?? "null")
    return meta && typeof meta.userId === "string" && typeof meta.updatedAt === "number"
      ? meta
      : null
  } catch {
    return null
  }
}

function hasAnyDraft() {
  return REGISTRATION_DRAFT_KEYS.some((key) => localStorage.getItem(key) !== null)
}

/** Apaga o rascunho inteiro (e o vínculo com o usuário). */
export function clearRegistrationDraft() {
  try {
    REGISTRATION_DRAFT_KEYS.forEach((key) => localStorage.removeItem(key))
    localStorage.removeItem(META_KEY)
  } catch {
    // localStorage indisponível: nada a limpar
  }
}

/**
 * Decide se um rascunho guardado pode ser reaproveitado pelo usuário atual.
 * Puro (sem localStorage) para poder ser testado.
 */
export function isDraftUsable(meta: DraftMeta | null, userId: string, now: number) {
  return (
    meta !== null &&
    meta.userId === userId &&
    now - meta.updatedAt >= 0 &&
    now - meta.updatedAt <= REGISTRATION_DRAFT_TTL_MS
  )
}

/**
 * Chamar antes de qualquer tela restaurar o rascunho (o ClinicGate faz isso).
 * Rascunho de outro usuário, vencido ou sem dono conhecido é apagado.
 */
export function ensureRegistrationDraftOwner(userId: string, now = Date.now()) {
  try {
    if (hasAnyDraft() && !isDraftUsable(readMeta(), userId, now)) {
      clearRegistrationDraft()
    }
    if (hasAnyDraft()) {
      localStorage.setItem(META_KEY, JSON.stringify({ userId, updatedAt: readMeta()?.updatedAt ?? now }))
    } else {
      localStorage.removeItem(META_KEY)
    }
    currentOwner = userId
  } catch {
    // localStorage indisponível
  }
}

let currentOwner: string | null = null

/** Marca atividade no rascunho (renova a validade de 1 hora). Chamar após gravar. */
export function touchRegistrationDraft(now = Date.now()) {
  if (!currentOwner) return
  try {
    localStorage.setItem(META_KEY, JSON.stringify({ userId: currentOwner, updatedAt: now }))
  } catch {
    // localStorage indisponível
  }
}

/** Fim de sessão: esquece o dono atual e apaga o rascunho. */
export function endRegistrationDraftSession() {
  currentOwner = null
  clearRegistrationDraft()
}
