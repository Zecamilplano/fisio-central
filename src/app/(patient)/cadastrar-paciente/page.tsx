// prettier-ignore
"use client"
import { useState } from "react"
import Profile from "@/components/patient/register/profile"
import HeaderFormRegister from "@/components/patient/register/headerForm"
import TypeOfService from "@/components/patient/register/typeOfService"
import {
  stepData,
  daysOfTheWeek,
  summaryCardData,
} from "@/data/registerPatientData"
import ButtonPrevNext from "@/components/buttonPrevNext"
import SchedulingSessions from "@/components/patient/register/scheduling-sessions"
import { summaryCardType } from "@/types/patientsTypes"

function RegisterPatient() {
  /*Dados paciente*/
  const [neighborhood, setNeighborhood] = useState("Centro") // Bairro

  /*Etapa geral do formulário*/
  const [step, setStep] = useState(stepData)
  const { firstStep, secondStep, thirdStep } = step

  /*Card de resumo das seções: Agendada, Restante e totais*/
  const [summaryCard, setSummaryCard] =
    useState<summaryCardType[]>(summaryCardData)

  const [selectedService, setSelectedService] = useState<
    string | number | null
  >(null)
  const [customValueSession, setCustomValueSession] = useState<
    string | number | null
  >(null)
  const [typeService, setTypeService] = useState<string>("pacote")

  /*Dias das seções*/
  const [daySelect, setDaySelect] = useState<string | null>(null)

  return (
    <main className="bg-green-700 flex-1 flex justify-center items-center">
      <section className="bg-white rounded-md px-2 py-2 m-3 w-full max-w-210 h-full flex flex-col items-center  ">
        {/*Etapas*/}
        <nav className="mt-8 w-full flex justify-center">
          <ol className="flex items-center justify-center">
            {/* Step 1 */}
            <li className="flex items-center">
              <button
                className={`
                flex items-center justify-center
                w-10 h-10 sm:w-12 sm:h-12 rounded-full font-semibold
                ${firstStep.active ? "bg-[#FFA726] text-white" : "bg-[#F5F0EB] text-[#8C7B6B]"}
              `}
              >
                1
              </button>
            </li>

            {/* Linha */}
            <li className="w-16 sm:w-24 md:w-32 h-0.5 bg-[#8C7B6B] mx-2" />

            {/* Step 2 */}
            <li className="flex items-center">
              <button
                className={`
                flex items-center justify-center
                w-10 h-10 sm:w-12 sm:h-12
                rounded-full  
                font-semibold
                ${secondStep.active ? "bg-[#FFA726] text-white" : "bg-[#F5F0EB] text-[#8C7B6B]"}
              `}
              >
                2
              </button>
            </li>

            {/* Linha */}
            {/* <div className="w-16 sm:w-24 md:w-64 h-0.5 bg-[#8C7B6B] mx-2" /> */}
            <li className="w-16 sm:w-24 md:w-32 h-0.5 bg-[#8C7B6B] mx-2" />

            {/* Step 3 */}
            <li className="flex items-center">
              <button
                className={`
                flex items-center justify-center
                w-10 h-10 sm:w-12 sm:h-12
                rounded-full  
                font-semibold
                ${thirdStep.active ? "bg-[#FFA726] text-white" : "bg-[#F5F0EB] text-[#8C7B6B]"}
            `}
              >
                3
              </button>
            </li>
          </ol>
        </nav>

        <form className="flex flex-col gap-6">
          {/*Dados do paciente*/}

          {firstStep.active && <Profile neighborhood={neighborhood} />}

          {/*Tipo de atendimento*/}
          {secondStep.active && (
            <TypeOfService
              selectedService={selectedService}
              customValueSession={customValueSession}
              typeService={typeService}
              setSelectedService={setSelectedService}
              setCustomValueSession={setCustomValueSession}
              setTypeService={setTypeService}
            />
          )}

          {/*Agenda de seções no pacote*/}
          {thirdStep.active && (
            <SchedulingSessions
              typeService={typeService}
              summaryCard={summaryCard}
              daySelect={daySelect}
              setSummaryCard={setSummaryCard}
              setDaySelect={setDaySelect}
            />
          )}
        </form>
      </section>
    </main>
  )
}

export default RegisterPatient
