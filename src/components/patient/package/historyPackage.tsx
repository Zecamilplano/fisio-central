import {
  Check,
  ChevronDown,
  CircleDot,
  ClipboardPen,
  SquarePen,
  X,
} from "lucide-react"
import { useState } from "react"

export function PackageHistoryModal() {
  const packages = [
    {
      id: 1,
      title: "Pacote Atual",
      status: "Em andamento",
      statusType: "active",
      period: "12/02/2025 — Presente",
      frequency: "1x/sem",
      valueSession: "R$ 60,00/sessão",
      totalSessions: "6 sessões",
      progress: "4/6",
      icon: "A",
    },
    {
      id: 2,
      title: "Pacote #2",
      status: "Concluído",
      statusType: "done",
      period: "01/01/2025 — 10/02/2025",
      frequency: "1x/sem",
      valueSession: "R$ 60,00/sessão",
      totalSessions: "6 sessões",
      progress: "6/6",
      icon: "check",
    },
    {
      id: 3,
      title: "Pacote #1",
      status: "Cancelado",
      statusType: "cancelled",
      period: "01/08/2024 — 20/11/2024",
      frequency: "1x/sem",
      valueSession: "R$ 60,00/sessão",
      totalSessions: "6 sessões",
      progress: "3/6",
      icon: "01",
    },
  ]

  const sessions = [
    {
      id: "1",
      number: 1,
      date: "12/02/2026",
      weekDay: "Quinta",
      finish: false,
      paid: "pendente",
    },
    {
      id: "2",
      number: 2,
      date: "17/02/2026",
      weekDay: "Terça",
      finish: false,
      paid: "pago",
    },
    {
      id: "3",
      number: 3,
      date: "19/02/2026",
      weekDay: "Quinta",
      finish: true,
      paid: "pendente",
    },
  ]
  const [openPackageId, setOpenPackageId] = useState<number | null>(null)

  function handleTogglePackage(packageId: number) {
    setOpenPackageId((currentId) =>
      currentId === packageId ? null : packageId
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4 backdrop-blur-[1px]">
      <div className="w-full max-w-180 overflow-hidden rounded-xl bg-white shadow-2xl">
        <header className="flex items-start justify-between border-b border-slate-200 px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-400 text-xs font-bold text-white">
              JS
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Histórico de Pacotes
              </h2>
              <p className="text-[11px] text-slate-500">João da Silva</p>
            </div>
          </div>

          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
          >
            <X size={16} />
          </button>
        </header>

        <main className="space-y-3 px-5 py-4">
          <div className="flex items-center justify-between rounded-md bg-emerald-500/10 px-4 py-3">
            <div className="flex items-start gap-3">
              <CircleDot className="mt-1 text-emerald-600" size={14} />

              <div>
                <p className="text-sm font-semibold text-emerald-700">
                  Início do tratamento: 01/08/2024
                </p>
                <p className="text-xs text-slate-500">
                  3 pacotes • Pacote atual em andamento
                </p>
              </div>
            </div>

            <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] font-semibold text-emerald-700">
              Ativo
            </span>
          </div>

          <div className="space-y-2">
            {packages.map((pkg) => {
              const isActive = pkg.statusType === "active"
              const isDone = pkg.statusType === "done"
              const isCancelled = pkg.statusType === "cancelled"

              return (
                <div
                  key={pkg.id}
                  className={`flex flex-col items-center gap-3 rounded-lg border px-4 py-3 transition ${
                    isActive
                      ? "border-emerald-500 bg-emerald-50/20"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  {/*Parte de cima*/}
                  <div className="flex items-center gap-2 w-full h-full ">
                    <div
                      className={`flex self-center h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                        isActive
                          ? "bg-amber-400 text-white"
                          : isDone
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-600"
                      }`}
                    >
                      {pkg.icon === "check" ? <Check size={16} /> : pkg.icon}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-slate-800">
                          {pkg.title}
                        </h3>

                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            isActive
                              ? "bg-amber-100 text-amber-700"
                              : isDone
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-red-100 text-red-700"
                          }`}
                        >
                          {pkg.status}
                        </span>
                      </div>

                      <p className="mt-0.5 text-xs text-slate-500">
                        {pkg.period} • {pkg.frequency}
                      </p>

                      <p className="mt-1 text-xs font-semibold text-slate-700">
                        {pkg.valueSession} • {pkg.totalSessions}
                      </p>
                    </div>

                    <div className="flex min-w-17.5 flex-col items-end">
                      <p className="text-sm font-bold text-slate-800">
                        {pkg.progress}
                      </p>
                      <p className="text-[10px] text-slate-500">sessões</p>

                      <div className="mt-1 h-0.5 w-14 rounded-full bg-slate-200">
                        <div
                          className={`h-full rounded-full ${
                            isDone ? "bg-emerald-500" : "bg-amber-400"
                          }`}
                          style={{
                            width:
                              pkg.progress === "6/6"
                                ? "100%"
                                : pkg.progress === "4/6"
                                  ? "66%"
                                  : "50%",
                          }}
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setOpenPackageId(pkg.id)}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200"
                    >
                      <ChevronDown
                        size={15}
                        className={`transition-transform ${
                          openPackageId === pkg.id ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  </div>

                  {/*Opções*/}
                  {openPackageId === pkg.id && (
                    <div className="flex flex-col gap-3 w-full">
                      {sessions.map((session) => (
                        <div
                          key={session.id}
                          className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm"
                        >
                          <input
                            type="checkbox"
                            className="h-5 w-5 rounded border-slate-300"
                          />

                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-yellow-100 text-base font-bold text-yellow-600">
                            {session.number}
                          </div>

                          <div className="min-w-23.75">
                            <p className="text-sm font-semibold text-slate-700">
                              {session.date}
                            </p>
                            <p className="text-xs text-slate-400">
                              {session.weekDay}
                            </p>
                          </div>

                          <div className="flex items-center gap-6">
                            <div className="text-center">
                              <p className="mb-1 text-[11px] font-semibold uppercase text-slate-500">
                                Realização
                              </p>

                              <span
                                className={`rounded-full px-4 py-1 text-sm font-medium ${
                                  session.finish
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-yellow-100 text-orange-600"
                                }`}
                              >
                                {session.finish ? "Realizado" : "Pendente"}
                              </span>
                            </div>

                            <div className="text-center">
                              <p className="mb-1 text-[11px] font-semibold uppercase text-slate-500">
                                Pagamento
                              </p>

                              <span
                                className={`block w-25 rounded-full px-4 py-1 text-sm font-medium ${
                                  session.paid === "pago"
                                    ? "bg-emerald-100 text-emerald-700"
                                    : session.paid === "cancelado"
                                      ? "bg-red-100 text-red-600"
                                      : "bg-sky-100 text-sky-700"
                                }`}
                              >
                                {session.paid === "pago"
                                  ? "Pago"
                                  : session.paid === "cancelado"
                                    ? "Cancelado"
                                    : "Pendente"}
                              </span>
                            </div>

                            {/*evolução*/}
                            <button
                              type="button"
                              className="flex  items-center justify-center gap-2 rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 outline-none px-2 py-2"
                            >
                              <ClipboardPen />
                            </button>

                            <button
                              type="button"
                              className="flex  items-center justify-center gap-2 rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 outline-none px-2 py-2"
                            >
                              <SquarePen size={18} />
                              Editar
                              <ChevronDown size={18} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </main>

        <footer className="flex justify-end gap-3 border-t border-slate-200 px-5 py-3">
          <button
            type="button"
            className="rounded-md border border-slate-300 px-5 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            Fechar
          </button>

          <button
            type="button"
            className="rounded-md bg-emerald-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            + Novo Pacote
          </button>
        </footer>
      </div>
    </div>
  )
}
