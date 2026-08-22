import type { ReactNode } from "react"

type EvolutionSectionProps = {
  title: string
  error?: string
  icon: ReactNode
  optional?: boolean
  className?: string
  children: ReactNode
}

export default function EvolutionSection({
  title,
  error,
  icon,
  optional = false,
  className = "",
  children,
}: EvolutionSectionProps) {
  return (
    <section
      className={`rounded-2xl border border-slate-200 p-5 shadow-sm ${className}`}
    >
      <div className="mb-4 flex items-center gap-2 text-emerald-600">
        {icon}

        <h3 className="font-semibold text-slate-800">{title}</h3>

        {optional && (
          <span className="text-xs font-normal text-slate-400">(opcional)</span>
        )}
      </div>

      {children}
      {error && (
        <p className="mt-2 text-sm font-medium text-red-600">{error}</p>
      )}
    </section>
  )
}
