import { addMinutes, format, set } from "date-fns"

export function createTimeOptions({
  startHour = 8,
  endHour = 18,
  intervalMinutes = 30,
}: {
  startHour?: number
  endHour?: number
  intervalMinutes?: number
} = {}) {
  const baseDate = new Date()

  let currentTime = set(baseDate, {
    hours: startHour,
    minutes: 0,
    seconds: 0,
    milliseconds: 0,
  })

  const endTime = set(baseDate, {
    hours: endHour,
    minutes: 0,
    seconds: 0,
    milliseconds: 0,
  })

  const times: string[] = []

  while (currentTime <= endTime) {
    times.push(format(currentTime, "HH:mm"))
    currentTime = addMinutes(currentTime, intervalMinutes)
  }

  return times
}
