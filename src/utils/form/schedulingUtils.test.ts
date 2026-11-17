import { describe, expect, it } from "vitest"
import { buildSessions, getLastDate } from "./schedulingUtils"

describe("buildSessions", () => {
  it("data inicial 'yyyy-MM-dd' não cai um dia antes (bug do UTC)", () => {
    // terça 17/11 com dias seg/qua: a 1ª sessão é quarta 18/11, não segunda 16/11
    const sessions = buildSessions(
      ["Segunda", "Quarta"],
      0,
      "2026-11-17" as unknown as Date, // o input type="date" entrega string
      3,
      "08:00",
      "integral"
    )
    expect(sessions.map((s) => s.fullDate)).toEqual(["18/11/2026", "23/11/2026", "25/11/2026"])
  })

  it("respeita os dias ativos e a quantidade que falta", () => {
    const sessions = buildSessions(["Sexta"], 2, new Date(2026, 10, 2), 5, "10:00", "integral")
    expect(sessions).toHaveLength(3)
    expect(sessions.map((s) => s.fullDate)).toEqual(["06/11/2026", "13/11/2026", "20/11/2026"])
    expect(sessions.map((s) => s.sessionNumber)).toEqual([3, 4, 5])
    expect(sessions.every((s) => s.time === "10:00")).toBe(true)
  })
})

describe("getLastDate", () => {
  it("devolve a data da última sessão", () => {
    const last = getLastDate([
      { sessionNumber: 1, fullDate: "02/11/2026", weekDay: "", time: "", finish: "pendente", paid: "pendente" },
      { sessionNumber: 2, fullDate: "04/11/2026", weekDay: "", time: "", finish: "pendente", paid: "pendente" },
    ])
    expect(last?.getDate()).toBe(4)
    expect(last?.getMonth()).toBe(10)
  })

  it("sem sessões devolve null", () => {
    expect(getLastDate([])).toBeNull()
  })
})
