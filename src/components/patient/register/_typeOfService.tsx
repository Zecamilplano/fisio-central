import { PackageSelectType, TypeOfServiceType } from "@/types/patientsTypes"
import { Check, LucideIcon } from "lucide-react"
import HeaderFormRegister from "./headerForm"
import {
  serviceTypeOptionsData,
  totalNumberSession,
} from "@/data/registerPatientData"
import { useEffect, useRef, useState } from "react"
import ButtonPrevNext from "@/components/buttonPrevNext"

function TypeOfService() {
  const typeService: TypeOfServiceType = "pacote"
  const [selectedService, setSelectedService] = useState<TypeOfServiceType>()
  const [packageSelect, setPackageSelect] = useState<PackageSelectType | null>(
    null
  )
  const inputRef = useRef<HTMLInputElement | null>(null)

  // useEffect(() => {
  //   if (selectedService === "custom") {
  //     inputRef.current?.focus()
  //   }
  // }, [selectedService])

  return (
    <section>
      <fieldset className="mt-8 mb-7">
        <legend className="sr-only">Tipo de agendamento</legend>

        <div className="flex md:flex-row gap-3">
          {serviceTypeOptionsData.map((data) => {
            const Icon: LucideIcon = data.Icone

            return (
              <label
                key={data.value}
                htmlFor={data.value}
                className={`cursor-pointer font-open-sans rounded-md w-90 flex flex-col px-3 py-5
                  ${
                    typeService === data.value
                      ? "bg-[#FFF5EA] border-3 border-solid border-[#FFA726]"
                      : "border-3 border-solid border-[#F0E6DC]"
                  }
                `}
              >
                <input
                  type="radio"
                  id={data.value}
                  name="tipo"
                  value={data.value}
                  onChange={() => setSelectedService("pacote")}
                  className="sr-only peer"
                />

                {/*parte do check*/}
                <div className="flex justify-between">
                  <div />

                  <div
                    className={`
                      text-white text-xl rounded-[50%] w-10 h-10 flex justify-center items-center
                        ${
                          typeService === data.value
                            ? "bg-[#FFA726]"
                            : "border-4 border-solid border-[#F0E6DC]"
                        }
                      `}
                  >
                    {typeService === data.value && <Check />}
                  </div>
                </div>

                <div className="pt-2 ">
                  <Icon
                    size={53}
                    color={`${
                      typeService === data.value ? "#FFA726" : "#8C7B6B"
                    }`}
                  />
                  <h3
                    className={`text-3xl font-semibold pt-3
                      ${
                        typeService === data.value
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
              </label>
            )
          })}
        </div>
      </fieldset>

      {/*Total de sessões no pacote*/}
      {typeService === "pacote" && (
        <fieldset className="font-open-sans">
          <legend>Total de sessões no pacote</legend>

          <div className="flex gap-4 my-2">
            {totalNumberSession.map((item) => (
              <label
                key={item.value}
                className="rounded-lg bg-[#D9D9D9]
                has-checked:bg-[#FBA731]
                has-checked:text-white
                text-[#2D2D2D]
                w-13 h-12
                flex items-center justify-center
                cursor-pointer"
              >
                <input
                  type="radio"
                  name="sessions"
                  value={item.value}
                  checked={packageSelect === item.value}
                  onChange={() => setPackageSelect(item.value)}
                  className="hidden"
                />

                {item.label}
              </label>
            ))}

            {packageSelect === "custom" && (
              <input
                ref={inputRef}
                type="number"
                onChange={(e) => setPackageSelect(Number(e.target.value))}
                className="w-13 h-12 bg-[#D9D9D9] outline-[#FFA726] rounded-lg text-center"
              />
            )}
          </div>
        </fieldset>
      )}

      <ButtonPrevNext variant="double" active={true} />
    </section>
  )
}

export default TypeOfService
