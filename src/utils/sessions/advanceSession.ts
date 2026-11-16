import { addDays, format, getDay, parseISO } from "date-fns"
import type { DayOfWeek, ListPatient } from "@/types"

type ScheduleUpdate = { id: string; session_date: string }

export type AdvanceResult =
  | { kind: "none" }
  | { kind: "error"; message: string }
  | { kind: "advance"; updates: ScheduleUpdate[] }

/**
 * Adiantar uma sessão pendente de um pacote.
 * A sessão vai para a data escolhida e cada pendente depois dela ocupa a data
 * antiga da anterior ("puxa uma vaga"); as sessões antes dela não mudam.
 *
 * Vale para qualquer data depois da sessão anterior e antes da data original
 * (não depende de "hoje", para permitir registrar uma sessão que já aconteceu).
 * Devolve "none" quando não é um adiantamento (fluxo normal).
 */
export function buildAdvanceUpdates(
  patient: ListPatient,
  sessionId: string,
  newDate: string
): AdvanceResult {
  if (patient.typeService !== "Pacote") return { kind: "none" }

  const session = patient.session.find((item) => item.id === sessionId)
  if (!session?.packageId) return { kind: "none" }

  const packageSessions = patient.session.filter(
    (item) => item.packageId === session.packageId
  )

  const originalDate = session.date.slice(0, 10)
  if (newDate >= originalDate) return { kind: "none" } // não é adiantamento

  // não pode passar da sessão anterior (qualquer status), para manter a ordem
  const previousDate = packageSessions
    .filter((item) => item.number < session.number)
    .map((item) => item.date.slice(0, 10))
    .sort()
    .at(-1)

  if (previousDate && newDate <= previousDate) {
    return {
      kind: "error",
      message: `Escolha uma data depois da sessão anterior (${format(parseISO(previousDate), "dd/MM")}).`,
    }
  }

  // a sessão e as pendentes depois dela, em ordem
  const chain = [
    session,
    ...packageSessions
      .filter((item) => item.finish === "pendente" && item.number > session.number)
      .sort((a, b) => a.number - b.number),
  ]

  const updates: ScheduleUpdate[] = [{ id: sessionId, session_date: newDate }]
  for (let index = 1; index < chain.length; index++) {
    updates.push({
      id: chain[index].id,
      session_date: chain[index - 1].date.slice(0, 10),
    })
  }

  return { kind: "advance", updates }
}

export type PostponeResult =
  | { kind: "none" }
  | { kind: "error"; message: string }
  | { kind: "postpone"; updates: ScheduleUpdate[] }

const weekDayNumber: Record<DayOfWeek, number> = {
  Segunda: 1,
  Terça: 2,
  Quarta: 3,
  Quinta: 4,
  Sexta: 5,
  Sábado: 6,
}

function toDateKey(date: Date) {
  return format(date, "yyyy-MM-dd")
}

/**
 * Adiar uma sessão pendente de um pacote (o inverso de adiantar).
 * A sessão vai para a data escolhida; as pendentes depois dela mantêm suas
 * datas enquanto continuarem depois dela. As que ficariam no mesmo dia ou
 * antes "empurram uma vaga" para frente e, se faltar vaga no fim, uma nova
 * é criada no próximo dia fixo do pacote.
 *
 * Ex. (seg/qua): 3ª 06/11, 4ª 09/11, 5ª 11/11, 6ª 16/11 → adiar a 3ª para 09/11:
 * 3ª 09/11, 4ª 11/11, 5ª 16/11, 6ª 18/11.
 */
export function buildPostponeUpdates(
  patient: ListPatient,
  sessionId: string,
  newDate: string
): PostponeResult {
  if (patient.typeService !== "Pacote") return { kind: "none" }

  const session = patient.session.find((item) => item.id === sessionId)
  if (!session?.packageId) return { kind: "none" }

  const packageSessions = patient.session.filter(
    (item) => item.packageId === session.packageId
  )
  const originalDate = session.date.slice(0, 10)
  if (newDate <= originalDate) return { kind: "none" } // não é adiar

  // dias fixos do pacote (ou, se não houver, os dias usados nas sessões)
  const treatmentPackage = patient.packages.find(
    (item) => item.id === session.packageId
  )
  const allowedDays = treatmentPackage?.fixedWeekDays?.length
    ? treatmentPackage.fixedWeekDays.map((day) => weekDayNumber[day])
    : [...new Set(packageSessions.map((item) => getDay(parseISO(item.date))))].filter(
        (day) => day !== 0
      )
  if (allowedDays.length === 0) {
    return { kind: "error", message: "Defina os dias da semana do pacote antes de adiar." }
  }

  // vagas disponíveis para as seguintes: datas atuais depois da nova data,
  // completadas com novas vagas nos dias fixos depois da última
  const following = packageSessions
    .filter((item) => item.finish === "pendente" && item.number > session.number)
    .sort((a, b) => a.number - b.number)
  const slots = following
    .map((item) => item.date.slice(0, 10))
    .filter((date) => date > newDate)
    .sort()

  let lastSlot = parseISO(slots.at(-1) ?? newDate)
  while (slots.length < following.length) {
    let next = addDays(lastSlot, 1)
    while (!allowedDays.includes(getDay(next))) next = addDays(next, 1)
    slots.push(toDateKey(next))
    lastSlot = next
  }

  const updates: ScheduleUpdate[] = [{ id: sessionId, session_date: newDate }]
  following.forEach((item, index) => {
    if (item.date.slice(0, 10) !== slots[index]) {
      updates.push({ id: item.id, session_date: slots[index] })
    }
  })

  return { kind: "postpone", updates }
}
