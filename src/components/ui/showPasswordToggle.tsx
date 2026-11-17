"use client"

import { Eye, EyeOff } from "lucide-react"

type ShowPasswordToggleProps = {
  visible: boolean
  onToggle: () => void
  // ids dos campos de senha controlados (acessibilidade)
  controls: string
}

// Um único botão "Mostrar senha" por formulário: mostra/oculta todos os campos de senha dele.
export function ShowPasswordToggle({ visible, onToggle, controls }: ShowPasswordToggleProps) {
  const Icon = visible ? EyeOff : Eye
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={visible}
      aria-controls={controls}
      className="mt-2 inline-flex items-center gap-2 self-start rounded-md px-1 py-1 font-open-sans text-sm font-medium text-[#8C7B6B] transition cursor-pointer hover:text-[#E65100] active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFA726]"
    >
      <Icon size={16} aria-hidden="true" />
      {visible ? "Ocultar senha" : "Mostrar senha"}
    </button>
  )
}
