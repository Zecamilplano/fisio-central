import { Check, LucideIcon } from "lucide-react"
import {
  serviceTypeOptionsData,
  totalNumberSession,
} from "@/data/registerPatientData"
import { useFormTypeService } from "@/hook/useFormTypeService"
import { NumericFormat } from "react-number-format"
import { registerPatientLimits } from "@/data/registerPatientLimits"

type TypeOfServiceProps = {
  form: ReturnType<typeof useFormTypeService>
}

function TypeOfService({ form }: TypeOfServiceProps) {
  const { serviceForm, error, handleChange, submitted, inputRef, setError } = form

  return (
    <section className="w-full">
      <fieldset className="mt-8 mb-7">
        <legend className="sr-only">Tipo de atendimento</legend>

        <div className="flex flex-col md:flex-row gap-3">
          {serviceTypeOptionsData.map((data) => {
            const Icon: LucideIcon = data.Icone
            const selected = serviceForm.selectService === data.value

            return (
              <label
                key={data.value}
                htmlFor={data.value}
                className={`cursor-pointer font-open-sans rounded-md w-full md:w-90 flex flex-col px-3 py-5 border-3 transition-colors focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[#FFA726]
                  ${
                    selected
                      ? "bg-[#FFF5EA] border-solid border-[#FFA726]"
                      : "border-solid border-[#F0E6DC]"
                  }
                `}
              >
                <input
                  type="radio"
                  id={data.value}
                  name="type-service"
                  value={data.value}
                  checked={selected}
                  onChange={() => handleChange("selectService", data.value)}
                  aria-describedby={
                    submitted && error?.service ? "service-error" : undefined
                  }
                  className="sr-only"
                />

                <div className="flex justify-between">
                  <div />
                  <span
                    aria-hidden="true"
                    className={`text-white text-xl rounded-full w-10 h-10 flex justify-center items-center
                      ${
                        selected
                          ? "bg-[#FFA725]"
                          : "border-4 border-solid border-[#F0E6DC]"
                      }
                    `}
                  >
                    {selected && <Check />}
                  </span>
                </div>

                <div className="pt-2">
                  <Icon size={53} color={selected ? "#FFA726" : "#8C7B6B"} />
                  <h3
                    className={`text-3xl font-semibold pt-3 ${
                      selected ? "text-[#FFA726]" : "text-[#2D2D2D]"
                    }`}
                  >
                    {data.titulo}
                  </h3>
                  <p className="text-sm text-[#8C7B6B] pt-2">
                    {data.descricao}
                  </p>
                </div>
              </label>
            )
          })}
        </div>

        {submitted && error?.service && (
          <span
            id="service-error"
            aria-live="polite"
            className="block text-sm text-red-600 px-1 pt-2"
            role="alert"
          >
            {error.service}
          </span>
        )}
      </fieldset>

      {serviceForm.selectService === "pacote" && (
        <fieldset className="font-open-sans mb-6">
          <legend className="font-semibold text-lg text-[#FFA726]">
            Total de sessões no pacote
          </legend>

          <div className="flex flex-wrap gap-4 my-2">
            {totalNumberSession.map((item) => {
              const isSelected = serviceForm.selectPackage === item.value
              return (
                <button
                  key={item.value}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => handleChange("selectPackage", item.value)}
                  className={`rounded-lg relative w-13 h-12 flex items-center justify-center cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFA726]
                    ${
                      isSelected
                        ? "bg-[#FBA731] text-white"
                        : "bg-[#D9D9D9] text-[#2D2D2D]"
                    }
                  `}
                >
                  {item.label}
                </button>
              )
            })}
          </div>

          {serviceForm.selectPackage === "custom" && (
            <div className="mt-3 flex flex-col gap-1">
              <label
                htmlFor="custom-total-sessions"
                className="text-sm font-medium text-[#2D2D2D]"
              >
                Quantas sessões?
              </label>
              <input
                ref={inputRef}
                id="custom-total-sessions"
                type="number"
                min={1}
                max={registerPatientLimits.packageSessions}
                step={1}
                inputMode="numeric"
                value={serviceForm.totalSessions ?? ""}
                onChange={(event) => {
                  const value = event.target.value === "" ? null : event.target.valueAsNumber
                  if (value !== null && !Number.isInteger(value)) {
                    setError({ service: "", package: "Informe uma quantidade inteira de sessões." })
                    return
                  }
                  if (value !== null && value < 1) {
                    setError({ service: "", package: "Informe pelo menos 1 sessão." })
                    return
                  }
                  if (value !== null && value > registerPatientLimits.packageSessions) {
                    handleChange("totalSessions", registerPatientLimits.packageSessions)
                    setError({ service: "", package: `Limite de ${registerPatientLimits.packageSessions} sessões atingido.` })
                    return
                  }
                  handleChange("totalSessions", value)
                }}
                aria-invalid={Boolean(error?.package)}
                aria-describedby={
                  error?.package ? "package-error" : undefined
                }
                className={`w-40 rounded-md border-2 px-3 py-2 text-[#2D2D2D] focus:border-[#FFA726] focus:outline-none ${error?.package ? "border-red-500" : "border-[#D0D7DE]"}`}
              />
            </div>
          )}

          {error?.package && (
            <span
              id="package-error"
              aria-live="polite"
              className="block text-sm text-red-600 px-1 pt-2"
              role="alert"
            >
              {error.package}
            </span>
          )}
        </fieldset>
      )}

      <div className="flex flex-col shrink-0">
        <label
          htmlFor="priceSession"
          className="text-lg text-[#FFA726] font-medium w-full flex items-center gap-1"
        >
          Preço da sessão
        </label>

        <div className="relative w-40">
          <NumericFormat
            id="priceSession"
            value={serviceForm.priceSession}
            thousandSeparator="."
            decimalSeparator={","}
            decimalScale={2}
            fixedDecimalScale
            prefix="R$ "
            allowNegative={false}
            allowLeadingZeros={false}
            onKeyDown={(event) => {
              if (event.key === "-") {
                event.preventDefault()
                setError({ service: "", price: "O preço não pode ser negativo." })
              }
            }}
            onValueChange={(values) =>
              handleChange("priceSession", values.value || "0")
            }
            isAllowed={(values) => {
              if ((values.floatValue ?? 0) > registerPatientLimits.pricePerSession) {
                setError({ service: "", price: "Limite de R$ 999.999,99 atingido." })
                return false
              }
              return true
            }}
            aria-invalid={Boolean(error?.price)}
            className={`w-full rounded-md border-2 px-3 py-2 text-[#333] focus:border-[#FFA726] focus:outline-none ${error?.price ? "border-red-500" : "border-[#EAECF0]"}`}
          />
        </div>
        {error?.price && (
          <span className="mt-1 block text-sm text-red-600" role="alert" aria-live="polite">{error.price}</span>
        )}
      </div>
    </section>
  )
}

export default TypeOfService
