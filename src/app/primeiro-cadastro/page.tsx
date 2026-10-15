"use client"

import { useFirstRegistration, type FirstRegistrationField } from "@/hook/useFirstRegistration"

function FirstRegistration() {
  const { values, errors, formRef, handleChange, handleBlur, handleSubmit } =
    useFirstRegistration()
  const labelClassName = "text-base text-[#FFA726] font-medium w-full pl-1"
  const baseInputClassName =
    "w-full border-2 rounded-md px-2 py-3 bg-[#EAE9E9] text-[#333] placeholder:text-gray-400 focus:outline-[#FFA726]"

  function inputClassName(field: FirstRegistrationField) {
    return `${baseInputClassName} ${
      errors[field]
        ? "border-red-500 focus:outline-red-500"
        : "border-[#D0D7DE]/40"
    }`
  }

  function errorMessage(field: FirstRegistrationField) {
    const message = errors[field]
    if (!message) return null

    return (
      <span
        id={`${field}-error`}
        className="pl-2 pt-1 text-sm text-red-600"
        role="alert"
      >
        {message}
      </span>
    )
  }

  return (
    <section className="flex-1 flex justify-center items-center">
      <section className="bg-white rounded-md px-2 py-2 m-3 w-full max-w-210 h-full flex flex-col items-center">
        <header>
          <h1 className="py-6 text-2xl text-center md:text-3xl font-montserrat font-bold tracking-tight text-[#FFA726]">
            Cadastro da responsável pelo sistema
          </h1>
        </header>

        <form
          ref={formRef}
          noValidate
          onSubmit={handleSubmit}
          className="font-open-sans py-2 px-3 w-full max-w-150 mx-auto flex flex-col gap-5"
        >
          <fieldset className="flex flex-col md:flex-row w-full gap-4 border-0 p-0 m-0">
            <div className="flex w-full flex-col gap-1">
              <label htmlFor="firstName" className={labelClassName}>
                Primeiro nome
              </label>
              <input
                type="text"
                name="firstName"
                id="firstName"
                value={values.firstName}
                onChange={(event) => handleChange("firstName", event.target.value)}
                onBlur={() => handleBlur("firstName")}
                placeholder="Digite seu primeiro nome"
                required
                minLength={2}
                maxLength={60}
                aria-invalid={Boolean(errors.firstName)}
                aria-describedby={errors.firstName ? "firstName-error" : undefined}
                data-error={Boolean(errors.firstName)}
                className={inputClassName("firstName")}
              />
              {errorMessage("firstName")}
            </div>

            <div className="flex w-full flex-col gap-1">
              <label htmlFor="surName" className={labelClassName}>
                Sobrenome
              </label>
              <input
                type="text"
                name="surName"
                id="surName"
                value={values.surName}
                onChange={(event) => handleChange("surName", event.target.value)}
                onBlur={() => handleBlur("surName")}
                placeholder="Digite seu sobrenome"
                required
                minLength={2}
                maxLength={80}
                aria-invalid={Boolean(errors.surName)}
                aria-describedby={errors.surName ? "surName-error" : undefined}
                data-error={Boolean(errors.surName)}
                className={inputClassName("surName")}
              />
              {errorMessage("surName")}
            </div>
          </fieldset>

          <div className="flex w-full flex-col gap-1">
            <label htmlFor="email" className={labelClassName}>
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              value={values.email}
              onChange={(event) => handleChange("email", event.target.value)}
              onBlur={() => handleBlur("email")}
              placeholder="Digite seu email"
              required
              maxLength={254}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "email-error" : undefined}
              data-error={Boolean(errors.email)}
              className={inputClassName("email")}
            />
            {errorMessage("email")}
          </div>

          <fieldset className="flex flex-col md:flex-row w-full gap-4 border-0 p-0 m-0">
            <div className="flex w-full flex-col gap-1">
              <label htmlFor="password" className={labelClassName}>
                Senha
              </label>
              <input
                type="password"
                name="password"
                id="password"
                value={values.password}
                onChange={(event) => handleChange("password", event.target.value)}
                onBlur={() => handleBlur("password")}
                placeholder="Digite sua senha"
                autoComplete="new-password"
                required
                minLength={8}
                maxLength={64}
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? "password-error" : undefined}
                data-error={Boolean(errors.password)}
                className={inputClassName("password")}
              />
              {errorMessage("password")}
            </div>

            <div className="flex w-full flex-col gap-1">
              <label htmlFor="confirmPassword" className={labelClassName}>
                Confirme sua senha
              </label>
              <input
                type="password"
                name="confirmPassword"
                id="confirmPassword"
                value={values.confirmPassword}
                onChange={(event) => handleChange("confirmPassword", event.target.value)}
                onBlur={() => handleBlur("confirmPassword")}
                placeholder="Confirme sua senha"
                autoComplete="new-password"
                required
                minLength={8}
                maxLength={64}
                aria-invalid={Boolean(errors.confirmPassword)}
                aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
                data-error={Boolean(errors.confirmPassword)}
                className={inputClassName("confirmPassword")}
              />
              {errorMessage("confirmPassword")}
            </div>
          </fieldset>

          <div
            role="separator"
            aria-orientation="horizontal"
            className="border-t border-[#D0D7DE]/60"
          />

          <div className="flex w-full flex-col gap-1">
            <label htmlFor="crefito" className={labelClassName}>
              CREFITO
            </label>
            <input
              type="text"
              name="crefito"
              id="crefito"
              value={values.crefito}
              onChange={(event) => handleChange("crefito", event.target.value)}
              onBlur={() => handleBlur("crefito")}
              placeholder="Digite seu número de registro"
              autoComplete="off"
              required
              maxLength={30}
              aria-invalid={Boolean(errors.crefito)}
              aria-describedby={errors.crefito ? "crefito-error" : undefined}
              data-error={Boolean(errors.crefito)}
              className={inputClassName("crefito")}
            />
            {errorMessage("crefito")}
          </div>

          <footer className="pt-1">
            <button
              type="submit"
              className="text-white text-xl font-bold bg-[#FFA726] rounded-md py-3 w-full md:w-75 block mx-auto my-2 cursor-pointer hover:opacity-80 active:opacity-60"
            >
              Cadastrar
            </button>
          </footer>
        </form>
      </section>
    </section>
  )
}

export default FirstRegistration
