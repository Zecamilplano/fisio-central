import { summaryCardType } from "@/types/patientsTypes"
import HeaderFormRegister from "./headerForm"
import { Dispatch, SetStateAction } from "react"
import ButtonPrevNext from "@/components/buttonPrevNext"
import { daysOfTheWeek } from "@/data/registerPatientData"
import { Calendar, Trash } from "lucide-react"

type SchedulingSessionsType = {
  typeService: string
  header: {
    title: string
    subTitle: string
  }
  summaryCard: summaryCardType[]
  daySelect: string | null
  setSummaryCard: Dispatch<SetStateAction<summaryCardType[]>>
  setDaySelect: Dispatch<SetStateAction<string | null>>
}

function SchedulingSessions({
  typeService,
  header,
  summaryCard,
  daySelect,
  setSummaryCard,
  setDaySelect,
}: SchedulingSessionsType) {
  return (
    <>
      {/* <HeaderFormRegister */}
      {/*   title="Agenda de sessão do pacote" */}
      {/*   subtitle="Adicione ate 6 sessoes ao pacote" */}
      {/*   icon="square" */}
      {/* /> */}

      <HeaderFormRegister
        title="Agenda de sessão do pacote"
        subtitle="Adicione ate 6 sessoes ao pacote"
        icon="square"
      />

      <section className="font-open-sans flex flex-row justify-center gap-4">
        <h2 className="sr-only">Resumo da sesssões</h2>

        {/*Agendada, Restante, Total*/}
        {summaryCard.map((section, index) => {
          const differentText = section.label === "Restante"

          return (
            <div key={index} className="flex flex-col items-center">
              <div className="w-20 h-20 bg-[#FFEDD4] rounded-2xl flex items-center justify-center">
                <p
                  className={` 
                        text-2xl  font-semibold
                        ${differentText ? "text-[#2D2D2D]" : "text-[#FFA726]"}
                      `}
                >
                  {section.value}
                </p>
              </div>

              <p className="text-[#8C7B6B] tracking-tight">{section.label}</p>
            </div>
          )
        })}
      </section>

      {/*Quantas vezes na semana*/}
      <fieldset className="font-open-sans flex justify-center gap-4">
        <legend className="text-lg text-[#FFA726] text-center font-semibold">
          Quantas vezes na semana
        </legend>

        {Array.from({ length: 5 }, (_, i) => {
          const index = i + 1
          return (
            <label
              key={i}
              htmlFor={`vezes-${index}`}
              className={`
                    w-12 h-12 mt-2 flex justify-center items-center  bg-[#D9D9D9] has-checked:bg-[#FFA726] has-checked:text-white text-lg 
                    text-[#2D2D2D] select-none rounded-md
                  `}
            >
              {index}
              <input
                type="radio"
                id={`vezes-${index}`}
                name="times"
                value={index}
                className="hidden"
              />
            </label>
          )
        })}
      </fieldset>

      {/*Dias das seções na semana*/}
      <fieldset
        key={2}
        className="font-open-sans w-full flex flex-wrap justify-center gap-6"
      >
        <legend className="text-lg text-[#FFA726] text-center font-semibold mb-3">
          Dias das sessões na semana
        </legend>

        {daysOfTheWeek.map((day) => (
          <label
            key={day}
            htmlFor={day}
            className={`
                  w-30 py-2 px-5 text-xl text-center rounded-md capitalize select-none
                  ${daySelect === day ? "bg-[#FBA731] text-white" : "bg-[#D9D9D9] text-[#2D2D2D]"}
                `}
          >
            <input
              type="checkbox"
              id={day}
              name="dia"
              value={day}
              onChange={() => setDaySelect(day)}
              className="hidden peer"
            />
            {day}
          </label>
        ))}
      </fieldset>

      {/*Sessões*/}
      <ul>
        <li>
          <article className="flex justify-between items-center font-open-sans bg-[#FBA731] py-3 px-3 rounded-lg">
            <header className="flex items-center gap-3 ">
              <span className="w-8 h-8 bg-[#FFEDD4] text-[#2D2D2D] text-lg flex flex-row justify-center items-center rounded-[50%]">
                1
              </span>
              <time
                dateTime="2026/03/20"
                className="text-xl text-white font-semibold"
              >
                20/03/2026
              </time>
            </header>

            <div className="flex gap-3 text-white">
              <button type="button">
                <Calendar />
              </button>
              <button type="button">
                <Trash />
              </button>
            </div>
          </article>
        </li>
      </ul>

      <button
        type="button"
        className="hover:text-[#F59E0B] active:text-[#D97706] hover:bg-[#FFF3E0] active:bg-[#FFE0B2]  text-center text-[#FFA726] text-xl align-middle border-2 border-solid border-[#FFA726]/30 py-3 rounded-md cursor-pointer"
      >
        + Adicionar sessão
      </button>

      <ButtonPrevNext variant="double" active={false} />
    </>
  )
}

export default SchedulingSessions
