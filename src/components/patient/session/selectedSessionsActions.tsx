import { Trash2 } from "lucide-react"

export type SelectedSessionsStatus = {
  finish: {
    allFinished: boolean
    allPending: boolean
    allCancelled: boolean
  }

  payment: {
    allPaid: boolean
    allPending: boolean
    allCancelled: boolean
  }
}

export type SelectedSessionsActionHandlers = {
  finish: {
    markFinished: () => void
    markPending: () => void
    markCancelled: () => void
  }

  payment: {
    markPaid: () => void
    markPending: () => void
    markCancelled: () => void
  }

  clear: () => void
  delete: () => void
}

type SelectedSessionsActionsProps = {
  selectedCount: number
  status: SelectedSessionsStatus
  actions: SelectedSessionsActionHandlers
}

export function SelectedSessionsActions({
  selectedCount,
  status,
  actions,
}: SelectedSessionsActionsProps) {
  if (selectedCount === 0) return null

  const finishActiveClass = "bg-green-100 text-green-700 border-green-300"
  const pendingActiveClass = "bg-yellow-100 text-yellow-700 border-yellow-300"
  const neutralClass =
    "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"

  return (
    <section className="sticky bottom-4 z-20 mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-lg">
      <div className="flex flex-col gap-4">
        <header className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              {selectedCount}{" "}
              {selectedCount === 1
                ? "sessão selecionada"
                : "sessões selecionadas"}
            </p>

            <p className="text-sm text-slate-500">
              Escolha o status que deseja aplicar.
            </p>
          </div>

          <button
            type="button"
            onClick={actions.clear}
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 cursor-pointer"
          >
            Limpar
          </button>
        </header>

        <div className="grid grid-cols-[1fr_1fr_auto] gap-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="mb-2 text-xs font-semibold uppercase text-slate-500">
              Realização
            </p>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={actions.finish.markFinished}
                className={`rounded-lg border px-3 py-2 text-sm font-medium transition cursor-pointer ${
                  status.finish.allFinished ? finishActiveClass : neutralClass
                }`}
              >
                Realizada
              </button>

              <button
                type="button"
                onClick={actions.finish.markPending}
                className={`rounded-lg border px-3 py-2 text-sm font-medium transition cursor-pointer ${
                  status.finish.allPending ? pendingActiveClass : neutralClass
                }`}
              >
                Pendente
              </button>

              <button
                type="button"
                onClick={actions.finish.markCancelled}
                className={`rounded-lg border px-3 py-2 text-sm font-medium transition cursor-pointer ${
                  status.finish.allCancelled
                    ? "border-red-300 bg-red-100 text-red-700"
                    : neutralClass
                }`}
              >
                Cancelar
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="mb-2 text-xs font-semibold uppercase text-slate-500">
              Pagamento
            </p>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={actions.payment.markPaid}
                className={`rounded-lg border px-3 py-2 text-sm font-medium transition cursor-pointer ${
                  status.payment.allPaid
                    ? "border-green-300 bg-green-100 text-green-700"
                    : neutralClass
                }`}
              >
                Realizado
              </button>

              <button
                type="button"
                onClick={actions.payment.markPending}
                className={`rounded-lg border px-3 py-2 text-sm font-medium transition cursor-pointer ${
                  status.payment.allPending
                    ? "border-blue-300 bg-blue-100 text-blue-700"
                    : neutralClass
                }`}
              >
                Pendente
              </button>

              <button
                type="button"
                onClick={actions.payment.markCancelled}
                className={`rounded-lg border px-3 py-2 text-sm font-medium transition cursor-pointer ${
                  status.payment.allCancelled
                    ? "border-red-300 bg-red-100 text-red-700"
                    : neutralClass
                }`}
              >
                Cancelar
              </button>
            </div>
          </div>

          <div className="">
            <button
              type="button"
              onClick={actions.delete}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-red-200 bg-red-50 text-red-600 transition-colors hover:bg-red-100 cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
