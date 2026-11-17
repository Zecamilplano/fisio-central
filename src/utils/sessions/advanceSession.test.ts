import { describe, expect, it } from "vitest"
import type { ListPatient } from "@/types"
import { buildAdvanceUpdates, buildPostponeUpdates } from "./advanceSession"

type Update = { id: string; session_date: string }

// pacote seg/qua; as `done` primeiras sessões já realizadas
function packagePatient(dates: string[], done: number): ListPatient {
  return {
    typeService: "Pacote",
    packages: [{ id: "p1", fixedWeekDays: ["Segunda", "Quarta"] }],
    session: dates.map((date, index) => ({
      id: `s${index + 1}`,
      number: index + 1,
      packageId: "p1",
      date,
      time: "08:00",
      finish: index < done ? "realizado" : "pendente",
      paid: "pendente",
    })),
  } as unknown as ListPatient
}

function apply(patient: ListPatient, updates: Update[]): ListPatient {
  return {
    ...patient,
    session: patient.session.map((session) => {
      const update = updates.find((item) => item.id === session.id)
      return update ? { ...session, date: update.session_date } : session
    }),
  } as ListPatient
}

const datesOf = (patient: ListPatient) => patient.session.map((s) => s.date)

const INITIAL = [
  "2026-11-02", "2026-11-04", "2026-11-09", "2026-11-11",
  "2026-11-16", "2026-11-18", "2026-11-23", "2026-11-25",
  "2026-11-30", "2026-12-02",
]

describe("buildAdvanceUpdates", () => {
  it("adianta a sessão e puxa as pendentes seguintes uma vaga (exemplo aprovado)", () => {
    const patient = packagePatient(INITIAL, 4)
    const result = buildAdvanceUpdates(patient, "s5", "2026-11-13")

    expect(result.kind).toBe("advance")
    if (result.kind !== "advance") return
    expect(datesOf(apply(patient, result.updates)).slice(4)).toEqual([
      "2026-11-13", "2026-11-16", "2026-11-18", "2026-11-23", "2026-11-25", "2026-11-30",
    ])
  })

  it("não deixa passar da sessão anterior", () => {
    const patient = packagePatient(INITIAL, 2)
    const result = buildAdvanceUpdates(patient, "s5", "2026-11-11")
    expect(result.kind).toBe("error")
  })

  it("data igual ou mais tarde não é adiantamento", () => {
    const patient = packagePatient(INITIAL, 2)
    expect(buildAdvanceUpdates(patient, "s3", "2026-11-09").kind).toBe("none")
    expect(buildAdvanceUpdates(patient, "s3", "2026-11-10").kind).toBe("none")
  })

  it("paciente avulso segue o fluxo normal", () => {
    const patient = { ...packagePatient(INITIAL, 2), typeService: "Sessão avulsa" } as ListPatient
    expect(buildAdvanceUpdates(patient, "s3", "2026-11-06").kind).toBe("none")
  })
})

describe("buildPostponeUpdates", () => {
  it("adiar de volta desfaz o adiantamento (ida e volta)", () => {
    const patient = packagePatient(INITIAL, 2)
    const advanced = buildAdvanceUpdates(patient, "s3", "2026-11-06")
    if (advanced.kind !== "advance") throw new Error("esperava adiantamento")
    const afterAdvance = apply(patient, advanced.updates)

    const postponed = buildPostponeUpdates(afterAdvance, "s3", "2026-11-09")
    if (postponed.kind !== "postpone") throw new Error("esperava adiamento")

    expect(datesOf(apply(afterAdvance, postponed.updates))).toEqual(INITIAL)
  })

  it("adiar para antes da próxima sessão não empurra ninguém", () => {
    const patient = packagePatient(INITIAL, 2)
    const result = buildPostponeUpdates(patient, "s3", "2026-11-10")
    expect(result).toEqual({ kind: "postpone", updates: [{ id: "s3", session_date: "2026-11-10" }] })
  })

  it("passar de todas cria novas vagas nos dias fixos do pacote", () => {
    const patient = packagePatient(INITIAL.slice(0, 6), 2)
    const result = buildPostponeUpdates(patient, "s3", "2026-11-25")
    if (result.kind !== "postpone") throw new Error("esperava adiamento")

    expect(datesOf(apply(patient, result.updates)).slice(2)).toEqual([
      "2026-11-25", "2026-11-30", "2026-12-02", "2026-12-07",
    ])
  })
})
