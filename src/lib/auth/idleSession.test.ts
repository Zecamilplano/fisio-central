import { describe, expect, it } from "vitest"
import {
  IDLE_LIMIT_MS,
  decideIdle,
  formatLastSeen,
  parseLastSeen,
} from "./idleSession"

const DAY = 24 * 60 * 60 * 1000
const now = new Date("2026-11-17T12:00:00-03:00").getTime()
const cookie = (sessionId: string, msAgo: number) =>
  formatLastSeen(sessionId, now - msAgo)

describe("decideIdle", () => {
  it("desloga após 2 semanas sem uso na mesma sessão", () => {
    expect(decideIdle(cookie("s1", 15 * DAY), "s1", now)).toBe("logout")
    expect(decideIdle(cookie("s1", IDLE_LIMIT_MS + 1), "s1", now)).toBe("logout")
  })

  it("não desloga com exatamente 2 semanas ou menos", () => {
    expect(decideIdle(cookie("s1", IDLE_LIMIT_MS), "s1", now)).toBe("touch")
    expect(decideIdle(cookie("s1", 13 * DAY), "s1", now)).toBe("touch")
  })

  it("login novo (outra sessão) não herda a data antiga", () => {
    expect(decideIdle(cookie("sessao-antiga", 30 * DAY), "sessao-nova", now)).toBe("touch")
  })

  it("sem cookie ou cookie inválido: só começa a contar", () => {
    expect(decideIdle(undefined, "s1", now)).toBe("touch")
    expect(decideIdle("lixo", "s1", now)).toBe("touch")
    expect(decideIdle("s1:abc", "s1", now)).toBe("touch")
  })

  it("regrava no máximo 1x por hora", () => {
    expect(decideIdle(cookie("s1", 10 * 60 * 1000), "s1", now)).toBe("keep")
    expect(decideIdle(cookie("s1", 2 * 60 * 60 * 1000), "s1", now)).toBe("touch")
  })

  it("data no futuro (relógio ajustado) é regravada, não desloga", () => {
    expect(decideIdle(cookie("s1", -5 * DAY), "s1", now)).toBe("touch")
  })
})

describe("parseLastSeen", () => {
  it("lê id da sessão e timestamp", () => {
    expect(parseLastSeen("abc:123")).toEqual({ sessionId: "abc", time: 123 })
    expect(parseLastSeen(":123")).toBeNull()
  })
})
