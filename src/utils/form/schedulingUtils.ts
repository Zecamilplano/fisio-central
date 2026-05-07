import { dayToIndex } from "@/data"
import { Session } from "@/types"
import * as fn from "date-fns"
import type { Day } from "date-fns"
import { ptBR } from "date-fns/locale"

export function getNextDateForDay(dayName: string, afterDate: Date): Date {
  const targetIndex = dayToIndex[dayName] as Day
  return fn.nextDay(afterDate, targetIndex)
}

export function buildSessions(
  activeDays: string[],
  scheduledCount: number,
  lastDate: Date,
  totalSessions: number
): Session[] {
  const sessionsToAdd = totalSessions - scheduledCount
  const newSessions: Session[] = []
  let baseDate = new Date(lastDate)

  for (let i = 0; i < sessionsToAdd; i++) {
    const dayName = activeDays[i % activeDays.length]
    const nextDate = getNextDateForDay(dayName, baseDate)
    baseDate = nextDate

    if (!fn.isValid(nextDate)) continue

    newSessions.push({
      sessionNumber: scheduledCount + newSessions.length + 1,
      fullDate: fn.format(nextDate, "dd/MM/yyyy"),
      weekDay: fn.format(nextDate, "EEEE", { locale: ptBR }),
    })
  }

  return newSessions
}

export function getLastDate(sessions: Session[]): Date {
  if (sessions.length === 0) return new Date()

  const parsed = fn.parse(
    sessions[sessions.length - 1].fullDate,
    "dd/MM/yyyy",
    new Date()
  )

  return fn.isValid(parsed) ? parsed : new Date()
}
