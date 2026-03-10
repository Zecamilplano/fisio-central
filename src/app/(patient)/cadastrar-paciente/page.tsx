"use client"
import { useState } from "react"
import Profile from "@/components/patient/register/profile"
import HeaderFormRegister from "@/components/patient/register/headerForm"
import { Box, CalendarDays, Check } from "lucide-react"

function RegisterPatient() {
  const [neighborhood, setNeighborhood] = useState("Centro") // Bairro
  const [step, setStep] = useState({
    firstStep: {
      "active": false,
      "completed": false
    },
    secondStep: {
      "active": true,
      "completed": false
    },
    thirdStep: {
      "active": false,
      "completed": false
    },
  })

  const { firstStep, secondStep, thirdStep } = step

  const option = [
    { label: 4, value: 4 },
    { label: 6, value: 6 },
    { label: 8, value: 8 },
    { label: 10, value: 10 },
    { label: "+", value: "custom" },
  ]

  const [selected, setSelected] = useState<string | number | null>()
  const [customValue, setCustomValue] = useState("")

  return (
    <main
      className="bg-green-700 flex-1 flex justify-center items-center"
    >
      <section className="bg-white rounded-md px-2 py-2 m-3 w-full max-w-210 h-full flex flex-col items-center  ">
        {/*Etapas*/}
        <nav className="mt-8 w-full flex justify-center">
          <ol className="flex items-center justify-center">

            {/* Step 1 */}
            <li className="flex items-center">
              <button className={`
                      flex items-center justify-center
                      w-10 h-10 sm:w-12 sm:h-12
                      rounded-full  
                      font-semibold
                      ${firstStep.active ? "bg-[#FFA726] text-white" : "bg-[#F5F0EB] text-[#8C7B6B]"}
              `}>
                1
              </button >
            </li>

            {/* Linha */}
            <li className="w-16 sm:w-24 md:w-32 h-0.5 bg-[#8C7B6B] mx-2" />

            {/* Step 2 */}
            <li className="flex items-center">
              <button className={`
                      flex items-center justify-center
                      w-10 h-10 sm:w-12 sm:h-12
                      rounded-full  
                      font-semibold
                      ${secondStep.active ? "bg-[#FFA726] text-white" : "bg-[#F5F0EB] text-[#8C7B6B]"}
              `}>
                2
              </button>
            </li>

            {/* Linha */}
            {/* <div className="w-16 sm:w-24 md:w-64 h-0.5 bg-[#8C7B6B] mx-2" /> */}
            <li className="w-16 sm:w-24 md:w-32 h-0.5 bg-[#8C7B6B] mx-2" />

            {/* Step 3 */}
            <li className="flex items-center">
              <button className={`
                      flex items-center justify-center
                      w-10 h-10 sm:w-12 sm:h-12
                      rounded-full  
                      font-semibold
                      ${thirdStep.active ? "bg-[#FFA726] text-white" : "bg-[#F5F0EB] text-[#8C7B6B]"}
              `}>
                3
              </button>
            </li>

          </ol>
        </nav>

        <form className="flex flex-col gap-2">
          {/*Dados do paciente*/}

          {firstStep.active && (
            <>
              <HeaderFormRegister title="Dados do Paciente" subtitle="Preencha as informações básicas" icon="person" />
              <Profile neighborhood={neighborhood} />
              <button
                type="submit"
                className="text-white text-xl font-bold font-open-sans bg-[#FFA726] rounded-md py-3 w-full  my-6 cursor-pointer hover:opacity-80 active:opacity-60"
              >
                Próximo
              </button>
            </>
          )}

          {/*Tipo de atendimento*/}
          <HeaderFormRegister title="Tipo de atendimento" subtitle="Escolha entre pacote ou sessoes avulsas" icon="square" />

          <fieldset className="mt-8 mb-7">
            <legend className="sr-only">Tipo de agendamento</legend>

            <div className="flex md:flex-row gap-3">

              {/*Pacote*/}
              <label
                htmlFor="tipo-secao"
                className="cursor-pointer bg-[#FFF5EA] text-[#FFA726] font-open-sans border-3 border-solid border-[#FFA726] rounded-lg w-90 flex flex-col px-3 py-5"
              >
                <input type="radio" id="tipo-secao" name="tipo-secao" value="pacote" className="sr-only" />

                {/*parte do check*/}
                <div className="flex justify-between">
                  <div />

                  <div className="bg-[#FFA726] text-white text-xl p-2 rounded-[50%] ">
                    <Check />
                  </div>
                </div>

                <div className="pt-2 ">
                  <Box size={52} />
                  <h3 className="text-3xl font-semibold pt-3">Pacote</h3>
                  <p className="text-sm text-[#8C7B6B] pt-2">Conjunto de sessões com valor fechado.</p>
                </div>
              </label>

              {/*Seção*/}
              <label
                htmlFor="tipo-secao"
                className="cursor-pointer font-open-sans border-3 border-solid border-[#F0E6DC] rounded-lg w-90 flex flex-col px-3 py-5"
              >
                <input type="radio" id="tipo-secao" name="tipo-secao" value="sessao" className="sr-only" />

                {/*parte do check*/}
                <div className="flex justify-between">
                  <div />

                  <div className="border-3 border-solid border-[#F0E6DC] p-2 rounded-[50%] w-10 h-10 ">
                  </div>
                </div>

                <div className="pt-2 ">
                  <CalendarDays size={52} color="#8C7B6B" />
                  <h3 className="text-3xl text-[#2D2D2D] font-semibold pt-3">Pacote</h3>
                  <p className="text-sm text-[#8C7B6B] pt-2">Conjunto de sessões com valor fechado.</p>
                </div>
              </label>
            </div>

          </fieldset>

          {/*Total de sessões no pacote*/}
          <fieldset className="font-open-sans">
            <legend>Total de sessões no pacote</legend>

            <label className="flex gap-4 my-2 cursor-pointer">
              {option.map((item) => (
                <div
                  key={item.value}
                  className="  rounded-lg bg-[#D9D9D9] has-checked:bg-[#FBA731] has-checked:text-white
                  text-[#2D2D2D] w-13 h-12 flex items-center justify-center  "
                >
                  <input
                    type="radio"
                    name={"sessions"}
                    id={String(item.value)}
                    value={item.label}
                    checked={selected === item.value}
                    onChange={() => setSelected(item.value)}
                    className="hidden cursor-pointer"
                  />
                  {item.label}

                </div>
              ))}

              {selected === "custom" && (
                <input
                  type="number"
                  value={customValue || 12}
                  onChange={(e) => setCustomValue(e.target.value)}
                  className="w-13 h-12 bg-[#D9D9D9]"
                />
              )}

            </label>
          </fieldset>

          {/*Botões anterior e próximo*/}
          <fieldset
            className="flex gap-2"
          >
            {/*Botão anterior*/}
            <button
              type="submit"
              className="text-white text-xl  font-open-sans bg-[#6b7280] rounded-md py-3 w-full  my-6 cursor-pointer hover:opacity-80 active:opacity-60"
            >
              Anterior
            </button>

            {/*Botão póximo*/}
            <button
              type="submit"
              className="text-white text-xl font-bold font-open-sans bg-[#FFA726] rounded-md py-3 w-full  my-6 cursor-pointer hover:opacity-80 active:opacity-60"
            >
              Próximo
            </button>
          </fieldset>

        </form>

      </section>
    </main>
  )
}

export default RegisterPatient
