import { paymentActions, sessionActions } from "@/data/optionsSessionsData"
import type { PaidKey } from "@/types"

type SelectedSessionsActionsProps = {
  selectedCount: number
  allFinished: boolean
  allPending: boolean
  allPaid: boolean
  allCancelled: boolean
  allUnpaid: boolean
  onMarkFinished: () => void
  onMarkPending: () => void
  onMarkPaid: () => void
  onMarkUnpaid: () => void
  onMarkCancelled: () => void
  onClearSelection: () => void
}

export function SelectedSessionsActions({
  selectedCount,
  allFinished,
  allPending,
  allPaid,
  allCancelled,
  allUnpaid,
  onMarkFinished,
  onMarkPending,
  onMarkPaid,
  onMarkUnpaid,
  onMarkCancelled,
  onClearSelection,
}: SelectedSessionsActionsProps) {
  if (selectedCount === 0) return null

  return (
    <section className="sticky bottom-4 z-20 rounded-2xl border border-[#EAECF0] bg-white p-4 shadow-lg">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-[#101828]">
            {selectedCount}{" "}
            {selectedCount === 1
              ? "sessão selecionada"
              : "sessões selecionadas"}
          </p>

          <p className="text-sm text-[#667085]">
            Altere o status das sessões selecionadas.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {!allFinished && (
            <button
              type="button"
              onClick={onMarkFinished}
              className="rounded-lg bg-[#12B76A] px-3 py-2 text-sm font-medium text-white hover:bg-[#039855]"
            >
              Marcar realizada
            </button>
          )}

          {!allPending && (
            <button
              type="button"
              onClick={onMarkPending}
              className="rounded-lg border border-[#D0D5DD] bg-white px-3 py-2 text-sm font-medium text-[#344054] hover:bg-[#F9FAFB]"
            >
              Marcar pendente
            </button>
          )}

          {!allPaid && (
            <button
              type="button"
              onClick={onMarkPaid}
              className="rounded-lg bg-[#1570EF] px-3 py-2 text-sm font-medium text-white hover:bg-[#175CD3]"
            >
              Pago
            </button>
          )}

          {!allUnpaid && (
            <button
              type="button"
              onClick={onMarkUnpaid}
              className="rounded-lg border border-[#D0D5DD] bg-white px-3 py-2 text-sm font-medium text-[#344054] hover:bg-[#F9FAFB]"
            >
              Não pago
            </button>
          )}

          {!allCancelled && (
            <button
              type="button"
              onClick={onMarkCancelled}
              className="rounded-lg bg-[#F04438] px-3 py-2 text-sm font-medium text-white hover:bg-[#D92D20]"
            >
              Cancelar
            </button>
          )}

          <button
            type="button"
            onClick={onClearSelection}
            className="rounded-lg px-3 py-2 text-sm font-medium text-[#667085] hover:bg-[#F2F4F7]"
          >
            Limpar
          </button>
        </div>
      </div>
    </section>
  )
}
