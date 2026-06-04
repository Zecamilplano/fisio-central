import { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import Calendar from "react-calendar"
import "react-calendar/dist/Calendar.css"
import "@/styles/smallCalendar.css"

import { CalendarDays } from "lucide-react"

type Props = {
  date: Date
  setDate: React.Dispatch<React.SetStateAction<Date>>
}

export function DatePicker({ date, setDate }: Props) {
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0 })
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open || !buttonRef.current) return

    const rect = buttonRef.current.getBoundingClientRect()
    const calendarHeight = 320
    const calendarWidth = 320

    const top =
      rect.bottom + calendarHeight > window.innerHeight
        ? rect.top - calendarHeight + window.scrollY
        : rect.bottom + window.scrollY + 8

    const left =
      rect.left + calendarWidth > window.innerWidth
        ? rect.right - calendarWidth + window.scrollX
        : rect.left + window.scrollX

    setCoords({ top, left })
  }, [open])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (!buttonRef.current?.contains(e.target as Node)) {
        const calendarEl = document.getElementById("datepicker-portal")
        if (!calendarEl?.contains(e.target as Node)) {
          setOpen(false)
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative z-50">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700"
      >
        <CalendarDays className="h-4 w-4" />

        {date?.toLocaleDateString("pt-BR")}
      </button>

      {open && (
        <div
          className={`absolute bottom-0 left-0 z-50 rounded-2xl p-3
          `}
        >
          {createPortal(
            <div
              id="datepicker-portal"
              style={{
                position: "absolute",
                top: coords.top,
                left: coords.left,
                zIndex: 9999,
              }}
              className="rounded-2xl border border-zinc-200 bg-white shadow-lg"
            >
              <Calendar
                locale="pt-BR"
                onChange={(value) => {
                  setDate(value as Date)
                  setOpen(false)
                }}
                value={date}
              />
            </div>,
            document.body
          )}
        </div>
      )}
    </div>
  )
}
