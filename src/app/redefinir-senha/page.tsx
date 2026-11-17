"use client"

import { useEffect, useState, type FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "react-toastify"
import { cn } from "tailwind-variants"
import { createClient } from "@/lib/supabase/client"
import { useClinicStore } from "@/store/clinic/clinicStore"
import Button from "@/components/ui/buttonCustom"
import { hasRecentEmailProof } from "@/lib/auth/recoverySession"
import { ShowPasswordToggle } from "@/components/ui/showPasswordToggle"

// a sessão precisa ter vindo do link de "Esqueci minha senha" há pouco tempo
async function canChangePassword() {
  const supabase = createClient()
  const { data } = await supabase.auth.getClaims()
  return hasRecentEmailProof(data?.claims?.amr, Math.floor(Date.now() / 1000))
}

type Field = "password" | "confirmPassword"
type Errors = Partial<Record<Field, string>>

// mesmas regras de senha do primeiro cadastro
function validate(password: string, confirmPassword: string): Errors {
  const errors: Errors = {}
  if (!password) errors.password = "Informe a nova senha."
  else if (password.length < 8) errors.password = "A senha precisa ter pelo menos 8 caracteres."
  else if (password.length > 64) errors.password = "Use no máximo 64 caracteres."

  if (!confirmPassword) errors.confirmPassword = "Confirme a nova senha."
  else if (confirmPassword !== password) errors.confirmPassword = "As senhas não coincidem."
  return errors
}

function mapUpdateError(error: { code?: string }) {
  switch (error.code) {
    case "same_password":
      return "A nova senha precisa ser diferente da atual."
    case "weak_password":
      return "Senha fraca. Use uma senha mais forte."
    case "session_not_found":
    case "session_expired":
      return "O link expirou. Peça um novo em \"Esqueci minha senha\"."
    default:
      return "Não foi possível salvar a nova senha. Tente novamente."
  }
}

function ResetPassword() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [errors, setErrors] = useState<Errors>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [access, setAccess] = useState<"checking" | "allowed" | "blocked">("checking")

  useEffect(() => {
    let active = true
    canChangePassword()
      .then((ok) => active && setAccess(ok ? "allowed" : "blocked"))
      .catch(() => active && setAccess("blocked"))
    return () => {
      active = false
    }
  }, [])

  async function handleSubmit(event?: FormEvent) {
    event?.preventDefault()
    if (submitting) return

    const nextErrors = validate(password, confirmPassword)
    setErrors(nextErrors)
    if (nextErrors.password || nextErrors.confirmPassword) return

    setSubmitting(true)
    setSubmitError(null)

    // confere de novo na hora de salvar (a janela pode ter expirado com a tela aberta)
    if (!(await canChangePassword())) {
      setAccess("blocked")
      setSubmitting(false)
      return
    }

    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setSubmitError(mapUpdateError(error))
      setSubmitting(false)
      return
    }

    // encerra as outras sessões desta conta (outros aparelhos/navegadores)
    await supabase.auth.signOut({ scope: "others" }).catch(() => {})

    // recarrega o vínculo da clínica para o usuário desta sessão
    useClinicStore.getState().reset()
    toast.success("Senha alterada com sucesso!")
    router.replace("/listar-pacientes")
    router.refresh()
  }

  function inputClassName(field: Field) {
    return cn(
      "w-full border-2 rounded-md px-2 py-3 bg-[#EAE9E9] text-gray-600 placeholder:text-gray-400",
      errors[field]
        ? "border-red-500 focus:outline-red-500"
        : "border-[#FFA726]/40 focus:outline-[#FFA726]"
    )
  }

  return (
    <section className="w-full h-full flex justify-center items-center">
      <section className="bg-white flex justify-center items-center flex-col px-3 py-8 w-full max-w-[90%] md:w-120 rounded-md shadow-2xl">
        <header className="text-center">
          <h1 className="pb-2 text-3xl font-montserrat font-bold tracking-tight text-[#FFA726]">
            Nova senha
          </h1>
          <p className="font-open-sans text-sm text-[#8C7B6B] px-2">
            Escolha uma nova senha para a sua conta.
          </p>
        </header>

        {access === "checking" && (
          <p role="status" className="font-open-sans py-6 text-sm text-slate-500">
            Verificando o link...
          </p>
        )}

        {access === "blocked" && (
          <div className="font-open-sans w-full px-3 pt-6 text-center">
            <p role="alert" className="rounded-md bg-amber-50 px-3 py-4 text-amber-800">
              Por segurança, a senha só pode ser trocada pelo link enviado ao seu
              e-mail, e o link vale por 15 minutos depois de aberto.
            </p>
            <Link
              href="/esqueci-senha"
              className="mt-6 inline-block text-[#E65100] underline underline-offset-2 transition hover:opacity-80 active:opacity-60"
            >
              Pedir o link em &quot;Esqueci minha senha&quot;
            </Link>
          </div>
        )}

        {access === "allowed" && (
        <form noValidate onSubmit={handleSubmit} className="font-open-sans py-2 px-3 w-full">
          <section className="mt-4">
            <label htmlFor="password" className="pb-2 text-lg text-[#FFA726] font-medium block">
              Nova senha:
            </label>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              maxLength={64}
              autoFocus
              placeholder="Mínimo de 8 caracteres"
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? "password-error" : undefined}
              className={inputClassName("password")}
            />
            {errors.password && (
              <span id="password-error" role="alert" className="pl-2 pt-1 text-sm text-red-600 block">
                {errors.password}
              </span>
            )}
          </section>

          <section className="mt-4">
            <label htmlFor="confirmPassword" className="pb-2 text-lg text-[#FFA726] font-medium block">
              Confirmar nova senha:
            </label>
            <input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              maxLength={64}
              placeholder="Repita a nova senha"
              aria-invalid={Boolean(errors.confirmPassword)}
              aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
              className={inputClassName("confirmPassword")}
            />
            {errors.confirmPassword && (
              <span id="confirmPassword-error" role="alert" className="pl-2 pt-1 text-sm text-red-600 block">
                {errors.confirmPassword}
              </span>
            )}
            <ShowPasswordToggle
              visible={showPassword}
              onToggle={() => setShowPassword((v) => !v)}
              controls="password confirmPassword"
            />
          </section>

          {submitError && (
            <p role="alert" className="text-sm text-red-600 text-center mt-4">
              {submitError}
            </p>
          )}

          <Button
            variant="single"
            type="submit"
            textAlt="Salvar nova senha"
            active={true}
            isSubmitting={submitting}
          />
        </form>
        )}
      </section>
    </section>
  )
}

export default ResetPassword
