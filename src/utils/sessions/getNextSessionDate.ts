import type { Session } from "@/types"
import { compareAsc, parseISO } from "date-fns"

export function getNextSessionDate(lastDate: Date, daysOfWeek: number[]): Date {
  const nextDate = new Date(lastDate)

  while (true) {
    nextDate.setDate(nextDate.getDate() + 1)

    const day = nextDate.getDate()

    if (daysOfWeek.includes(day)) {
      return nextDate
    }
  }
}

export function getNextSession(
  sessions: Session[],
  packageId: string
): Session | null {
  return (
    sessions
      // .filter((session) => session.packageId !== packageId)
      .filter((session) => session.packageId === packageId)
      .filter((session) => !session.finish)
      .sort((a, b) => compareAsc(parseISO(a.date), parseISO(b.date)))[0] ?? null
    // .sort(
    //   (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    // )[0] ?? null
  )
}
