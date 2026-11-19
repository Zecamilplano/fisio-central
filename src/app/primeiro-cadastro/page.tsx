"use client"

import {
  titleOptions,
  useFirstRegistration,
  type FirstRegistrationField,
} from "@/components/firstRegistration/index"
import Button from "@/components/ui/buttonCustom"
import { ShowPasswordToggle } from "@/components/ui/showPasswordToggle"
import { useState } from "react"
import { Camera, X } from "lucide-react"
import { profileLimits } from "@/data/fieldLimits"

function FirstRegistration() {
  const {
    values,
    errors,
    formRef,
    handleChange,
    handleBlur,
    handleSubmit,
    isSubmitting,
    photo,
  } = useFirstRegistration()
  const selectedPhoto = photo.image[0]
  const [showPassword, setShowPassword] = useState(false)

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
          {/* Foto de perfil (opcional) */}
          <div className="flex flex-col items-center">
            {selectedPhoto ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element -- preview local (blob:) */}
                <img
                  src={selectedPhoto.preview}
                  alt="Sua foto de perfil"
                  className="size-24 rounded-full object-cover ring-2 ring-[#FFA726]"
                />
                <button
                  type="button"
                  onClick={photo.removeImage}
                  className="mt-3 flex items-center gap-2 rounded-lg bg-[#FBBF24] px-3 py-2 text-sm font-medium text-[#78350F] transition cursor-pointer hover:opacity-80 active:scale-95 active:opacity-60"
                >
                  <X size={16} aria-hidden="true" /> Remover foto
                </button>
              </>
            ) : (
              <>
                <label
                  {...photo.dragEvents}
                  htmlFor="profile-photo"
                  className={`group flex size-24 cursor-pointer items-center justify-center rounded-full bg-[#FFE0B2] transition hover:bg-[#FFCC80] active:scale-95 active:bg-[#FFB74D] focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[#FFA726] ${
                    photo.isDragging ? "opacity-50" : ""
                  } ${photo.error ? "ring-2 ring-red-500" : ""}`}
                >
                  <Camera
                    size={36}
                    aria-hidden="true"
                    className="text-[#F57C00] transition-colors group-hover:text-[#EF6C00]"
                  />
                  <span className="sr-only">Adicionar sua foto de perfil, opcional</span>
                  <input
                    type="file"
                    id="profile-photo"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={photo.handleFileChange}
                    disabled={photo.isCompressing}
                    className="sr-only"
                  />
                </label>
                <p className="mt-2 text-sm font-medium text-[#8C7B6B]">
                  Foto de perfil (opcional)
                </p>
              </>
            )}

            <div className="mt-1 text-center" aria-live="polite">
              <p className="text-xs text-[#8C7B6B]">
                JPG, PNG ou WEBP. Fotos grandes são otimizadas automaticamente.
              </p>
              {photo.isCompressing && (
                <p role="status" className="mt-1 text-sm text-slate-500">
                  Otimizando foto...
                </p>
              )}
              {photo.compressionMessage && !photo.error && (
                <p className="mt-1 text-sm text-emerald-700">{photo.compressionMessage}</p>
              )}
              {photo.error && (
                <p role="alert" className="mt-1 text-sm text-red-600">
                  {photo.error}
                </p>
              )}
            </div>
          </div>

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
                onChange={(event) =>
                  handleChange("firstName", event.target.value)
                }
                onBlur={() => handleBlur("firstName")}
                placeholder="Digite seu primeiro nome"
                required
                minLength={2}
                maxLength={profileLimits.firstName}
                aria-invalid={Boolean(errors.firstName)}
                aria-describedby={
                  errors.firstName ? "firstName-error" : undefined
                }
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
                onChange={(event) =>
                  handleChange("surName", event.target.value)
                }
                onBlur={() => handleBlur("surName")}
                placeholder="Digite seu sobrenome"
                required
                minLength={2}
                maxLength={profileLimits.surName}
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
              maxLength={profileLimits.email}
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
                type={showPassword ? "text" : "password"}
                name="password"
                id="password"
                value={values.password}
                onChange={(event) =>
                  handleChange("password", event.target.value)
                }
                onBlur={() => handleBlur("password")}
                placeholder="Digite sua senha"
                autoComplete="new-password"
                required
                minLength={8}
                maxLength={profileLimits.passwordMax}
                aria-invalid={Boolean(errors.password)}
                aria-describedby={
                  errors.password ? "password-error" : undefined
                }
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
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                id="confirmPassword"
                value={values.confirmPassword}
                onChange={(event) =>
                  handleChange("confirmPassword", event.target.value)
                }
                onBlur={() => handleBlur("confirmPassword")}
                placeholder="Confirme sua senha"
                autoComplete="new-password"
                required
                minLength={8}
                maxLength={profileLimits.passwordMax}
                aria-invalid={Boolean(errors.confirmPassword)}
                aria-describedby={
                  errors.confirmPassword ? "confirmPassword-error" : undefined
                }
                data-error={Boolean(errors.confirmPassword)}
                className={inputClassName("confirmPassword")}
              />
              {errorMessage("confirmPassword")}
            </div>
          </fieldset>
          <div className="-mt-3 flex">
            <ShowPasswordToggle
              visible={showPassword}
              onToggle={() => setShowPassword((v) => !v)}
              controls="password confirmPassword"
            />
          </div>

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
              maxLength={profileLimits.crefito}
              aria-invalid={Boolean(errors.crefito)}
              aria-describedby={errors.crefito ? "crefito-error" : undefined}
              data-error={Boolean(errors.crefito)}
              className={inputClassName("crefito")}
            />
            {errorMessage("crefito")}
          </div>

          <fieldset
            className="flex w-full flex-col gap-1 border-0 p-0 m-0"
            aria-describedby="title-hint"
            data-error={Boolean(errors.title)}
          >
            <legend className={labelClassName}>
              Como prefere ser chamado(a) nos registros?
            </legend>
            <p id="title-hint" className="pl-1 text-sm text-[#8C7B6B]">
              Aparece antes do seu nome nas evoluções dos pacientes.
            </p>
            <div className="mt-1 flex flex-wrap gap-2">
              {titleOptions.map((option) => {
                const selected = values.title === option.value
                return (
                  <label
                    key={option.label}
                    className={`cursor-pointer select-none rounded-md border-2 px-4 py-2 transition focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[#FFA726] active:scale-95 ${
                      selected
                        ? "border-[#FFA726] bg-[#FFF5EA] text-[#E65100] hover:bg-[#FFEBD6]"
                        : "border-[#D0D7DE]/60 bg-[#EAE9E9] text-[#333] hover:border-[#FFA726]/60 hover:bg-[#F5EFE8]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="title"
                      value={option.value}
                      checked={selected}
                      onChange={() => handleChange("title", option.value)}
                      className="sr-only"
                    />
                    {option.label}
                  </label>
                )
              })}
            </div>
            {errorMessage("title")}
          </fieldset>

          <footer className="pt-1">
            <Button
              variant="single"
              type="submit"
              textAlt="Cadastrar"
              active
              isSubmitting={isSubmitting}
            />
          </footer>
        </form>
      </section>
    </section>
  )
}

export default FirstRegistration
