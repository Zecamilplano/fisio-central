import { StatusSessaoKey } from "@/data/optionsSessionsData"
import { PaidKey, Session, TypeService } from "@/types"
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
  packageId?: string
  startDate: Date
  total: number
  daysOfWeek: WeekDay[]
  typeService: TypeService
  forceFinished?: boolean
}

function randomPaymentStatus(): PaidKey {
  const status: PaidKey[] = [
    "realizado",
    "realizado",
    "realizado",
    "pendente",
    "cancelado",
  ]

  const randomIndex = Math.floor(Math.random() * status.length)

  return status[randomIndex]
}

function randomFinishStatus(): StatusSessaoKey {
  const status: StatusSessaoKey[] = [
    "realizado",
    "realizado",
    "pendente",
    "pendente",
    "cancelado",
  ]

  const randomIndex = Math.floor(Math.random() * status.length)

  return status[randomIndex]
}

export function createSessions({
  startDate,
  total,
  daysOfWeek,
  typeService,
  packageId,
  forceFinished = false,
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
      const finish: StatusSessaoKey = forceFinished
        ? "realizado"
        : randomFinishStatus()

      sessions.push({
        id: crypto.randomUUID(),
        number: sessions.length + 1,

        date: format(currentDate, "yyyy-MM-dd", {
          locale: ptBR,
        }),

        packageId: packageId || "",
        finish,
        paid: forceFinished ? "realizado" : randomPaymentStatus(),
      })
    }
    currentDate = addDays(currentDate, 1)
  }

  return sessions
}
