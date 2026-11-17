import type { DayOfWeek } from "@/types"
import { daysOfWeek } from "@/data"
import { inputBaseClass } from "./editPatientHelpers"

type PatientScheduleSectionProps = {
  hasPendingSessions: boolean
  startDate: string
  sessionsPerWeek: number
  weekDays: DayOfWeek[]
  error: string
  disabled: boolean
  onStartDateChange: (value: string) => void
  onSessionsPerWeekChange: (value: number) => void
  onToggleDay: (day: DayOfWeek, selected: boolean) => void
}

// Agenda global (data inicial, frequência e dias) das sessões pendentes do pacote
export function PatientScheduleSection({
  hasPendingSessions,
  startDate,
  sessionsPerWeek,
  weekDays,
  error,
  disabled,
  onStartDateChange,
  onSessionsPerWeekChange,
  onToggleDay,
}: PatientScheduleSectionProps) {
  return (
    <section className="space-y-4 border-t border-slate-200 pt-5">
      <div>
        <h3 className="text-base font-semibold text-slate-800">
          Agenda global das sessões pendentes
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          A data inicial, frequência e dias escolhidos serão aplicados a todas as sessões pendentes deste paciente.
        </p>
      </div>

      {hasPendingSessions ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1.5 text-sm font-medium text-slate-700">
              Data inicial
              <input
                type="date"
                value={startDate}
                disabled={disabled}
                onChange={(event) => onStartDateChange(event.target.value)}
                className={`${inputBaseClass} border-slate-300`}
              />
            </label>
            <label className="space-y-1.5 text-sm font-medium text-slate-700">
              Sessões por semana
              <input
                type="number"
                min={1}
                max={daysOfWeek.length}
                step={1}
                value={sessionsPerWeek}
                disabled={disabled}
                onChange={(event) => {
                  const value = Number(event.target.value)
                  if (!Number.isInteger(value) || value < 1 || value > daysOfWeek.length) return
                  onSessionsPerWeekChange(value)
                }}
                className={`${inputBaseClass} border-slate-300`}
              />
            </label>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">
              Dias da semana ({weekDays.length}/{sessionsPerWeek})
            </p>
            <div className="flex flex-wrap gap-2">
              {daysOfWeek.map((day) => {
                const selected = weekDays.includes(day)
                const reachedLimit = weekDays.length >= sessionsPerWeek
                return (
                  <button
                    key={day}
                    type="button"
                    disabled={disabled || (!selected && reachedLimit)}
                    aria-pressed={selected}
                    onClick={() => onToggleDay(day, selected)}
                    className={`rounded-full border px-3 py-1.5 text-sm transition ${selected ? "border-amber-400 bg-amber-50 font-medium text-amber-800" : "border-slate-300 text-slate-600 hover:bg-slate-50"} disabled:cursor-not-allowed disabled:opacity-50`}
                  >
                    {day}
                  </button>
                )
              })}
            </div>
            {error && (
              <p role="alert" className="mt-2 text-xs text-red-600">
                {error}
              </p>
            )}
          </div>
        </>
      ) : (
        <p className="rounded-lg bg-slate-50 px-3 py-3 text-sm text-slate-500">
          Não há sessões pendentes para editar.
        </p>
      )}
    </section>
  )
}
