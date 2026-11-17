import { describe, expect, it } from "vitest"
import { hasRecentEmailProof, RECOVERY_MAX_AGE_SECONDS } from "./recoverySession"

const now = 1_800_000_000

describe("hasRecentEmailProof", () => {
  it("aceita link de recuperação recente", () => {
    expect(hasRecentEmailProof([{ method: "recovery", timestamp: now - 60 }], now)).toBe(true)
  })

  it("aceita otp/magiclink recentes (também provam o e-mail)", () => {
    expect(hasRecentEmailProof([{ method: "otp", timestamp: now - 10 }], now)).toBe(true)
    expect(hasRecentEmailProof([{ method: "magiclink", timestamp: now - 10 }], now)).toBe(true)
  })

  it("recusa sessão aberta só com senha", () => {
    expect(hasRecentEmailProof([{ method: "password", timestamp: now - 10 }], now)).toBe(false)
  })

  it("recusa link de recuperação antigo", () => {
    const old = now - RECOVERY_MAX_AGE_SECONDS - 1
    expect(hasRecentEmailProof([{ method: "recovery", timestamp: old }], now)).toBe(false)
  })

  it("recusa formatos sem horário ou inválidos", () => {
    expect(hasRecentEmailProof(["recovery"], now)).toBe(false)
    expect(hasRecentEmailProof(undefined, now)).toBe(false)
    expect(hasRecentEmailProof([{ method: "recovery" }], now)).toBe(false)
  })

  it("recusa horário muito no futuro", () => {
    expect(hasRecentEmailProof([{ method: "recovery", timestamp: now + 3600 }], now)).toBe(false)
  })
})
