import { describe, expect, it } from "vitest"
import { getDay } from "date-fns"
import { WEEKDAY_NUMBER } from "./weekdays"

describe("WEEKDAY_NUMBER", () => {
  it("bate com o getDay() do date-fns (domingo = 0)", () => {
    // semana de 16/11/2026 (segunda) a 21/11/2026 (sábado)
    const week = {
      Segunda: new Date(2026, 10, 16),
      Terça: new Date(2026, 10, 17),
      Quarta: new Date(2026, 10, 18),
      Quinta: new Date(2026, 10, 19),
      Sexta: new Date(2026, 10, 20),
      Sábado: new Date(2026, 10, 21),
    }

    for (const [day, date] of Object.entries(week)) {
      expect(WEEKDAY_NUMBER[day as keyof typeof WEEKDAY_NUMBER]).toBe(getDay(date))
    }
  })
})
