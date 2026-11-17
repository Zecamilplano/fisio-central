import { dayToIndex } from "@/data"
import { PaymentType, Session_ } from "@/types"
import * as fn from "date-fns"
import type { Day } from "date-fns"
import { ptBR } from "date-fns/locale"

export function getNextDateForDay(dayName: string, afterDate: Date): Date {
  const targetIndex = dayToIndex[dayName] as Day
  return fn.nextDay(afterDate, targetIndex)
}

export function applyPaymentToSessions(
  sessions: Session_[],
  paymentType: PaymentType,
  paidSessionsCount?: number
): Session_[] {
  const paidSessions = paidSessionsCount ?? Math.floor(sessions.length / 2)

  return sessions.map((session) => ({
    ...session,
    paid:
      paymentType === "integral" ||
      (paymentType === "metade" && session.sessionNumber <= paidSessions)
        ? "realizado"
        : "pendente",
  }))
}

// O input type="date" entrega "yyyy-MM-dd". new Date("2026-11-17") lê como UTC,
// que no Brasil (UTC-3) vira 16/11 21h -> a 1ª sessão caía um dia antes.
// parseISO lê "yyyy-MM-dd" no fuso local; Date e ISO completo seguem iguais.
function toLocalStartOfDay(value: Date | string): Date {
  return fn.startOfDay(typeof value === "string" ? fn.parseISO(value) : value)
}

export function buildSessions(
  activeDays: string[],
  scheduledCount: number,
  startDate: Date,
  totalSessions: number,
  defaultTime: string,
  paymentType: PaymentType,
  paidSessionsCount?: number
): Session_[] {
  const sessionsToAdd = totalSessions - scheduledCount
  const newSessions: Session_[] = []

  const activeDayNumbers = activeDays.map((day) => dayToIndex[day])
  let currentDate = toLocalStartOfDay(startDate)

  while (newSessions.length < sessionsToAdd) {
    const currentDayNumber = currentDate.getDay()

    if (activeDayNumbers.includes(currentDayNumber)) {
      const sessionNumber = scheduledCount + newSessions.length + 1

      newSessions.push({
        sessionNumber,
        fullDate: fn.format(currentDate, "dd/MM/yyyy"),
        weekDay: fn.format(currentDate, "EEEE", { locale: ptBR }),
        time: defaultTime,
        finish: "pendente",
        paid: "pendente",
      })
    }

    currentDate = fn.addDays(currentDate, 1)
  }

  return applyPaymentToSessions(newSessions, paymentType, paidSessionsCount)
}

export function getLastDate(sessions: Session_[]): Date | null {
  if (sessions.length === 0) return null

  const parsed = fn.parse(
    sessions[sessions.length - 1].fullDate,
    "dd/MM/yyyy",
    new Date()
  )

  return fn.isValid(parsed) ? parsed : null
}
