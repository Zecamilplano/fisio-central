import { Calendar, Clock, User } from "lucide-react"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import type { EvolutionFormProps } from "../evolution.types"

type EvolutionFormHeaderProps = Pick<
  EvolutionFormProps,
  "mode" | "patient" | "session" | "defaultTime"
>

export default function EvolutionFormHeader({
  mode,
  patient,
  session,
  defaultTime,
}: EvolutionFormHeaderProps) {
  const sessionDate = parseISO(session.date)
  const sessionWeekDay = format(sessionDate, "EEEE", { locale: ptBR })
    .replace("-feira", "")
    .replace(/^./, (letter) => letter.toUpperCase())

  return (
    <>
      <header className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-emerald-700 md:text-3xl">
          {mode === "create"
            ? "Adicionar evolução fisioterapêutica"
            : "Editar evolução fisioterapêutica"}
        </h1>
      </header>

      <section className="mb-5 flex flex-col gap-5 rounded-2xl border border-slate-200 bg-slate-50/70 p-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
            <User size={28} className="text-emerald-700" />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              {patient.name}
            </h2>

            <p className="text-sm text-slate-500">{patient.typeService}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm sm:grid-cols-3">
          <div className="flex items-center gap-2 text-slate-700">
            <Calendar size={17} className="text-emerald-700" />
            <span>{format(sessionDate, "dd/MM/yyyy")}</span>
          </div>

          <div className="flex items-center gap-2 text-slate-700">
            <Clock size={17} className="text-emerald-700" />
            <span>{session.time ?? defaultTime}</span>
          </div>

          <span className="text-slate-700">{sessionWeekDay}</span>
        </div>
      </section>
    </>
  )
}
