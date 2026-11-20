import { useState, useEffect, useLayoutEffect, useRef } from "react"
import { createPortal } from "react-dom"
import Calendar from "react-calendar"
import "react-calendar/dist/Calendar.css"
import "@/styles/smallCalendar.css"

import { CalendarDays } from "lucide-react"

type Props = {
  date: Date
  setDate: (date: Date) => void
  disabled?: boolean
}

// distância mínima entre o calendário e as bordas da tela
const VIEWPORT_MARGIN = 8
const GAP_FROM_BUTTON = 8

// Posição do calendário (position: fixed, coordenadas da tela): abre abaixo do
// botão; sem espaço, acima; e nunca sai da tela pelos lados nem por cima/baixo.
function computePosition(button: DOMRect, calendar: { width: number; height: number }) {
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight

  const fitsBelow =
    button.bottom + GAP_FROM_BUTTON + calendar.height <= viewportHeight - VIEWPORT_MARGIN
  const fitsAbove = button.top - GAP_FROM_BUTTON - calendar.height >= VIEWPORT_MARGIN

  let top = fitsBelow || !fitsAbove
    ? button.bottom + GAP_FROM_BUTTON
    : button.top - GAP_FROM_BUTTON - calendar.height
  top = Math.min(top, viewportHeight - calendar.height - VIEWPORT_MARGIN)
  top = Math.max(top, VIEWPORT_MARGIN)

  // alinha pela esquerda do botão; se não couber, pela direita; e prende na tela
  let left = button.left
  if (left + calendar.width > viewportWidth - VIEWPORT_MARGIN) {
    left = button.right - calendar.width
  }
  left = Math.min(left, viewportWidth - calendar.width - VIEWPORT_MARGIN)
  left = Math.max(left, VIEWPORT_MARGIN)

  return { top, left }
}

export function DatePicker({ date, setDate, disabled = false }: Props) {
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const calendarRef = useRef<HTMLDivElement>(null)

  // mede o calendário já renderizado (o tamanho muda com a largura da tela) e
  // reposiciona ao abrir, ao redimensionar e ao rolar (ex.: dentro de modal)
  useLayoutEffect(() => {
    if (!open) {
      setCoords(null)
      return
    }

    function updatePosition() {
      const button = buttonRef.current
      const calendar = calendarRef.current
      if (!button || !calendar) return
      const { width, height } = calendar.getBoundingClientRect()
      setCoords(computePosition(button.getBoundingClientRect(), { width, height }))
    }

    updatePosition()
    window.addEventListener("resize", updatePosition)
    window.addEventListener("scroll", updatePosition, true)
    return () => {
      window.removeEventListener("resize", updatePosition)
      window.removeEventListener("scroll", updatePosition, true)
    }
  }, [open])

  useEffect(() => {
    if (disabled) setOpen(false)
  }, [disabled])

  useEffect(() => {
    if (!open) return

    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node
      if (
        !buttonRef.current?.contains(target) &&
        !calendarRef.current?.contains(target)
      ) {
        setOpen(false)
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleEscape)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [open])

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={() => setOpen(!open)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <CalendarDays className="h-4 w-4" />

        {date?.toLocaleDateString("pt-BR")}
      </button>

      {open &&
        createPortal(
          <div
            ref={calendarRef}
            role="dialog"
            aria-label="Escolher data"
            style={{
              position: "fixed",
              top: coords?.top ?? 0,
              left: coords?.left ?? 0,
              zIndex: 10001, // acima dos modais
              // invisível só no 1º quadro, enquanto mede o tamanho
              visibility: coords ? "visible" : "hidden",
            }}
            className="date-picker-popover rounded-2xl border border-zinc-200 bg-white shadow-lg"
          >
            <Calendar
              locale="pt-BR"
              onChange={(value) => {
                if (value instanceof Date) {
                  setDate(value)
                  setOpen(false)
                }
              }}
              value={date}
            />
          </div>,
          document.body
        )}
    </div>
  )
}
