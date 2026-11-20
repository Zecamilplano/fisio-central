import { Check, X } from "lucide-react"

type PasswordHintProps = {
  id: string
  ok: boolean
  okText: string
  pendingText: string
}

// Retorno em tempo real enquanto a pessoa digita a senha (antes do erro do blur).
export function PasswordHint({ id, ok, okText, pendingText }: PasswordHintProps) {
  const Icon = ok ? Check : X
  return (
    <span
      id={id}
      aria-live="polite"
      className={`inline-flex items-center gap-1 pl-2 pt-1 text-sm ${
        ok ? "text-green-700" : "text-[#8C7B6B]"
      }`}
    >
      <Icon size={14} aria-hidden="true" />
      {ok ? okText : pendingText}
    </span>
  )
}
