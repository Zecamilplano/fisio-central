import { describe, expect, it } from "vitest"
import { isDraftUsable, REGISTRATION_DRAFT_TTL_MS } from "./registrationDraft"

const now = 1_800_000_000_000

describe("isDraftUsable", () => {
  it("aceita rascunho do mesmo usuário dentro de 1 hora", () => {
    expect(isDraftUsable({ userId: "a", updatedAt: now - 10 * 60_000 }, "a", now)).toBe(true)
  })

  it("recusa rascunho de outro usuário", () => {
    expect(isDraftUsable({ userId: "a", updatedAt: now }, "b", now)).toBe(false)
  })

  it("recusa rascunho vencido (mais de 1 hora)", () => {
    expect(isDraftUsable({ userId: "a", updatedAt: now - REGISTRATION_DRAFT_TTL_MS - 1 }, "a", now)).toBe(false)
  })

  it("recusa rascunho sem dono conhecido", () => {
    expect(isDraftUsable(null, "a", now)).toBe(false)
  })

  it("recusa data no futuro (relógio adulterado)", () => {
    expect(isDraftUsable({ userId: "a", updatedAt: now + 60_000 }, "a", now)).toBe(false)
  })
})
