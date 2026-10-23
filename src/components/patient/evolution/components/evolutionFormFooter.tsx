import { Save } from "lucide-react"

type EvolutionFormFooterProps = {
  mode: "create" | "edit"
  isSaving: boolean
  onCancel: () => void
}

export default function EvolutionFormFooter({
  mode,
  isSaving,
  onCancel,
}: EvolutionFormFooterProps) {
  return (
    <footer className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-slate-200 bg-white/95 px-5 py-4 backdrop-blur md:flex-row md:justify-end md:px-8">
      <button
        type="button"
        onClick={onCancel}
        disabled={isSaving}
        className="cursor-pointer rounded-xl border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
      >
        Cancelar
      </button>

      <button
        type="submit"
        disabled={isSaving}
        className="flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
      >
        <Save size={18} />

        {isSaving
          ? "Salvando..."
          : mode === "create"
            ? "Salvar evolução"
            : "Salvar alterações"}
      </button>
    </footer>
  )
}
