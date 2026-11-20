"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import Button from "@/components/ui/buttonCustom"
import { ShowPasswordToggle } from "@/components/ui/showPasswordToggle"
import { EmailConfirmationNotice } from "@/components/auth/emailConfirmationNotice"
import {
  AFTER_CONFIRMATION_PATH,
  PENDING_CONFIRMATION_EMAIL_KEY,
} from "@/lib/auth/emailConfirmation"
import { useLogin } from "@/hook/useLogin"
import { cn } from "tailwind-variants"

function Login() {
  const [invalidLink, setInvalidLink] = useState(false)
  const [idleLogout, setIdleLogout] = useState(false)
  const [invalidSession, setInvalidSession] = useState(false)
  const [emailConfirmed, setEmailConfirmed] = useState(false)
  // após o primeiro cadastro: e-mail que precisa ser confirmado
  const [signupEmail, setSignupEmail] = useState<string | null | undefined>(undefined)
  const [showPassword, setShowPassword] = useState(false)

  // /entrar?motivo=link-invalido vem do link de redefinição de senha
  useEffect(() => {
    const motivo = new URLSearchParams(window.location.search).get("motivo")
    setInvalidLink(motivo === "link-invalido")
    // /entrar?motivo=inatividade vem do logout automático (2 semanas sem uso)
    setIdleLogout(motivo === "inatividade")
    // /entrar?motivo=sessao-invalida: o usuário da sessão não existe mais
    setInvalidSession(motivo === "sessao-invalida")
    // /entrar?motivo=email-confirmado: link aberto em outro navegador/aparelho
    setEmailConfirmed(motivo === "email-confirmado")
    // /entrar?motivo=confirmar-email vem do primeiro cadastro
    if (motivo === "confirmar-email") {
      let email: string | null = null
      try {
        email = sessionStorage.getItem(PENDING_CONFIRMATION_EMAIL_KEY)
      } catch {
        // sem sessionStorage: aviso sem o e-mail
      }
      setSignupEmail(email)
    }
  }, [])

  const router = useRouter()
  const loginState = useLogin()
  // o login pelo formulário já redireciona sozinho (useLogin)
  const submittingRef = useRef(false)
  useEffect(() => {
    submittingRef.current = loginState.submitting
  }, [loginState.submitting])

  // Sessão aberta sem usar o formulário (link de confirmação que caiu aqui, ou
  // e-mail confirmado em outra aba): não faz sentido pedir login, segue direto.
  useEffect(() => {
    const supabase = createClient()
    const motivo = new URLSearchParams(window.location.search).get("motivo")
    const target =
      motivo === "confirmar-email" ? AFTER_CONFIRMATION_PATH : "/listar-pacientes"
    let done = false

    function goToApp() {
      if (done || submittingRef.current) return
      done = true
      router.replace(target)
      router.refresh()
    }

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && (event === "SIGNED_IN" || event === "INITIAL_SESSION")) {
        setTimeout(goToApp, 0) // fora do callback (recomendação da lib)
      }
    })

    // confirmou em outra aba: ao voltar para esta, confere se já há sessão
    function checkSession() {
      if (document.visibilityState !== "visible") return
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) goToApp()
      })
    }
    window.addEventListener("focus", checkSession)
    document.addEventListener("visibilitychange", checkSession)

    return () => {
      done = true
      data.subscription.unsubscribe()
      window.removeEventListener("focus", checkSession)
      document.removeEventListener("visibilitychange", checkSession)
    }
  }, [router])

  const {
    values,
    errors,
    submitting,
    submitError,
    unconfirmedEmail,
    handleChange,
    handleBlur,
    handleSubmit,
  } = loginState

  return (
    <section className="w-full flex-1 flex justify-center items-center-safe py-4">
      <section className="bg-white flex justify-center items-center flex-col px-3 py-4 w-full max-w-[90%] min-h-110 md:w-120 md:max-h-screen overflow-y-auto rounded-md shadow-2xl">
        <header>
          <h1 className="py-6 text-3xl font-montserrat font-bold tracking-tight text-[#FFA726]">
            Entrar
          </h1>
        </header>

        {unconfirmedEmail ? (
          <EmailConfirmationNotice key={unconfirmedEmail} email={unconfirmedEmail} reason="login" />
        ) : (
          signupEmail !== undefined && (
            <EmailConfirmationNotice email={signupEmail} reason="signup" />
          )
        )}

        {emailConfirmed && (
          <p
            role="status"
            className="font-open-sans mx-3 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800"
          >
            E-mail confirmado! Entre com seu e-mail e senha para continuar.
          </p>
        )}

        {invalidSession && (
          <p
            role="status"
            className="font-open-sans mx-3 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800"
          >
            Sua sessão não é mais válida. Entre novamente.
          </p>
        )}

        {idleLogout && (
          <p
            role="status"
            className="font-open-sans mx-3 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800"
          >
            Sua sessão foi encerrada após 2 semanas sem uso. Entre novamente.
          </p>
        )}

        {invalidLink && (
          <p
            role="alert"
            className="font-open-sans mx-3 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800"
          >
            O link de redefinição de senha é inválido ou expirou.{" "}
            <Link href="/esqueci-senha" className="underline underline-offset-2">
              Pedir um novo link
            </Link>
          </p>
        )}

        <form
          onSubmit={handleSubmit}
          className="font-open-sans py-2 px-3 w-full"
        >
          <section className="mb-4">
            <label
              htmlFor="email"
              className="pb-2 text-lg text-[#FFA726] font-medium w-full block"
            >
              Email:
            </label>

            <input
              id="email"
              type="email"
              name="email"
              value={values.email}
              aria-autocomplete="list"
              onChange={(e) => handleChange("email", e.target.value)}
              onBlur={() => handleBlur("email")}
              autoComplete="email"
              maxLength={254}
              placeholder="Digite seu email:"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "email-error" : undefined}
              className={cn(
                "w-full border-2 rounded-md px-2 py-3 bg-[#EAE9E9] text-gray-600 placeholder:text-gray-400",
                errors.email
                  ? "border-red-500 focus:outline-red-500"
                  : "border-[#FFA726]/40 focus:outline-[#FFA726]"
              )}
            />
            {errors.email && (
              <span
                id="email-error"
                role="alert"
                className="pl-2 pt-1 text-sm text-red-600 block"
              >
                {errors.email}
              </span>
            )}
          </section>

          <section className="mb-6">
            <label
              htmlFor="password"
              className="block pb-2 text-lg text-[#FFA726] font-medium"
            >
              Senha:
            </label>

            <input
              id="password"
              type={showPassword ? "text" : "password"}
              name="password"
              onChange={(e) => handleChange("password", e.target.value)}
              placeholder="Digite sua senha:"
              className="w-full border-2 border-[#FFA726]/40 focus:outline-[#FFA726] rounded-md px-2 py-3 bg-[#EAE9E9] text-gray-600 placeholder:text-gray-400"
            />
            <ShowPasswordToggle
              visible={showPassword}
              onToggle={() => setShowPassword((v) => !v)}
              controls="password"
            />
          </section>

          {submitError && (
            <p role="alert" className="text-sm text-red-600 text-center mb-4">
              {submitError}
            </p>
          )}

          <footer>
            <Button
              variant="single"
              textAlt="Entrar"
              type="submit"
              active={true}
              isSubmitting={submitting}
              onNext={() => handleSubmit()}
            />
            <p className="text-center">
              <Link
                href="/esqueci-senha"
                className="text-sm text-[#E65100] underline underline-offset-2"
              >
                Esqueci minha senha
              </Link>
            </p>
            <p className="mt-3 text-center font-open-sans text-sm text-[#8C7B6B]">
              Recebeu acesso?{" "}
              <Link
                href="/primeiro-cadastro"
                className="font-semibold text-[#E65100] underline underline-offset-2"
              >
                Criar conta
              </Link>
            </p>
          </footer>
        </form>
      </section>
    </section>
  )
}
export default Login
