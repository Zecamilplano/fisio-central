import { Activity } from "lucide-react"

import EvolutionSection from "./evolutionSection"

type EvolutionPainSectionProps = {
  painBefore: number | null
  painAfter: number | null

  warningBefore?: string
  warningAfter?: string

  onChangeBefore: (value: number | null) => void
  onChangeAfter: (value: number | null) => void
}

export default function EvolutionPainSection({
  painBefore,
  painAfter,
  warningBefore,
  warningAfter,
  onChangeBefore,
  onChangeAfter,
}: EvolutionPainSectionProps) {
  return (
    <EvolutionSection
      title="Escala de dor (EVA)"
      optional="opcional"
      icon={<Activity size={20} />}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col">
          <PainField
            label="Antes da sessão"
            value={painBefore}
            variant="before"
            onChange={onChangeBefore}
          />
          {warningBefore && (
            <p
              role="status"
              aria-live="polite"
              className=" flex items-center pl-2 py-2 rounded-lg text-sm font-medium border border-amber-200 bg-amber-50 text-amber-800"
            >
              {warningBefore}
            </p>
          )}
        </div>

        <div className="flex flex-col">
          <PainField
            label="Depois da sessão"
            value={painAfter}
            variant="after"
            onChange={onChangeAfter}
          />
          {warningAfter && (
            <p
              role="status"
              aria-live="polite"
              className="flex items-center pl-2 py-2 rounded-lg text-sm font-medium border border-amber-200 bg-amber-50 text-amber-800"
            >
              {warningAfter}
            </p>
          )}
        </div>
      </div>
    </EvolutionSection>
  )
}

type PainFieldProps = {
  label: string
  value: number | null
  variant: "before" | "after"
  onChange: (value: number | null) => void
}

function PainField({ label, value, variant, onChange }: PainFieldProps) {
  const isBefore = variant === "before"

  return (
    <label
      className={`rounded-xl border p-4 ${
        isBefore
          ? "border-red-100 bg-red-50"
          : "border-emerald-100 bg-emerald-50"
      }`}
    >
      <span className="mb-2 block text-center text-sm text-slate-500">
        {label}
      </span>

      <input
        type="number"
        value={value ?? ""}
        onChange={(event) => {
          const nextValue = event.target.value

          onChange(nextValue === "" ? null : Number(nextValue))
        }}
        className={`w-full bg-transparent text-center text-3xl font-bold outline-none ${
          isBefore ? "text-red-500" : "text-emerald-600"
        }`}
      />
    </label>
  )
}
