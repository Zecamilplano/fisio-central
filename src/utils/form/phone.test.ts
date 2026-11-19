import { describe, expect, it } from "vitest"
import { mergePastedPhone, normalizePastedPhone } from "./phone"

describe("colar telefone", () => {
  it("ignora espaços e símbolos (inclusive espaço sobrando no fim)", () => {
    expect(mergePastedPhone("", 0, 0, " (11) 98765-4321 ")).toEqual({
      formatted: "(11) 98765-4321",
      overflow: false,
    })
  })

  it("remove o +55 e o 0 de discagem", () => {
    expect(normalizePastedPhone("+55 11 98765-4321")).toBe("11987654321")
    expect(normalizePastedPhone("011 98765-4321")).toBe("11987654321")
  })

  it("substitui o trecho selecionado", () => {
    // seleciona tudo e cola outro número
    expect(mergePastedPhone("(11) 1234-5678", 0, 14, "21 99999-0000").formatted).toBe(
      "(21) 99999-0000"
    )
  })

  it("corta o excedente e avisa", () => {
    expect(mergePastedPhone("(11) 98765-4321", 15, 15, "999")).toEqual({
      formatted: "(11) 98765-4321",
      overflow: true,
    })
  })
})
