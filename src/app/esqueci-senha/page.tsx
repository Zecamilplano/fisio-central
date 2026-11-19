"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import { cn } from "tailwind-variants"
import { createClient } from "@/lib/supabase/client"
import Button from "@/components/ui/buttonCustom"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateEmail(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return "Informe seu e-mail."
  if (!EMAIL_REGEX.test(trimmed)) return "E-mail inválido."
  return null
}

function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(event?: FormEvent) {
    event?.preventDefault()
    if (submitting) return

    const trimmed = email.trim()
    const validationError = validateEmail(email)
    if (validationError) return setError(validationError)

    setSubmitting(true)
    setError(null)

    // o link do e-mail volta para /auth/confirm, que cria a sessão e abre a nova senha
    // (a URL precisa estar em Authentication > URL Configuration > Redirect URLs)
    const supabase = createClient()
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(trimmed, {
      redirectTo: `${window.location.origin}/auth/confirm?next=/redefinir-senha`,
    })

    setSubmitting(false)

    if (
      resetError?.code === "over_email_send_rate_limit" ||
      resetError?.code === "over_request_rate_limit"
    ) {
      setError("Muitas tentativas. Aguarde um pouco e tente novamente.")
      return
    }

    // mesma resposta para e-mail cadastrado ou não (não revela quem tem conta)
    setSent(true)
  }

  return (
    <section className="w-full flex-1 flex justify-center items-center-safe py-4">
      <section className="bg-white flex justify-center items-center flex-col px-3 py-8 w-full max-w-[90%] md:w-120 rounded-md shadow-2xl">
        <header className="text-center">
          <h1 className="pb-2 text-3xl font-montserrat font-bold tracking-tight text-[#FFA726]">
            Esqueci minha senha
          </h1>
          <p className="font-open-sans text-sm text-[#8C7B6B] px-2">
            Informe seu e-mail e enviaremos um link para criar uma nova senha.
          </p>
        </header>

        {sent ? (
          <div className="font-open-sans w-full px-3 pt-6 text-center">
            <p role="status" className="rounded-md bg-green-50 px-3 py-4 text-green-800">
              Se este e-mail estiver cadastrado, você receberá o link em
              instantes. Confira também a caixa de spam.
            </p>
            <Link
              href="/entrar"
              className="mt-6 inline-block text-[#E65100] underline underline-offset-2"
            >
              Voltar para o login
            </Link>
          </div>
        ) : (
          <form noValidate onSubmit={handleSubmit} className="font-open-sans py-2 px-3 w-full">
            <section className="mt-4">
              <label
                htmlFor="email"
                className="pb-2 text-lg text-[#FFA726] font-medium w-full block"
              >
                Email:
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  // erro já visível é revalidado (some quando corrigido)
                  if (error) setError(validateEmail(e.target.value))
                }}
                onBlur={() => setError(validateEmail(email))}
                autoComplete="email"
                maxLength={254}
                placeholder="Digite seu email:"
                autoFocus
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "email-error" : undefined}
                className={cn(
                  "w-full border-2 rounded-md px-2 py-3 bg-[#EAE9E9] text-gray-600 placeholder:text-gray-400",
                  error
                    ? "border-red-500 focus:outline-red-500"
                    : "border-[#FFA726]/40 focus:outline-[#FFA726]"
                )}
              />
              {error && (
                <span id="email-error" role="alert" className="pl-2 pt-1 text-sm text-red-600 block">
                  {error}
                </span>
              )}
            </section>

            <Button
              variant="single"
              type="submit"
              textAlt="Enviar link"
              active={true}
              isSubmitting={submitting}
            />

            <p className="text-center">
              <Link href="/entrar" className="text-sm text-[#E65100] underline underline-offset-2">
                Voltar para o login
              </Link>
            </p>
          </form>
        )}
      </section>
    </section>
  )
}

export default ForgotPassword
