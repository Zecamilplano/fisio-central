import { Loader2, Save } from "lucide-react"
import { ProgressActionButton } from "@/components/ui/progressActionButton"

type EvolutionFormFooterProps = {
  mode: "create" | "edit"
  isSaving: boolean
  // incompleto (ou sem alterações na edição): botão com aparência desativada,
  // mas ainda clicável para mostrar os erros e rolar até eles
  canSave: boolean
  onCancel: () => void
}

export default function EvolutionFormFooter({
  mode,
  isSaving,
  canSave,
  onCancel,
}: EvolutionFormFooterProps) {
  return (
    <footer className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-slate-200 bg-white/95 px-5 py-4 backdrop-blur md:flex-row md:justify-end md:px-8">
      <button
        type="button"
        onClick={onCancel}
        disabled={isSaving}
        className="cursor-pointer rounded-xl border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
      >
        Cancelar
      </button>

      {/* barra de progresso enquanto salva (mesmo botão do cadastro) */}
      <ProgressActionButton
        type="submit"
        disabled={isSaving}
        loading={isSaving}
        aria-disabled={!canSave || undefined}
        title={!canSave ? (mode === "edit" ? "Nenhuma alteração para salvar" : "Preencha os campos obrigatórios") : undefined}
        className={`rounded-xl px-6 py-3 text-sm font-semibold transition disabled:cursor-wait ${
          canSave || isSaving
            ? "bg-emerald-700 text-white hover:bg-emerald-800 disabled:opacity-80 disabled:hover:bg-emerald-700"
            : "bg-emerald-700/40 text-white/90 hover:bg-emerald-700/50"
        }`}
      >
        <span className="flex items-center justify-center gap-2">
          {isSaving ? (
            <Loader2 size={18} className="animate-spin" aria-hidden="true" />
          ) : (
            <Save size={18} aria-hidden="true" />
          )}

          {isSaving
            ? "Salvando..."
            : mode === "create"
              ? "Salvar evolução"
              : "Salvar alterações"}
        </span>
      </ProgressActionButton>
    </footer>
  )
}
