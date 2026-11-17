"use client"

import { useState } from "react"
import { format, parseISO } from "date-fns"
import { AlertTriangle, ChevronDown } from "lucide-react"
import type { IncompleteRegistration } from "@/services/patients/patientListRepository"

type IncompleteRegistrationsProps = {
  registrations: IncompleteRegistration[]
  onContinue: (id: string) => void
  onDelete: (registration: IncompleteRegistration) => Promise<void>
}

// Cadastros abandonados depois da etapa 1 (paciente salvo, sem atendimento).
export function IncompleteRegistrations({
  registrations,
  onContinue,
  onDelete,
}: IncompleteRegistrationsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  if (registrations.length === 0) return null

  async function handleDelete(registration: IncompleteRegistration) {
    const confirmed = window.confirm(
      `Excluir o cadastro incompleto de ${registration.name}? Os dados pessoais e a foto serão apagados.`
    )
    if (!confirmed) return

    setDeletingId(registration.id)
    try {
      await onDelete(registration)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <section className="mb-2 rounded-md border border-amber-200 bg-amber-50 font-open-sans lg:ml-2">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium text-amber-900 transition cursor-pointer hover:bg-amber-100 active:bg-amber-200"
      >
        <AlertTriangle size={16} aria-hidden="true" className="shrink-0" />
        <span className="flex-1">
          {registrations.length === 1
            ? "1 cadastro incompleto"
            : `${registrations.length} cadastros incompletos`}
        </span>
        <ChevronDown
          size={16}
          aria-hidden="true"
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <ul className="border-t border-amber-200">
          {registrations.map((registration) => (
            <li
              key={registration.id}
              className="flex flex-wrap items-center gap-2 border-b border-amber-100 px-3 py-2 last:border-b-0"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-800">
                  {registration.name}
                </p>
                <p className="text-xs text-slate-500">
                  Iniciado em {format(parseISO(registration.createdAt), "dd/MM/yyyy")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onContinue(registration.id)}
                className="rounded-md bg-[#FFA726] px-3 py-1.5 text-xs font-medium text-white transition cursor-pointer hover:opacity-85 active:scale-95"
              >
                Continuar
              </button>
              <button
                type="button"
                onClick={() => handleDelete(registration)}
                disabled={deletingId === registration.id}
                className="rounded-md border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 transition cursor-pointer hover:bg-red-50 active:scale-95 disabled:cursor-wait disabled:opacity-60"
              >
                {deletingId === registration.id ? "Excluindo..." : "Excluir"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
