import { Trash2 } from "lucide-react"

type DeleteSessionModalProps = {
  isOpen: boolean
  sessionNumber: number | null
  createReplacementSession: boolean
  setCreateReplacementSession: (value: boolean) => void
  onClose: () => void
  onConfirm: () => void
}

export function DeleteSessionModal({
  isOpen,
  sessionNumber,
  createReplacementSession,
  setCreateReplacementSession,
  onClose,
  onConfirm,
}: DeleteSessionModalProps) {
  if (!isOpen) return null

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-sm mx-4 animate-scale-in"
      >
        <div className="flex items-start gap-3 mb-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100">
            <Trash2 className="w-6 h-6 text-emerald-600" />
          </div>

          <div className="flex-1">
            <h2 className="text-lg font-semibold text-slate-900">
              Excluir sessão?
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Tem certeza que deseja excluir a sessão{" "}
              <span className="font-medium">#{sessionNumber}</span>?
            </p>
          </div>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-6">
          <p className="text-sm text-emerald-700">
            ⚠️ Esta ação não pode ser desfeita. A sessão será removida
            permanentemente.
          </p>
        </div>

        <fieldset className="mb-6">
          <legend className="sr-only">Opções ao excluir a sessão</legend>

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
                Adicionar nova sessão ao final da agenda
              </span>

              <p className="mt-1 text-xs text-slate-500">
                Uma nova sessão será criada automaticamente na próxima data
                disponível, respeitando os dias de atendimento configurados para
                este paciente.
              </p>
            </div>
          </label>
        </fieldset>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-full font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all outline-none"
          >
            Cancelar
          </button>

          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 rounded-full font-medium text-emerald-700 bg-emerald-100 hover:bg-emerald-200 transition-all outline-none flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Excluir
          </button>
        </div>
      </div>
    </div>
  )
}
