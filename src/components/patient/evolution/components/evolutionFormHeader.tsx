import { Calendar, Clock, User } from "lucide-react"

type EvolutionFormHeaderProps = {
  mode: "create" | "edit"
}

export default function EvolutionFormHeader({
  mode,
}: EvolutionFormHeaderProps) {
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
              João da Silva
            </h2>

            <p className="text-sm text-slate-500">
              Prontuário: 000123 • 32 anos
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm sm:grid-cols-3">
          <div className="flex items-center gap-2 text-slate-700">
            <Calendar size={17} className="text-emerald-700" />
            <span>10/07/2025</span>
          </div>

          <div className="flex items-center gap-2 text-slate-700">
            <Clock size={17} className="text-emerald-700" />
            <span>16:00</span>
          </div>

          <span className="text-slate-700">sexta-feira</span>
        </div>
      </section>
    </>
  )
}
