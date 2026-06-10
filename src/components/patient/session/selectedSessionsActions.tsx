import { paymentActions, sessionActions } from "@/data/optionsSessionsData"
import type { PaidKey } from "@/types"

type SelectedSessionsActionsProps = {
  selectedSessions: string[]
  allFinished: boolean
  allPending: boolean
  allPaid: boolean
  allCancelled: boolean
  allUnpaid: boolean
  changeFinishStatus: (value: boolean) => void
  changePaymentStatus: (value: PaidKey) => void
  clearSelection: () => void
}

export function SelectedSessionsActions({
  selectedSessions,
  allFinished,
  allPending,
  allPaid,
  allCancelled,
  allUnpaid,
  changeFinishStatus,
  changePaymentStatus,
  clearSelection,
}: SelectedSessionsActionsProps) {
  return (
    <section aria-labelledby="selected-sessions">
      <div className="flex w-full justify-between">
        <h2
          id="selected-sessions"
          className="mb-4 mt-2 text-sm font-semibold text-gray-900"
        >
          {selectedSessions.length} selecionada
          {selectedSessions.length > 1 && "s"}
        </h2>

        <button
          onClick={clearSelection}
          className="text-slate-400 hover:text-slate-600"
        >
          ✕
        </button>
      </div>

      <div className="space-y-4">
        <section aria-labelledby="session-status">
          <h3
            id="session-status"
            className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500"
          >
            Status da Sessão
          </h3>

          <ul className="flex w-auto flex-wrap gap-2">
            {sessionActions.map((action) => {
              const isActive =
                action.value === "realizado" ? allFinished : allPending

              return (
                <li key={action.value}>
                  <button
                    type="button"
                    onClick={() =>
                      changeFinishStatus(action.value === "realizado")
                    }
                    className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                      isActive ? action.active : action.inactive
                    }`}
                  >
                    {action.label}
                  </button>
                </li>
              )
            })}
          </ul>
        </section>

        <section aria-labelledby="payment-status">
          <h3
            id="payment-status"
            className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500"
          >
            Status do Pagamento
          </h3>

          <ul className="flex flex-wrap gap-2">
            {paymentActions.map((action) => {
              const isActive =
                action.value === "pago"
                  ? allPaid
                  : action.value === "cancelado"
                    ? allCancelled
                    : allUnpaid

              return (
                <li key={action.value}>
                  <button
                    type="button"
                    onClick={() => changePaymentStatus(action.value)}
                    className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                      isActive ? action.active : action.inactive
                    }`}
                  >
                    {action.label}
                  </button>
                </li>
              )
            })}
          </ul>
        </section>
      </div>
    </section>
  )
}
