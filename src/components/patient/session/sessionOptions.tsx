import { addDays, format, getDay, parseISO, startOfWeek } from "date-fns"
import { Trash2 } from "lucide-react"
import { DatePicker } from "@/components/ui/datePicker"
import { daysOfWeek } from "@/data"
import type { DayOfWeek } from "@/types"
import { toast } from "react-toastify"
import {
  PagamentoConfig,
  StatusConfig,
  StatusSessaoKey,
} from "@/data/optionsSessionsData"
import { PaidKey, Session } from "@/types"

type SessionFieldValue = {
  finish: StatusSessaoKey
  paid: PaidKey
  date: string
  time: string
}

type SessionOptionsProps = {
  session: Session
  defaultTime: string
  timeOptions: string[]
  nextSessionWeekDay?: DayOfWeek
  statusConfig: Record<StatusSessaoKey, StatusConfig>
  pagamentoConfig: Record<PaidKey, PagamentoConfig>
  onChangeSession: <K extends keyof SessionFieldValue>(
    sessionId: string,
    field: K,
    value: SessionFieldValue[K]
  ) => void
  onOpenDeleteModal: (sessionId: string, sessionNumber: number) => void
}

export function SessionOptions({
  session,
  defaultTime,
  timeOptions,
  nextSessionWeekDay,
  statusConfig,
  pagamentoConfig,
  onChangeSession,
  onOpenDeleteModal,
}: SessionOptionsProps) {
  const canEditSchedule = session.finish === "pendente"
  const currentDate = parseISO(session.date)
  const selectedDayIndex = getDay(currentDate)
  const selectedDay = selectedDayIndex > 0 ? daysOfWeek[selectedDayIndex - 1] : undefined

  function handleSelectDay(day: DayOfWeek) {
    if (nextSessionWeekDay && day === nextSessionWeekDay) {
      toast.error("Escolha um dia diferente do dia da próxima sessão avulsa.")
      return
    }
    const dayIndex = daysOfWeek.indexOf(day) + 1
    const sessionWeekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
    const dateInSameWeek = addDays(sessionWeekStart, dayIndex - 1)
    onChangeSession(session.id, "date", format(dateInSameWeek, "yyyy-MM-dd"))
  }

  function handleSelectDate(date: Date) {
    const dayIndex = getDay(date)
    const selectedDateWeekDay = dayIndex > 0 ? daysOfWeek[dayIndex - 1] : undefined
    if (!selectedDateWeekDay) {
      toast.error("Escolha uma data entre segunda-feira e sábado.")
      return
    }
    if (nextSessionWeekDay && selectedDateWeekDay === nextSessionWeekDay) {
      toast.error("Escolha um dia diferente do dia da próxima sessão avulsa.")
      return
    }
    onChangeSession(session.id, "date", format(date, "yyyy-MM-dd"))
  }

  return (
    <div className="w-full overflow-hidden pt-3 transition-all duration-300 ease-in-out">
      <div className="h-px w-full bg-linear-to-r from-transparent via-[#E4E7EC] to-transparent" />

      {session.originalDate && session.originalDate !== session.date && (
        <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Data original:{" "}
          <strong>
            {format(parseISO(session.originalDate), "dd/MM/yyyy")}
          </strong>
        </div>
      )}

      <div className="mt-3 grid w-full min-w-0 grid-cols-1 gap-3">
        <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
          <section className="min-w-0 rounded-md border border-[#EAECF0] bg-white p-3">
            <h4 className="mb-3 text-xs font-semibold tracking-wide text-[#667085] uppercase">
              Realização
            </h4>

            <div className="grid min-w-0 grid-cols-2 gap-2 min-[420px]:grid-cols-3 sm:grid-cols-2 lg:grid-cols-3">
              {Object.values(statusConfig).map((status) => {
                const isActive = session.finish === status.value

                return (
                  <button
                    key={status.label}
                    type="button"
                    onClick={() =>
                      onChangeSession(session.id, "finish", status.value)
                    }
                    className={`flex min-h-10 w-full items-center justify-center rounded-lg border border-transparent px-2 py-2 text-center text-xs font-semibold transition sm:text-sm ${isActive ? status.button.active : status.button.inactive
                      }`}
                  >
                    {status.label}
                  </button>
                )
              })}
            </div>
          </section>

          <section className="min-w-0 rounded-md border border-[#EAECF0] bg-white p-3">
            <h4 className="mb-3 text-xs font-semibold tracking-wide text-[#667085] uppercase">
              Pagamento
            </h4>

            <div className="grid min-w-0 grid-cols-2 gap-2 min-[420px]:grid-cols-3 sm:grid-cols-2 lg:grid-cols-3">
              {Object.values(pagamentoConfig).map((pay: any) => {
                const isActive = session.paid === pay.value

                return (
                  <button
                    key={pay.label}
                    type="button"
                    onClick={() =>
                      onChangeSession(session.id, "paid", pay.value)
                    }
                    className={`flex min-h-10 w-full items-center justify-center rounded-lg border border-transparent px-2 py-2 text-center text-xs font-semibold transition sm:text-sm ${isActive ? pay.button.active : pay.button.inactive
                      }`}
                  >
                    {pay.label}
                  </button>
                )
              })}
            </div>
          </section>

          <section className="min-w-0 rounded-md border border-[#EAECF0] bg-white p-3 sm:col-span-2">
            <h4 className="mb-3 text-xs font-semibold tracking-wide text-[#667085] uppercase">
              Agenda
            </h4>
            {canEditSchedule ? (
              <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="min-w-0 sm:col-span-2">
                  <span className="mb-2 block text-xs font-medium text-[#667085]">
                    Dia da semana
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {daysOfWeek.map((day) => {
                      const isSelected = selectedDay === day
                      const isNextSessionDay = day === nextSessionWeekDay
                      return (
                        <button
                          key={day}
                          type="button"
                          aria-pressed={isSelected}
                          disabled={isNextSessionDay}
                          title={isNextSessionDay ? "Dia reservado para a próxima sessão" : undefined}
                          onClick={() => handleSelectDay(day)}
                          className={`rounded-md border px-2 py-1 text-xs font-medium transition ${isSelected ? "border-[#FDB022] bg-[#FFF7E8] text-[#B54708]" : "border-[#D0D5DD] bg-white text-[#344054] hover:bg-[#F9FAFB]"} disabled:cursor-not-allowed disabled:opacity-40`}
                        >
                          {day}
                        </button>
                      )
                    })}
                  </div>
                  {nextSessionWeekDay && (
                    <p className="mt-1 text-xs text-slate-500">
                      O dia da próxima sessão ({nextSessionWeekDay}) está indisponível.
                    </p>
                  )}
                </div>
                <div className="min-w-0">
                  <span className="mb-1 block text-xs font-medium text-[#667085]">
                    Data
                  </span>
                  <DatePicker date={currentDate} setDate={handleSelectDate} />
                </div>
                <label className="flex flex-col gap-1 text-xs font-medium text-[#667085]">
                  Horário
                  <select
                    value={(session.time ?? defaultTime).slice(0, 5)}
                    onChange={(event) => onChangeSession(session.id, "time", event.target.value)}
                    className="w-full rounded-lg border border-[#D0D5DD] bg-white px-3 py-2 text-sm text-[#344054] outline-none"
                  >
                    {timeOptions.map((time) => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </label>
              </div>
            ) : (
              <div className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
                <p>{format(currentDate, "dd/MM/yyyy")}</p>
                <p className="mt-1">{(session.time ?? defaultTime).slice(0, 5)}</p>
                <p className="mt-1 text-xs text-slate-500">
                  Agenda só pode ser alterada enquanto a sessão estiver pendente.
                </p>
              </div>
            )}
          </section>

        </div>

        <button
          type="button"
          onClick={() => onOpenDeleteModal(session.id, session.number)}
          className="flex h-10.5 w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100 sm:ml-auto sm:w-auto"
        >
          <Trash2 className="h-4 w-4" />
          Excluir
        </button>
      </div>
    </div>
  )
}
