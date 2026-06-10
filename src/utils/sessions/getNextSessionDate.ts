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
