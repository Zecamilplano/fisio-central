// A troca de senha em /redefinir-senha só é liberada para sessões que acabaram de
// provar acesso ao e-mail (link de "Esqueci minha senha"). Uma sessão comum, aberta
// com senha, não pode trocar a senha: assim quem pegar um computador logado ou um
// cookie roubado não consegue tomar a conta. (Auditoria run-1, pista 2.)

// métodos que provam acesso ao e-mail da conta
const EMAIL_PROOF_METHODS = new Set(["recovery", "otp", "magiclink"])

// janela para usar o link depois de abri-lo
export const RECOVERY_MAX_AGE_SECONDS = 15 * 60

type AmrEntry = { method?: string; timestamp?: number } | string

/**
 * `amr` vem do token (getClaims): lista de { method, timestamp em segundos }.
 * O formato só com strings não tem horário, então não é aceito.
 */
export function hasRecentEmailProof(
  amr: unknown,
  nowSeconds: number,
  maxAgeSeconds: number = RECOVERY_MAX_AGE_SECONDS
): boolean {
  if (!Array.isArray(amr)) return false
  return (amr as AmrEntry[]).some(
    (entry) =>
      typeof entry === "object" &&
      entry !== null &&
      typeof entry.method === "string" &&
      EMAIL_PROOF_METHODS.has(entry.method) &&
      typeof entry.timestamp === "number" &&
      entry.timestamp <= nowSeconds + 60 && // tolera pequena diferença de relógio
      nowSeconds - entry.timestamp <= maxAgeSeconds
  )
}
