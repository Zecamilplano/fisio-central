"use client"
import { Bookmark, MapPinHouse, Phone } from "lucide-react"
import { useFormProfile } from "@/hook/useFormProfile"
import { registerPatientLimits } from "@/data/registerPatientLimits"
import { unformatPhone } from "@/utils/form/phone"
import type { ClipboardEvent, KeyboardEvent } from "react"

type ProfileProps = {
  form: ReturnType<typeof useFormProfile>
}

function Profile({ form }: ProfileProps) {
  const {
    patient,
    setPatient,
    errorPatient,
    setErrorPatient,
    handleChange,
    handleErrors,
  } = form

  function handleLimitedTextChange(
    field: "firstName" | "surName" | "address.street" | "address.neighborhood" | "address.referenceHouse",
    errorKey: keyof typeof errorPatient,
    value: string,
    maxLength: number,
    isPersonName = false
  ) {
    const sanitizedValue = isPersonName
      ? value.replace(/[^\p{L}\p{M}\s'.-]/gu, "")
      : value

    handleChange(field, sanitizedValue)

    if (sanitizedValue !== value) {
      setErrorPatient((previous) => ({
        ...previous,
        [errorKey]: "Use apenas letras, espaços, hífen, apóstrofo ou ponto.",
      }))
    } else if (sanitizedValue.length >= maxLength) {
      setErrorPatient((previous) => ({
        ...previous,
        [errorKey]: `Limite de ${maxLength} caracteres atingido.`,
      }))
    } else {
      handleErrors(field, sanitizedValue)
    }
  }

  function preventTextLimitExceeded(
    event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
    value: string,
    maxLength: number,
    errorKey: keyof typeof errorPatient,
    message: string
  ) {
    if (
      value.length < maxLength ||
      event.key.length !== 1 ||
      event.ctrlKey ||
      event.metaKey ||
      event.altKey
    ) {
      return
    }

    const input = event.currentTarget
    const selectedLength = input.selectionEnd! - input.selectionStart!
    if (selectedLength > 0) return

    event.preventDefault()
    setErrorPatient((previous) => ({ ...previous, [errorKey]: message }))
  }

  function preventOversizedPaste(
    event: ClipboardEvent<HTMLInputElement | HTMLTextAreaElement>,
    value: string,
    maxLength: number,
    errorKey: keyof typeof errorPatient,
    message: string
  ) {
    const input = event.currentTarget
    const selectedLength = input.selectionEnd! - input.selectionStart!
    const pastedText = event.clipboardData.getData("text")

    if (value.length - selectedLength + pastedText.length > maxLength) {
      event.preventDefault()
      setErrorPatient((previous) => ({ ...previous, [errorKey]: message }))
    }
  }

  return (
    <>
      {/*Primeiro nome, sobrenome*/}
      <fieldset className="flex flex-col md:flex-row w-full gap-4 font-montserrat">
        {/*Primeiro nome*/}
        <div className="w-full">
          <label
            htmlFor="firstName"
            className=" text-base text-[#FFA726] font-medium w-full pl-1 "
          >
            Primeiro nome
          </label>
          <input
            type="text"
            minLength={2}
            maxLength={registerPatientLimits.firstName}
            name="firstName"
            id="firstName"
            placeholder="Digite seu nome primeiro nome"
            value={patient.firstName}
            onKeyDown={(event) => preventTextLimitExceeded(event, patient.firstName, registerPatientLimits.firstName, "firstName", `Limite de ${registerPatientLimits.firstName} caracteres atingido.`)}
            onPaste={(event) => preventOversizedPaste(event, patient.firstName, registerPatientLimits.firstName, "firstName", `Limite de ${registerPatientLimits.firstName} caracteres atingido.`)}
            onChange={(e) => {
              handleLimitedTextChange(
                "firstName",
                "firstName",
                e.target.value,
                registerPatientLimits.firstName,
                true
              )
            }}
            onBlur={(e) => handleErrors("firstName", e.target.value)}
            data-error={!!errorPatient.firstName}
            aria-invalid={Boolean(errorPatient.firstName)}
            aria-describedby={errorPatient.firstName ? "first-name-error" : undefined}
            className={`w-full md:w-full border-2  rounded-md px-2 py-3
                       text-[#333] placeholder:text-gray-400
                      ${!errorPatient.firstName ? "border-[#D0D7DE]/40 focus:outline-[#FFA726]" : "border-[red] focus:outline-[red]"}
                      ${patient.firstName ? "bg-white" : "bg-[#EAE9E9]"}
                      `}
          />
          {errorPatient.firstName && (
            <span id="first-name-error" role="alert" aria-live="polite" className="block text-sm text-red-600 pl-2 pt-1">
              {errorPatient.firstName}
            </span>
          )}
        </div>

        {/*Segundo nome*/}
        <div className="w-full">
          <label
            htmlFor="surName"
            className=" text-base text-[#FFA726] font-medium w-full pl-2 flex items-center gap-1"
          >
            Sobrenome
          </label>
          <input
            type="text"
            minLength={2}
            maxLength={registerPatientLimits.surName}
            name="surName"
            id="surName"
            placeholder="Digite seu sobrenome"
            value={patient.surName}
            onKeyDown={(event) => preventTextLimitExceeded(event, patient.surName, registerPatientLimits.surName, "surName", `Limite de ${registerPatientLimits.surName} caracteres atingido.`)}
            onPaste={(event) => preventOversizedPaste(event, patient.surName, registerPatientLimits.surName, "surName", `Limite de ${registerPatientLimits.surName} caracteres atingido.`)}
            onChange={(e) => {
              handleLimitedTextChange(
                "surName",
                "surName",
                e.target.value,
                registerPatientLimits.surName,
                true
              )
            }}
            onBlur={(e) => handleErrors("surName", e.target.value)}
            data-error={!!errorPatient.surName}
            aria-invalid={Boolean(errorPatient.surName)}
            aria-describedby={errorPatient.surName ? "surname-error" : undefined}
            className={`w-full md:w-full border-2  rounded-md px-2 py-3
                       text-[#333] placeholder:text-text-gray-400
                      ${patient.surName ? "bg-white" : "bg-[#EAE9E9]"}
                      ${!errorPatient.surName ? "border-[#D0D7DE]/40 focus:outline-[#FFA726]" : "border-[red] focus:outline-[red]"}
                      `}
          />
          {errorPatient.surName && (
            <span id="surname-error" role="alert" aria-live="polite" className="block text-sm text-red-600 pl-2 pt-1">
              {errorPatient.surName}
            </span>
          )}
        </div>
      </fieldset>

      {/*Número de telefone*/}
      <div className="w-full">
        <label
          htmlFor="tel"
          className=" text-base text-[#FFA726] font-medium w-full pl-2 flex items-center gap-1"
        >
          <Phone size={14} /> Telefone
        </label>
        <input
          type="tel"
          name="tel"
          id="tel"
          placeholder="00 00000-0000"
          value={patient.address.telephone}
          maxLength={registerPatientLimits.telephoneFormatted}
          onKeyDown={(event) => preventTextLimitExceeded(event, patient.address.telephone, registerPatientLimits.telephoneFormatted, "telephone", `Limite de ${registerPatientLimits.telephoneDigits} números atingido.`)}
          onPaste={(event) => preventOversizedPaste(event, patient.address.telephone, registerPatientLimits.telephoneFormatted, "telephone", `Limite de ${registerPatientLimits.telephoneDigits} números atingido.`)}
          onChange={(e) => {
            handleChange("address.telephone", e.target.value)
            handleErrors("address.telephone", e.target.value)
            if (unformatPhone(e.target.value).length >= registerPatientLimits.telephoneDigits) {
              setErrorPatient((previous) => ({
                ...previous,
                telephone: `Limite de ${registerPatientLimits.telephoneDigits} números atingido.`,
              }))
            }
          }}
          onBlur={(e) => handleErrors("address.telephone", e.target.value)}
          data-error={!!errorPatient.telephone}
          aria-invalid={Boolean(errorPatient.telephone)}
          aria-describedby={errorPatient.telephone ? "telephone-error" : undefined}
          inputMode="tel"
          className={`w-full md:w-full border-2  rounded-md px-2 py-3
                       text-[#333] placeholder:text-text-gray-400
                      ${patient.address.telephone ? "bg-white" : "bg-[#EAE9E9]"}
                      ${!errorPatient.telephone ? "border-[#D0D7DE]/40 focus:outline-[#FFA726]" : "border-[red] focus:outline-[red]"}
                      `}
        />
        {errorPatient.telephone && (
          <span id="telephone-error" role="alert" aria-live="polite" className="block text-sm text-red-600 pl-2 pt-1">
            {errorPatient.telephone}
          </span>
        )}
      </div>

      {/*Endereço*/}
      <fieldset className="flex flex-col md:flex-row flex-wrap w-full gap-2">
        <div className="flex gap-3">
          {/*Rua*/}
          <div className="flex-1">
            <label
              htmlFor="street"
              className=" text-base text-[#FFA726] font-medium w-full pl-2 flex items-center gap-1"
            >
              <MapPinHouse size={14} /> Rua
            </label>
            <input
              type="text"
              maxLength={registerPatientLimits.street}
              name="street"
              id="street"
              placeholder="Digite o nome da rua"
              value={patient.address.street}
              onKeyDown={(event) => preventTextLimitExceeded(event, patient.address.street, registerPatientLimits.street, "street", `Limite de ${registerPatientLimits.street} caracteres atingido.`)}
              onPaste={(event) => preventOversizedPaste(event, patient.address.street, registerPatientLimits.street, "street", `Limite de ${registerPatientLimits.street} caracteres atingido.`)}
              onChange={(e) => {
                handleLimitedTextChange(
                  "address.street",
                  "street",
                  e.target.value,
                  registerPatientLimits.street
                )
              }}
              onBlur={(e) => handleErrors("address.street", e.target.value)}
              data-error={!!errorPatient.street}
              aria-invalid={Boolean(errorPatient.street)}
              aria-describedby={errorPatient.street ? "street-error" : undefined}
              className={`w-full md:w-full border-2  rounded-md px-2 py-3
                       text-[#333] placeholder:text-text-gray-400
                      ${patient.address.street ? "bg-white" : "bg-[#EAE9E9]"}
                      ${!errorPatient.street ? "border-[#D0D7DE]/40 focus:outline-[#FFA726]" : "border-[red] focus:outline-[red]"}
                      `}
            />
            {errorPatient.street && (
              <span id="street-error" role="alert" aria-live="polite" className="block text-sm text-red-600 pl-2 pt-1">
                {errorPatient.street}
              </span>
            )}
          </div>

          {/*Número*/}
          <div className="flex flex-col shrink-0">
            <label
              htmlFor="addressNumber"
              className=" text-base text-[#FFA726] font-medium w-full pl-2 flex items-center gap-1"
            >
              Nº
            </label>
            <input
              type="number"
              name="addressNumber"
              id="addressNumber"
              min={1}
              max={registerPatientLimits.addressNumber}
              step={1}
              inputMode="numeric"
              placeholder="000º"
              disabled={patient.address.noNumber}
              value={patient.address.noNumber ? "" : (patient.address.addressNumber ?? "")}
              onChange={(e) => {
                const value = e.target.value
                const parsedValue = value === "" ? null : e.target.valueAsNumber

                if (typeof parsedValue === "number" && !Number.isInteger(parsedValue)) {
                  setErrorPatient((previous) => ({
                    ...previous,
                    addressNumber: "Informe um número inteiro, sem casas decimais.",
                  }))
                  return
                }

                if (
                  typeof parsedValue === "number" &&
                  parsedValue < 1
                ) {
                  handleChange("address.addressNumber", 1)
                  setErrorPatient((previous) => ({
                    ...previous,
                    addressNumber: "O número do endereço deve ser maior que zero.",
                  }))
                  return
                }

                if (
                  typeof parsedValue === "number" &&
                  parsedValue > registerPatientLimits.addressNumber
                ) {
                  handleChange("address.addressNumber", registerPatientLimits.addressNumber)
                  setErrorPatient((previous) => ({
                    ...previous,
                    addressNumber: `Limite de ${registerPatientLimits.addressNumber} atingido.`,
                  }))
                  return
                }

                handleChange(
                  "address.addressNumber",
                  parsedValue
                )
                handleErrors(
                  "address.addressNumber",
                  parsedValue
                )
              }}
              onBlur={(e) => {
                const value = e.target.value
                handleErrors(
                  "address.addressNumber",
                  value === "" ? null : e.target.valueAsNumber
                )
              }}
              data-error={!!errorPatient.addressNumber}
              aria-invalid={Boolean(errorPatient.addressNumber)}
              aria-describedby={errorPatient.addressNumber ? "address-number-error" : undefined}
              className={`w-32 border-2  rounded-md px-2 py-3
                       text-[#333] placeholder:text-text-gray-400
                      ${patient.address.addressNumber ? "bg-white" : "bg-[#EAE9E9]"}
                      ${!errorPatient.addressNumber ? "border-[#D0D7DE]/40 focus:outline-[#FFA726]" : "border-[red] focus:outline-[red]"}
                      `}
            />

            <label htmlFor="noNumber" className="flex gap-2 pt-2 ">
              <input
                type="checkbox"
                id="noNumber"
                checked={patient.address.noNumber}
                onChange={(e) => {
                  const checked = e.target.checked
                  setPatient((prev) => ({
                    ...prev,
                    address: {
                      ...prev.address,
                      noNumber: checked,
                      addressNumber: checked ? null : prev.address.addressNumber,
                    },
                  }))
                  handleChange("address.noNumber", checked)

                  if (checked) {
                    setErrorPatient((prev) => ({
                      ...prev,
                      addressNumber: "",
                    }))
                  }
                }}
              />
              Sem número
            </label>

            {errorPatient.addressNumber && (
              <>
                <span id="address-number-error" role="alert" aria-live="polite" className="block text-sm text-red-600 pl-2 pt-1">
                  {errorPatient.addressNumber}
                </span>
              </>
            )}
          </div>
        </div>
        {/*Caixa número baixo*/}
        <div className=" flex-1 flex gap-2">
          {/*Bairro*/}
          <div className="w-full">
            <label
              htmlFor="neighborhood"
              className=" text-base text-[#FFA726] font-medium w-full pl-2 flex items-center gap-1"
            >
              Bairro
            </label>
            <input
              type="text"
              maxLength={registerPatientLimits.neighborhood}
              name="neighborhood"
              id="neighborhood"
              value={patient.address.neighborhood}
              onKeyDown={(event) => preventTextLimitExceeded(event, patient.address.neighborhood, registerPatientLimits.neighborhood, "neighborhood", `Limite de ${registerPatientLimits.neighborhood} caracteres atingido.`)}
              onPaste={(event) => preventOversizedPaste(event, patient.address.neighborhood, registerPatientLimits.neighborhood, "neighborhood", `Limite de ${registerPatientLimits.neighborhood} caracteres atingido.`)}
              onChange={(e) => {
                handleLimitedTextChange(
                  "address.neighborhood",
                  "neighborhood",
                  e.target.value,
                  registerPatientLimits.neighborhood
                )
              }}
              onBlur={(e) => handleErrors("address.neighborhood", e.target.value)}
              data-error={!!errorPatient.neighborhood}
              aria-invalid={Boolean(errorPatient.neighborhood)}
              aria-describedby={errorPatient.neighborhood ? "neighborhood-error" : undefined}
              className={`w-full md:w-full border-2 rounded-md px-2 py-3
                       text-[#333] placeholder:text-text-gray-400
                      ${patient.address.neighborhood ? "bg-white" : "bg-[#EAE9E9]"}
                      ${!errorPatient.neighborhood ? "border-[#D0D7DE]/40 focus:outline-[#FFA726]" : "border-[red] focus:outline-[red]"}
                      `}
            />
            {errorPatient.neighborhood && (
              <span id="neighborhood-error" role="alert" aria-live="polite" className="block text-sm text-red-600 pl-2 pt-1">
                {errorPatient.neighborhood}
              </span>
            )}
          </div>
        </div>
      </fieldset>

      <div className="flex flex-col">
        <label
          htmlFor="reference"
          className=" text-base text-[#FFA726] font-medium w-full pl-2 flex items-center gap-1"
        >
          <Bookmark size={14} />
          Referência
        </label>
        <textarea
          name="reference"
          id="reference"
          rows={4}
          maxLength={registerPatientLimits.referenceHouse}
          placeholder="Ponto de referência"
          onKeyDown={(event) => preventTextLimitExceeded(event, patient.address.referenceHouse, registerPatientLimits.referenceHouse, "referenceHouse", `Limite de ${registerPatientLimits.referenceHouse} caracteres atingido.`)}
          onPaste={(event) => preventOversizedPaste(event, patient.address.referenceHouse, registerPatientLimits.referenceHouse, "referenceHouse", `Limite de ${registerPatientLimits.referenceHouse} caracteres atingido.`)}
          onChange={(e) => {
            handleLimitedTextChange(
              "address.referenceHouse",
              "referenceHouse",
              e.target.value,
              registerPatientLimits.referenceHouse
            )
          }}
          onBlur={(e) => handleErrors("address.referenceHouse", e.target.value)}
          data-error={!!errorPatient.referenceHouse}
          className={`w-full md:w-full border-2  rounded-md px-2 py-3
                       text-[#333] placeholder:text-text-gray-400
                      ${patient.address.referenceHouse ? "bg-white" : "bg-[#EAE9E9]"}
                      ${!errorPatient.referenceHouse ? "border-[#D0D7DE]/40 focus:outline-[#FFA726]" : "border-[red] focus:outline-[red]"}
                      `}
        />
        <p
          aria-live="polite"
          className={`mt-1 self-end text-xs font-medium ${
            patient.address.referenceHouse.length >= registerPatientLimits.referenceHouse * 0.9
              ? "text-red-600"
              : patient.address.referenceHouse.length >= registerPatientLimits.referenceHouse * 0.7
                ? "text-amber-600"
                : "text-green-700"
          }`}
        >
          {patient.address.referenceHouse.length}/{registerPatientLimits.referenceHouse} caracteres
        </p>
        {errorPatient.referenceHouse && (
          <span role="alert" aria-live="polite" className="block text-sm text-red-600 pl-2 pt-1">
            {errorPatient.referenceHouse}
          </span>
        )}
      </div>
    </>
  )
}

export default Profile
