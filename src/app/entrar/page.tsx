"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Button from "@/components/ui/buttonCustom"
import { ShowPasswordToggle } from "@/components/ui/showPasswordToggle"
import { useLogin } from "@/hook/useLogin"
import { cn } from "tailwind-variants"

function Login() {
  const [invalidLink, setInvalidLink] = useState(false)
  const [idleLogout, setIdleLogout] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // /entrar?motivo=link-invalido vem do link de redefinição de senha
  useEffect(() => {
    const motivo = new URLSearchParams(window.location.search).get("motivo")
    setInvalidLink(motivo === "link-invalido")
    // /entrar?motivo=inatividade vem do logout automático (2 semanas sem uso)
    setIdleLogout(motivo === "inatividade")
  }, [])

  const {
    values,
    errors,
    submitting,
    submitError,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useLogin()

  return (
    <section className=" w-full h-full flex justify-center items-center">
      <section className="bg-white flex justify-center items-center flex-col px-3 py-4 w-full max-w-[90%] min-h-110 md:w-120 md:max-h-screen overflow-y-auto rounded-md shadow-2xl">
        <header>
          <h1 className="py-6 text-3xl font-montserrat font-bold tracking-tight text-[#FFA726]">
            Entrar
          </h1>
        </header>

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
          </footer>
        </form>
      </section>
    </section>
  )
}
export default Login
