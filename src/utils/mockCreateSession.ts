import { TypeService } from "@/types"
import { PaidKey, Session } from "@/types/listPatientType"
import { addDays, format } from "date-fns"
import { ptBR } from "date-fns/locale"

type WeekDay =
  | 1 // segunda
  | 2 // terça
  | 3 // quarta
  | 4 // quinta
  | 5 // sexta
  | 6 // sábado

type CreateSessionParams = {
  startDate: Date
  total: number
  daysOfWeek: WeekDay[]
  typeService: TypeService
}

function randomPaymentStatus(): PaidKey {
  const status: PaidKey[] = ["pago", "pago", "pago", "pendente", "cancelado"]

  const randomIndex = Math.floor(Math.random() * status.length)

  return status[randomIndex]
}

export function createSessions({
  startDate,
  total,
  daysOfWeek,
  typeService,
}: CreateSessionParams): Session[] {
  const sessions: Session[] = []

  const quantity = typeService === "Sessão avulsa" ? 1 : total

  let currentDate = startDate
  let attempt = 0

  while (sessions.length < quantity) {
    attempt++
    const currentWeekDay = currentDate.getDay()

    const isValidDay = daysOfWeek.includes(currentWeekDay as WeekDay)

    if (isValidDay) {
      const finish = Math.random() > 0.5

      sessions.push({
        id: crypto.randomUUID(),
        number: sessions.length + 1,

        date: format(currentDate, "yyyy-MM-dd", {
          locale: ptBR,
        }),

        finish,
        paid: randomPaymentStatus(),
      })
    }
    currentDate = addDays(currentDate, 1)
  }

  return sessions
}
