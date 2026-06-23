import { daysOfWeek } from "@/data/registerPatientData"
import { CalendarDays, Clock3, Trash } from "lucide-react"
import { useSchedulingSessions } from "@/hook/useSchedulingSessions"
import Calendar from "react-calendar"
import { isSameDay, startOfDay } from "date-fns"
import { PaymentType } from "@/types"

type SchedulingSessionsProps = {
  form: ReturnType<typeof useSchedulingSessions>
}

const paymentInitialOptions: {
  value: PaymentType
  label: string
  description: string
}[] = [
  {
    value: "metade",
    label: "50% agora",
    description: "Metade das sessões como pagas",
  },
  {
    value: "integral",
    label: "Integral",
    description: "Todas as sessões como pagas",
  },
  {
    value: "depois",
    label: "Depois",
    description: "Todas como pendentes",
  },
]

function SchedulingSessions({ form }: SchedulingSessionsProps) {
  const {
    schedulingForm,
    setSchedulingForm,
    summary,
    sessions,
    weeklyAmount,
    selectedDays,
    maxDaysReached,
    schedulingFormErrors,
    handleWeeklyAmount,
    handleDayToggle,
    handleAddSessions,
    handleDeleteSession,
    handleDateChange,
    handleDateClear,
  } = form

  const { serviceType } = schedulingForm

  return (
    // pacote
    <>
      {serviceType === "pacote" && (
        <>
          <section className="font-open-sans flex flex-row justify-center gap-4">
            <h2 className="sr-only">Resumo da sesssões</h2>

            {/*Agendada, Restante, Total*/}
            {summary.map((section, index) => {
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

                  <p className="text-[#8C7B6B] tracking-tight">
                    {section.label}
                  </p>
                </div>
              )
            })}
          </section>

          {/*Sessões já realizadas*/}
          <section className="flex justify-center flex-col gap-2">
            <h2 className="text-lg text-[#FFA726] text-center font-semibold">
              Sessões já realizadas
            </h2>
            <input
              type="number"
              value={schedulingForm.package.totalSessions ?? ""}
              onChange={(e) => {
                const value = e.target.value

                setSchedulingForm((prev) => ({
                  ...prev,
                  package: {
                    ...prev.package,
                    totalSessions: value === "" ? null : Number(value),
                  },
                }))
              }}
              className=" w-52 flex self-center text-[#333] placeholder:text-text-gray-400 border-2 border-solid border-[#D0D7DE]/80 focus:outline-[#FFA726] rounded-md py-2 pl-2 "
            />
          </section>

          {/*Data inicial e horário*/}
          <section className="flex justify-center items-center gap-4">
            <div className="flex justify-center flex-col gap-2">
              <label className="flex items-center gap-2 text-lg text-[#FFA726] text-center font-semibold">
                <CalendarDays size={16} />
                Data inicial
              </label>

              <input
                type="date"
                value={
                  schedulingForm.package.startDate
                    ? new Date(schedulingForm.package.startDate)
                        .toISOString()
                        .split("T")[0]
                    : ""
                }
                onChange={(e) =>
                  setSchedulingForm((prev) => ({
                    ...prev,
                    package: {
                      ...prev.package,
                      startDate: e.target.value
                        ? new Date(e.target.value)
                        : null,
                    },
                  }))
                }
                className="w-38 text-[#333] border-2 border-[#D0D7DE]/80 focus:outline-[#FFA726] rounded-md py-2 px-3"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-lg text-[#FFA726] text-center font-semibold">
                <Clock3 size={16} /> Horário
              </label>

              <input
                type="time"
                value={schedulingForm.package.defaultTime}
                onChange={(e) =>
                  setSchedulingForm((prev) => ({
                    ...prev,
                    package: {
                      ...prev.package,
                      defaultTime: e.target.value,
                    },
                  }))
                }
                className="text-[#333] border-2 border-[#D0D7DE]/80 focus:outline-[#FFA726] rounded-md py-2 px-3"
              />
            </div>
          </section>

          {/*Quantas vezes na semana*/}
          <fieldset className="font-open-sans flex justify-center gap-4">
            <legend className="text-lg text-[#FFA726] text-center font-semibold">
              Quantas vezes na semana
            </legend>

            {Array.from({ length: 5 }, (_, i) => {
              const value = i + 1
              return (
                <label
                  key={i}
                  htmlFor={`vezes-${value}`}
                  className={`
                    w-12 h-12 mt-2 flex justify-center items-center  bg-[#D9D9D9] has-checked:bg-[#FFA726] has-checked:text-white text-lg 
                    text-[#2D2D2D] select-none rounded-md
                    ${
                      weeklyAmount === value
                        ? "bg-[#FFA726] text-white"
                        : "bg-[#D9D9D9] text-[#2D2D2D]"
                    }
                  `}
                >
                  {value}
                  <input
                    type="radio"
                    id={`vezes-${value}`}
                    name="times"
                    value={value}
                    onChange={(e) => handleWeeklyAmount(Number(e.target.value))}
                    className="hidden"
                  />
                </label>
              )
            })}
          </fieldset>
          {schedulingFormErrors.weeklyAmount.map((error, index) => (
            <p key={index} className="text-red-500 text-sm flex justify-center">
              {error}
            </p>
          ))}

          {/*Dias das seções na semana*/}
          <fieldset className="font-open-sans w-full flex flex-wrap justify-center gap-6">
            <legend className="text-lg text-[#FFA726] text-center font-semibold mb-3">
              Dias das sessões na semana
            </legend>

            {daysOfWeek.map((day) => {
              const isSelected = selectedDays[day]
              const isDisabled = maxDaysReached && !isSelected

              return (
                <label
                  key={day}
                  htmlFor={day}
                  className={`
                  w-30 py-2 px-5 text-xl text-center rounded-md capitalize select-none
                  ${selectedDays[day] ? "bg-[#FBA731] text-white" : "bg-[#D9D9D9] text-[#2D2D2D]"}
                  ${isDisabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}

                `}
                >
                  <input
                    type="checkbox"
                    id={day}
                    name="dia"
                    value={day}
                    disabled={isDisabled}
                    onChange={() => handleDayToggle(day)}
                    className="hidden peer"
                  />
                  {day}
                </label>
              )
            })}
            {schedulingFormErrors.selectedDays.map((error, index) => (
              <p key={index} className="text-red-500 text-sm flex">
                {error}
              </p>
            ))}
          </fieldset>
          {/*Dias das seções na semana*/}

          {/* Pagamento inicial */}
          <fieldset className="font-open-sans flex flex-col items-center gap-3">
            <legend className="text-lg text-[#FFA726] text-center font-semibold">
              Pagamento inicial
            </legend>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
              {paymentInitialOptions.map((payment) => (
                <button
                  key={payment.value}
                  type="button"
                  onClick={() =>
                    setSchedulingForm((prev) => ({
                      ...prev,
                      package: {
                        ...prev.package,
                        paymentType: payment.value,
                      },
                    }))
                  }
                  className={`
                      rounded-lg py-3 px-4 text-center border-2 transition
                      ${
                        schedulingForm.package.paymentType === payment.value
                          ? "bg-[#FFA726] text-white border-[#FFA726]"
                          : "bg-[#D9D9D9] text-[#2D2D2D] border-transparent"
                      }
                `}
                >
                  <strong className="block text-base">{payment.label}</strong>
                  <span className="block text-xs mt-1">
                    {payment.description}
                  </span>
                </button>
              ))}
            </div>
          </fieldset>
          {/* Pagamento inicial */}

          {/*Resumo das sessões*/}
          {sessions.length > 0 && (
            <section className="rounded-xl border border-[#FFA726]/20 bg-[#FFF8EE] p-4">
              <h2 className="mb-3 text-center font-semibold text-[#FFA726]">
                Resumo da agenda
              </h2>

              <div className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#8C7B6B]">Próxima sessão</span>
                  <strong className="text-[#2D2D2D]">
                    {sessions[0].fullDate} às {sessions[0].time}
                  </strong>
                </div>

                <div className="flex justify-between">
                  <span className="text-[#8C7B6B]">Pagamento inicial</span>
                  <strong className="text-[#2D2D2D]">
                    {schedulingForm.package.paymentType === "metade"
                      ? "50% agora"
                      : schedulingForm.package.paymentType === "integral"
                        ? "Integral"
                        : "Depois"}
                  </strong>
                </div>

                <div className="flex justify-between">
                  <span className="text-[#8C7B6B]">Serão geradas</span>
                  <strong className="text-[#2D2D2D]">
                    {sessions.length} sessões
                  </strong>
                </div>
              </div>
            </section>
          )}

          {/*Sessões*/}
          {schedulingFormErrors.sessions.map((error, index) => (
            <p key={index} className="text-red-500 text-sm text-center">
              {error}
            </p>
          ))}
          <ul
            className={`flex flex-col gap-3 rounded-t-lg pr-2 pt-1 ${sessions.length >= 4 && "h-68 overflow-y-scroll"}`}
          >
            {sessions.map((session, index) => (
              <li key={index}>
                <article className="flex justify-between items-center gap-3 font-open-sans bg-[#FBA731] py-3 px-3 rounded-lg">
                  <header className="flex items-center gap-3 ">
                    <span className="w-8 h-8 bg-[#FFEDD4] text-[#2D2D2D] text-lg flex flex-row justify-center items-center rounded-[50%]">
                      {session.sessionNumber}
                    </span>

                    <div className="flex flex-col">
                      <time
                        dateTime={session.fullDate}
                        className="text-sm text-white font-semibold"
                      >
                        {session.fullDate}
                      </time>

                      <span className="text-xs text-white">
                        {session.weekDay}
                      </span>
                    </div>
                  </header>

                  <button
                    type="button"
                    onClick={() => handleDeleteSession(index)}
                    className="cursor-pointer hover:opacity-80 active:opacity-60 text-white"
                  >
                    <Trash />
                  </button>
                </article>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={handleAddSessions}
            className="hover:text-[#F59E0B] active:text-[#D97706] hover:bg-[#FFF3E0] active:bg-[#FFE0B2]  text-center text-[#FFA726] text-xl align-middle border-2 border-solid border-[#FFA726]/30 py-3 rounded-md cursor-pointer"
          >
            Gerar sessões
          </button>
        </>
      )}

      {serviceType === "sessoes" && (
        <div className="flex flex-col w-full gap-4">
          <Calendar
            onChange={(date) => handleDateChange(date as Date)}
            value={schedulingForm.singleSession?.fullDate ?? null}
            locale="pt-BR"
            tileClassName={({ date }) => {
              const { fullDate } = schedulingForm.singleSession ?? {
                fullDate: null,
              }
              const base = "rounded-full transition-all text-sm select-none"
              const today = new Date()

              if (
                fullDate &&
                isSameDay(startOfDay(date), startOfDay(new Date(fullDate)))
              ) {
                return `${base} selected-day`
              }

              if (isSameDay(date, today)) {
                return `${base} bg-amber-100 text-amber-600 font-medium`
              }

              return `${base} hover:bg-amber-50 hover:text-amber-800`
            }}
            className="w-full rounded-xl border border-gray-100 p-4"
          />
          {schedulingFormErrors.weekDay.length > 0 && (
            <span className="text-red-500">
              {schedulingFormErrors.weekDay[0]}
            </span>
          )}

          {schedulingForm.singleSession && (
            <div className="flex items-center justify-between px-4 py-3 bg-[#FBA731] rounded-xl border border-amber-100">
              <div>
                <p className="text-xs text-white">Dia selecionado</p>
                <p className="text-sm font-medium text-white capitalize">
                  {new Date(
                    schedulingForm.singleSession.fullDate
                  ).toLocaleDateString("pt-BR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </p>
              </div>
              <button
                onClick={handleDateClear}
                className="text-xs text-white underline cursor-pointer"
              >
                <Trash size={24} color="white" />
              </button>
            </div>
          )}
        </div>
      )}
    </>
  )
}

export default SchedulingSessions
