import { describe, expect, it } from "vitest"
import { initialValues } from "./constants"
import {
  FIRST_REGISTRATION_DRAFT_TTL_MS,
  parseDraft,
  serializeDraft,
} from "./draft"

const now = new Date("2026-11-19T10:00:00-03:00").getTime()
const values = {
  ...initialValues,
  firstName: "Monique",
  surName: "Fisio",
  email: "fisio@exemplo.com",
  password: "segredo123",
  confirmPassword: "segredo123",
  crefito: "123456-F",
  title: "Dra.",
}

describe("rascunho do primeiro cadastro", () => {
  it("nunca salva senha nem confirmação", () => {
    const raw = serializeDraft(values, now)
    expect(raw).not.toContain("segredo123")
    expect(JSON.parse(raw)).not.toHaveProperty("password")
    expect(JSON.parse(raw)).not.toHaveProperty("confirmPassword")
  })

  it("restaura os campos dentro de 1 hora", () => {
    const raw = serializeDraft(values, now)
    expect(parseDraft(raw, now + 30 * 60 * 1000)).toEqual({
      firstName: "Monique",
      surName: "Fisio",
      email: "fisio@exemplo.com",
      crefito: "123456-F",
      title: "Dra.",
    })
  })

  it("descarta rascunho vencido, do futuro ou corrompido", () => {
    const raw = serializeDraft(values, now)
    expect(parseDraft(raw, now + FIRST_REGISTRATION_DRAFT_TTL_MS + 1)).toBeNull()
    expect(parseDraft(raw, now - 1000)).toBeNull()
    expect(parseDraft("{lixo", now)).toBeNull()
    expect(parseDraft(null, now)).toBeNull()
  })

  it("ignora título inválido e corta texto acima do limite", () => {
    const raw = JSON.stringify({ firstName: "a".repeat(100), title: "Sr.", updatedAt: now })
    expect(parseDraft(raw, now)).toEqual({ firstName: "a".repeat(60) })
  })
})
