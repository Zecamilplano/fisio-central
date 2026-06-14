import { Trash2 } from "lucide-react"

type DeleteSessionModalProps = {
  isOpen: boolean
  sessionNumber: number | null
  createReplacementSession: boolean
  isDeletingAllSessions?: boolean
  selectedCount?: number
  setCreateReplacementSession: (value: boolean) => void
  onClose: () => void
  onConfirm: () => void
}

export function DeleteSessionModal({
  isOpen,
  sessionNumber,
  createReplacementSession,
  isDeletingAllSessions = false,
  selectedCount = 1,
  setCreateReplacementSession,
  onClose,
  onConfirm,
}: DeleteSessionModalProps) {
  if (!isOpen) return null

  const isMultipleSelection = selectedCount > 1 && !isDeletingAllSessions

  return (
    <div
      onClick={onClose}
      className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-scale-in mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-lg"
      >
        <div className="mb-4 flex items-start gap-3">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-full ${
              isDeletingAllSessions ? "bg-amber-100" : "bg-red-100"
            }`}
          >
            <Trash2
              className={`h-6 w-6 ${
                isDeletingAllSessions ? "text-amber-600" : "text-red-600"
              }`}
            />
          </div>

          <div className="flex-1">
            <h2 className="text-lg font-semibold text-slate-900">
              {isDeletingAllSessions
                ? "Excluir todas as sessões?"
                : isMultipleSelection
                  ? `Excluir ${selectedCount} sessões?`
                  : "Excluir sessão?"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {isDeletingAllSessions ? (
                <>Todas as sessões deste paciente serão removidas.</>
              ) : isMultipleSelection ? (
                <>
                  Tem certeza que deseja excluir as{" "}
                  <span className="font-medium">
                    {selectedCount} sessões selecionadas
                  </span>
                  ?
                </>
              ) : (
                <>
                  Tem certeza que deseja excluir a sessão{" "}
                  <span className="font-medium">#{sessionNumber}</span>?
                </>
              )}
            </p>
          </div>
        </div>

        <div
          className={`mb-6 rounded-lg border p-3 ${
            isDeletingAllSessions
              ? "border-amber-200 bg-amber-50"
              : "border-red-200 bg-red-50"
          }`}
        >
          <p
            className={`text-sm ${
              isDeletingAllSessions ? "text-amber-700" : "text-red-700"
            }`}
          >
            {isDeletingAllSessions ? (
              <>
                ⚠️ Você está prestes a excluir todas as sessões deste paciente.
                Esta ação não poderá ser desfeita.
              </>
            ) : (
              <>
                ⚠️ Esta ação não poderá ser desfeita. As sessões selecionadas
                serão removidas permanentemente.
              </>
            )}
          </p>
        </div>

        <fieldset className="mb-6">
          <legend className="sr-only">Opções ao excluir sessões</legend>

          <label
            htmlFor="replacement-session"
            className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-3 transition-colors hover:bg-slate-50"
          >
            <input
              id="replacement-session"
              type="checkbox"
              checked={createReplacementSession}
              onChange={(e) => setCreateReplacementSession(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />

            <div>
              <span className="block text-sm font-medium text-slate-800">
                Adicionar sessão(s) ao final da agenda
              </span>

              <p className="mt-1 text-xs text-slate-500">
                Será criada automaticamente uma nova sessão para cada sessão
                removida, respeitando os dias de atendimento configurados para
                este paciente.
              </p>
            </div>
          </label>
        </fieldset>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-full bg-slate-100 px-4 py-2 font-medium text-slate-700 outline-none transition-all hover:bg-slate-200"
          >
            Cancelar
          </button>

          <button
            onClick={onConfirm}
            className={`flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2.5 font-medium outline-none transition-all ${
              isDeletingAllSessions
                ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                : "bg-red-100 text-red-700 hover:bg-red-200"
            }`}
          >
            <Trash2 className="h-4 w-4" />
            Excluir
          </button>
        </div>
      </div>
    </div>
  )
}
