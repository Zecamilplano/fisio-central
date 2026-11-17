import { Trash2 } from "lucide-react"

type DeletePatientSectionProps = {
  disabled: boolean
  onRequestDelete: () => void
}

// "Zona de perigo" dentro do formulário de edição
export function DeletePatientSection({ disabled, onRequestDelete }: DeletePatientSectionProps) {
  return (
    <section className="space-y-3 border-t border-red-200 pt-5">
      <div>
        <h3 className="text-base font-semibold text-red-700">
          Excluir paciente
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          Apaga permanentemente o cadastro, os pacotes, as sessões, as
          evoluções e a foto deste paciente.
        </p>
      </div>
      <button
        type="button"
        onClick={onRequestDelete}
        disabled={disabled}
        className="inline-flex items-center gap-2 rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 active:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Trash2 size={16} />
        Excluir paciente
      </button>
    </section>
  )
}

type DeletePatientDialogProps = {
  patientName: string
  deletionCounts: { packages: number; sessions: number; evolutions: number }
  confirmationInput: string
  error: string
  isDeleting: boolean
  canConfirm: boolean
  onConfirmationInputChange: (value: string) => void
  onCancel: () => void
  onConfirm: () => void
}

// Confirmação final: o usuário precisa digitar o nome completo do paciente
export function DeletePatientDialog({
  patientName,
  deletionCounts,
  confirmationInput,
  error,
  isDeleting,
  canConfirm,
  onConfirmationInputChange,
  onCancel,
  onConfirm,
}: DeletePatientDialogProps) {
  return (
    <div
      className="fixed inset-0 z-[10002] flex items-center justify-center bg-slate-950/60 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isDeleting) onCancel()
      }}
    >
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-patient-title"
        aria-describedby="delete-patient-description"
        className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl"
      >
        <h2 id="delete-patient-title" className="text-lg font-semibold text-red-700">
          Excluir {patientName} permanentemente?
        </h2>
        <p id="delete-patient-description" className="mt-2 text-sm text-slate-600">
          Esta ação não pode ser desfeita. Serão apagados:
        </p>
        <ul className="my-3 list-inside list-disc rounded-lg bg-red-50 px-3 py-3 text-sm text-red-800">
          <li>{deletionCounts.packages} pacotes</li>
          <li>{deletionCounts.sessions} sessões</li>
          <li>{deletionCounts.evolutions} evoluções</li>
          <li>O cadastro e a foto de perfil</li>
        </ul>

        <label className="block text-sm font-medium text-slate-700">
          Para confirmar, digite o nome completo do paciente:
          <input
            autoFocus
            value={confirmationInput}
            onChange={(event) => onConfirmationInputChange(event.target.value)}
            disabled={isDeleting}
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 disabled:bg-slate-100"
            autoComplete="off"
          />
        </label>

        {error && (
          <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!canConfirm || isDeleting}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isDeleting ? "Excluindo paciente..." : "Excluir permanentemente"}
          </button>
        </div>
      </section>
    </div>
  )
}
