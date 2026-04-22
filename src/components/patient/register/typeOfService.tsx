import { Check, LucideIcon } from "lucide-react"
import {
  serviceTypeOptionsData,
  totalNumberSession,
} from "@/data/registerPatientData"
import { useFormTypeService } from "@/hook/useFormTypeService"

type TypeOfServiceProps = {
  form: ReturnType<typeof useFormTypeService>
}

function TypeOfService({ form }: TypeOfServiceProps) {
  const { serviceForm, error, handleChange, submitted, inputRef } = form

  return (
    <section>
      <fieldset className="mt-8 mb-7">
        <legend className="sr-only">Tipo de agendamento</legend>

        {/*Botões pacote e sessões */}
        <div className="flex flex-col md:flex-row gap-3">
          {serviceTypeOptionsData.map((data) => {
            const Icon: LucideIcon = data.Icone

            return (
              <label
                key={data.value}
                htmlFor={String(data.value)}
                className={`cursor-pointer font-open-sans rounded-md w-80 md:w-90 flex flex-col px-3 py-5
                  ${
                    serviceForm.selectService === data.value
                      ? "bg-[#FFF5EA] border-3 border-solid border-[#FFA726]"
                      : "border-3 border-solid border-[#F0E6DC]"
                  }
                `}
              >
                <input
                  type="radio"
                  id={data.value}
                  name="type-service"
                  value={data.value}
                  onClick={() =>
                    handleChange(
                      "selectService",
                      serviceForm.selectService === data.value
                        ? null
                        : data.value
                    )
                  }
                  className="sr-only"
                />

                {/*Parte do check*/}
                <div className="flex justify-between">
                  <div />
                  <div
                    className={`
                      text-white text-xl rounded-[50%] w-10 h-10 flex justify-center items-center
                        ${
                          serviceForm.selectService === data.value
                            ? "bg-[#FFA725]"
                            : "border-4 border-solid border-[#F0E6DC]"
                        }
                      `}
                  >
                    {serviceForm.selectService === data.value && <Check />}
                  </div>
                </div>

                {/*Icone, título e texto*/}
                <div className="pt-2 ">
                  <Icon
                    size={53}
                    color={`${
                      serviceForm.selectService === data.value
                        ? "#FFA726"
                        : "#8C7B6B"
                    }`}
                  />
                  <h3
                    className={`text-3xl font-semibold pt-3
                      ${
                        serviceForm.selectService === data.value
                          ? "text-[#FFA726]"
                          : "text-[#2D2D2D]"
                      }`}
                  >
                    {data.titulo}
                  </h3>
                  <p
                    className={`text-sm text-[#8C7B6B] pt-2
                    `}
                  >
                    {data.descricao}
                  </p>
                </div>
                {/*Icone, título e texto*/}
              </label>
            )
          })}
        </div>
        {submitted && error?.service && (
          <span className="text-[red] flex px-1 pt-2">{error?.service}</span>
        )}
      </fieldset>

      {/*Botões de total de sessões por pacote*/}
      {serviceForm.selectService === "pacote" && (
        <fieldset className="font-open-sans">
          <legend className="font-semibold text-lg text-[#FFA726]">
            Total de sessões no pacote
          </legend>

          <div className="flex gap-4 my-2">
            {totalNumberSession.map((item) => {
              const isPlus = item.value === "custom"

              return (
                <div key={item.value}>
                  <button
                    type="button"
                    onClick={() => handleChange("totalSessions", item.value)}
                    className={`rounded-lg 
                ${serviceForm.totalSessions === item.value ? "bg-[#FBA731] text-white" : "  bg-[#D9D9D9] text-[#2D2D2D]"}
                relative w-13 h-12
                flex items-center justify-center
                cursor-pointer`}
                  >
                    {isPlus && serviceForm.totalSessions === "custom" && (
                      <input
                        ref={inputRef}
                        type="number"
                        onClick={() =>
                          handleChange("totalSessions", item.value)
                        }
                        className="absolute w-13 h-12 bg-[#D9D9D9] text-[#2D2D2D] outline-[#FFA726] rounded-lg text-center"
                      />
                    )}
                    {item.label}
                  </button>
                </div>
              )
            })}
          </div>
          {submitted && error?.package && (
            <span className="text-[red] flex px-1 pt-2">{error?.package}</span>
          )}
        </fieldset>
      )}
      {/*Botões de total de sessões por pacote*/}
    </section>
  )
}

export default TypeOfService
