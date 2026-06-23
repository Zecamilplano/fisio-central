import { dayToIndex } from "@/data"
import { PaymentType, Session_ } from "@/types"
import * as fn from "date-fns"
import type { Day } from "date-fns"
import { ptBR } from "date-fns/locale"

export function getNextDateForDay(dayName: string, afterDate: Date): Date {
  const targetIndex = dayToIndex[dayName] as Day
  return fn.nextDay(afterDate, targetIndex)
}

const dayMap: Record<string, number> = {
  Segunda: 1,
  Terça: 2,
  Quarta: 3,
  Quinta: 4,
  Sexta: 5,
  Sábado: 6,
}

export function buildSessions(
  activeDays: string[],
  scheduledCount: number,
  startDate: Date,
  totalSessions: number,
  defaultTime: string,
  paymentType: PaymentType
): Session_[] {
  const sessionsToAdd = totalSessions - scheduledCount
  const newSessions: Session_[] = []

  const activeDayNumbers = activeDays.map((day) => dayMap[day])
  let currentDate = fn.startOfDay(new Date(startDate))

  while (newSessions.length < sessionsToAdd) {
    const currentDayNumber = currentDate.getDay()

    if (activeDayNumbers.includes(currentDayNumber)) {
      const sessionNumber = scheduledCount + newSessions.length + 1

      let paid: "pago" | "pendente" = "pendente"

      if (paymentType === "integral") {
        paid = "pago"
      }

      if (
        paymentType === "metade" &&
        sessionNumber <= Math.ceil(totalSessions / 2)
      ) {
        paid = "pago"
      }

      newSessions.push({
        sessionNumber,
        fullDate: fn.format(currentDate, "dd/MM/yyyy"),
        weekDay: fn.format(currentDate, "EEEE", { locale: ptBR }),
        time: defaultTime,
        paid,
      })
    }

    currentDate = fn.addDays(currentDate, 1)
  }

  return newSessions
}

export function getLastDate(sessions: Session_[]): Date {
  if (sessions.length === 0) return new Date()

  const parsed = fn.parse(
    sessions[sessions.length - 1].fullDate,
    "dd/MM/yyyy",
    new Date()
  )

  return fn.isValid(parsed) ? parsed : new Date()
}
