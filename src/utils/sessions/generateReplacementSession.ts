import { ListPatient, Session } from "@/types"
import { getCurrentPackage } from "../package/getCurrentPackage"
import { getNextSessionDate } from "./getNextSessionDate"
import { format, parseISO } from "date-fns"

export function generateReplacementSession(
  patient: ListPatient
): Session | null {
  if (patient?.typeService !== "Pacote") {
    return null
  }

  const currentPackage = getCurrentPackage(patient)

  if (!currentPackage) return null

  const lastSession = patient.session.at(-1)

  if (!lastSession) return null

  const daysOfWeekAsNumber = currentPackage.fixedWeekDays.map((day) => {
    const map = {
      Domingo: 0,
      Segunda: 1,
      Terça: 2,
      Quarta: 3,
      Quinta: 4,
      Sexta: 5,
      Sábado: 6,
    } as const

    return map[day]
  })

  const nextDate = getNextSessionDate(
    parseISO(lastSession.date),
    daysOfWeekAsNumber
  )

  return {
    id: crypto.randomUUID(),
    number: patient.session.length + 1,
    packageId: currentPackage.id,
    date: format(nextDate, "yyyy-MM-dd"),
    finish: false,
    paid: "pendente",
  }
}
