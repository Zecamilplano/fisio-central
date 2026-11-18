"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

const RESEND_COOLDOWN_SECONDS = 60

type EmailConfirmationNoticeProps = {
  email: string | null
  // "signup": logo após o cadastro; "login": tentou entrar sem confirmar
  reason: "signup" | "login"
}

// Aviso fixo de que a conta precisa ser confirmada pelo link do e-mail,
// com opção de reenviar o link (Supabase limita os envios, daí a espera).
export function EmailConfirmationNotice({ email, reason }: EmailConfirmationNoticeProps) {
  const [cooldown, setCooldown] = useState(reason === "signup" ? RESEND_COOLDOWN_SECONDS : 0)
  const [isSending, setIsSending] = useState(false)
  const [feedback, setFeedback] = useState<{ type: "ok" | "error"; text: string } | null>(null)

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setTimeout(() => setCooldown((value) => value - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  async function handleResend() {
    if (!email || isSending || cooldown > 0) return
    setIsSending(true)
    setFeedback(null)

    const { error } = await createClient().auth.resend({ type: "signup", email })

    setIsSending(false)
    if (error) {
      setFeedback({
        type: "error",
        text:
          error.code === "over_email_send_rate_limit" || error.status === 429
            ? "Muitos envios seguidos. Aguarde alguns minutos e tente de novo."
            : "Não foi possível reenviar o e-mail. Tente novamente.",
      })
      return
    }

    setFeedback({ type: "ok", text: "Enviamos um novo link. Confira sua caixa de entrada." })
    setCooldown(RESEND_COOLDOWN_SECONDS)
  }

  return (
    <div
      role="status"
      className="font-open-sans mx-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-900"
    >
      <p className="font-semibold">
        {reason === "signup" ? "Cadastro feito! Falta confirmar seu e-mail." : "Seu e-mail ainda não foi confirmado."}
      </p>
      <p className="mt-1">
        Enviamos um link de confirmação para{" "}
        {email ? <strong className="break-all">{email}</strong> : "o seu e-mail"}. Abra a
        mensagem e clique no link para ativar a conta; depois é só entrar aqui.
      </p>
      <p className="mt-1 text-amber-800">Não chegou? Confira a pasta de spam ou lixo eletrônico.</p>

      {email && (
        <button
          type="button"
          onClick={handleResend}
          disabled={isSending || cooldown > 0}
          className="mt-2 font-semibold underline underline-offset-2 transition cursor-pointer hover:text-amber-700 disabled:cursor-not-allowed disabled:no-underline disabled:opacity-60"
        >
          {isSending
            ? "Reenviando..."
            : cooldown > 0
              ? `Reenviar e-mail (aguarde ${cooldown}s)`
              : "Reenviar e-mail de confirmação"}
        </button>
      )}

      {feedback && (
        <p
          role={feedback.type === "error" ? "alert" : undefined}
          className={`mt-1 ${feedback.type === "error" ? "text-red-700" : "text-emerald-700"}`}
        >
          {feedback.text}
        </p>
      )}
    </div>
  )
}
