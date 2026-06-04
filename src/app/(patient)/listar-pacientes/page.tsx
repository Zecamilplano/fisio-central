"use client"
import "../../../styles/modal.css"
import { DatePicker } from "@/components/dataPicker"
import { listPatientData } from "@/data"
import {
  sessionActions,
  paymentActions,
  pagamentoConfig,
  statusConfig,
  statusPagamento,
  statusRealizacao,
} from "@/data/optionsSessionsData"
import type { ListPatient, PaidKey } from "@/types/"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  CalendarDays,
  Check,
  ChevronDown,
  PencilLine,
  Search,
  Trash2,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"

const ignoredWords = ["da", "de", "do", "dos", "das"]

export type Session = {
  id: string
  number: number
  date: string
  finish: boolean
  paid: PaidKey
}

function ListPatient() {
  const [listPatient, setListPatient] = useState<ListPatient[]>(listPatientData)

  const [selectedPatient, setSelectedPatient] = useState<ListPatient | null>(
    null
  )
  const [openSessionId, setOpenSessionId] = useState<string | null>(null)
  const [selectedAction, setSelectedAction] = useState(null)

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean
    sessionId: string | null
    sessionNumber: number | null
  }>({
    isOpen: false,
    sessionId: null,
    sessionNumber: null,
  })
  const [createReplacementSession, setCreateReplacementSession] =
    useState(false)

  function handleChange<K extends keyof ListPatient["session"][number]>(
    sessionId: string,
    field: K | "delete",
    value?: boolean | string
  ) {
    setListPatient((prev) => {
      return prev.map((patient) => {
        if (patient.id !== selectedPatient?.id) {
          return patient
        }

        let updatedSessions: typeof patient.session

        if (field === "delete") {
          updatedSessions = patient.session
            .filter((session) => session.id !== sessionId)
            .map((session, index) => ({
              ...session,
              number: index + 1,
            }))
        } else {
          updatedSessions = patient.session.map((session) => {
            if (session.id !== sessionId) {
              return session
            }
            return {
              ...session,
              [field]: value,
            }
          })
        }

        const updatedPatient = {
          ...patient,
          session: updatedSessions,
        }

        setSelectedPatient(updatedPatient)
        return updatedPatient
      })
    })
  }

  function openDeleteModal(sessionId: string, sessionNumber: number) {
    const session = selectedPatient?.session.find(
      (item) => item.id === sessionId
    )

    if (session?.finish) {
      toast.error("Não é possível excluir uma sessão realizada.")
      return
    }

    setDeleteModal({
      isOpen: true,
      sessionId,
      sessionNumber,
    })
  }

  function closeDeleteModal() {
    setCreateReplacementSession(false)

    setDeleteModal({
      isOpen: false,
      sessionId: null,
      sessionNumber: null,
    })
  }

  function confirmDelete() {
    const session = selectedPatient?.session.find(
      (item) => item.id === deleteModal.sessionId
    )

    if (session?.finish) {
      toast.error("Não é possível excluir uma sessão realizada.")
      closeDeleteModal()
      return
    }

    if (deleteModal.sessionId) {
      if (!session?.date) return

      toast.success(
        `Sessão #${session?.number} de ${format(
          parseISO(session.date),
          "dd/MM/yyyy"
        )} excluída com sucesso.`
      )
      handleChange(deleteModal.sessionId, "delete")
      closeDeleteModal()
    }
  }

  function getNextSessionDate(lastDate: Date, daysOfWeek: number[]): Date {
    const nextDate = new Date(lastDate)

    while (true) {
      nextDate.setDate(nextDate.getDate() + 1)

      const day = nextDate.getDate()

      if (daysOfWeek.includes(day)) {
        return nextDate
      }
    }
  }

  function generateReplacementSession(patient: ListPatient): Session | null {
    const session = patient.session

    const lastSession = session.at(-1)

    if (!lastSession) return null

    const nextDate = getNextSessionDate(
      parseISO(lastSession.date),
      patient.daysOfWeek
    )

    return {
      id: crypto.randomUUID(),
      number: session.length + 1,
      date: format(nextDate, "yyyy-MM-dd"),
      finish: false,
      paid: "pendente",
    }
  }

  function addReplacementSession(patientId: number) {
    setListPatient((prev) =>
      prev.map((patient) => {
        if (patient.id !== patientId) {
          return patient
        }

        const newSession = generateReplacementSession(patient)

        if (!newSession) {
          return patient
        }

        const updatedPatient = {
          ...patient,
          session: [...patient.session, newSession],
        }

        if (selectedPatient?.id === patient.id) {
          setSelectedPatient(updatedPatient)
        }

        return updatedPatient
      })
    )
  }

  useEffect(() => {
    function handleEsc(event: KeyboardEvent) {
      if (event.key === "Escape" && deleteModal.isOpen) {
        closeDeleteModal()
      }
    }

    window.addEventListener("keydown", handleEsc)

    return () => {
      window.removeEventListener("keydown", handleEsc)
    }
  }, [deleteModal.isOpen])

  // console.log(listPatient.map((item) => item.contactInfo))

  return (
    <section className="font-open-sans">
      {/*Barra de pesquisa | botão adicionar paciente*/}
      <header className="flex flex-col justify-between gap-4 px-2 py-6 lg:flex-row">
        <form
          role="search"
          className="flex h-14 w-full items-center justify-between rounded-4xl bg-white px-4 py-2 lg:w-1/3"
        >
          <input
            type="search"
            placeholder="Procurar por pacientes"
            className="w-full text-base outline-none placeholder:text-[#9CA3AF] md:text-xl"
          />

          <Search size={28} color="#9CA3AF" className="shrink-0" />
        </form>

        <Link
          href="/cadastrar-paciente"
          className="flex w-full items-center justify-center rounded-4xl bg-[#FFA726] px-2 py-3 text-lg text-white md:text-2xl lg:w-75 lg:rounded-md"
        >
          Adicionar paciente
        </Link>
      </header>

      <div className="flex flex-col lg:flex-row h-auto md:h-106.75 px-2 pb-2">
        <div className="flex flex-col lg:flex-row">
          {/*Barra de pacientes*/}
          <aside className=" flex max-h-96 w-90 shrink-0 overflow-x-hidden overflow-y-auto rounded-l-md bg-white lg:ml-2 lg:max-h-255 lg:w-80 lg:rounded-l-md">
            <ol className="w-full">
              {listPatient.map((value, index) => {
                const initialLetters = value.name
                  .split(" ")
                  .filter((word) => !ignoredWords.includes(word.toLowerCase()))
                  .slice(0, 2)
                  .map((data) => data[0].toUpperCase())
                  .join("")

                return (
                  <li key={index} className="font-open-sans w-full">
                    <div className="h-2 w-full bg-[#E0E0E0]" />

                    <button
                      onClick={() => setSelectedPatient(value)}
                      className={`flex w-full items-center gap-3 p-3 transition-all duration-200 hover:bg-[#F5F7FA] ${
                        selectedPatient?.id === value.id
                          ? "bg-[#E8F0FF]"
                          : "bg-white"
                      } `}
                    >
                      <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FFA726]">
                        {value.image === null ? (
                          <Image
                            src={value.image || "/person.png"}
                            fill
                            alt={`Foto de perfil de ${value.name}`}
                            className="rounded-full object-cover"
                          />
                        ) : (
                          <p className="text-sm font-semibold text-white uppercase">
                            {initialLetters}
                          </p>
                        )}
                      </div>

                      <span className="text-left text-sm wrap-break-words text-[#1B4332] md:text-base">
                        {value.name}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ol>
          </aside>

          <hr className="hidden h-auto w-px border-none bg-[#D9D9D9] lg:block" />
        </div>

        {/*Tela sem informação do paciente*/}
        {selectedPatient === null && (
          <section className="flex w-full flex-col items-center justify-center rounded-md bg-white p-6 text-center text-base md:text-lg md:rounded-r-md md:rounded-l-none lg:mr-2  ">
            <p className="text-[#485368]">
              Selecione um paciente para visualizar mais informações do paciente
              <br />
              ou
            </p>

            <Link href="/cadastrar-paciente" className="text-[#2563EB]">
              Adicione um novo paciente
            </Link>
          </section>
        )}

        {/*Detalhes do paciente*/}
        {selectedPatient !== null && (
          <section className="font-open-sans flex w-full flex-col gap-6 overflow-y-hidden rounded-md bg-[#F4F6F5]   md:rounded-l-none md:rounded-r-md  ">
            <div className="overflow-y-auto h-full py-4 px-3">
              <header className="flex flex-col justify-between gap-4 pb-5 md:flex-row md:items-center">
                <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                  <Image
                    src={selectedPatient.image ?? "/person.png"}
                    width={110}
                    height={110}
                    alt="Foto de perfil"
                    className="rounded-full"
                  />

                  <div className="text-center sm:text-left">
                    <h2 className="text-xl text-[#2D3748] md:text-2xl">
                      {selectedPatient.name}
                    </h2>

                    <p className="mt-2 rounded-4xl bg-[#FFA726]/20 px-5 py-2 text-center text-[#FFA726]">
                      {selectedPatient.typeService}
                    </p>
                  </div>
                </div>

                <button className="self-end md:self-auto">
                  <PencilLine size={28} color="#737373" />
                </button>
              </header>

              {/*Contato*/}
              <section className="grid w-full grid-cols-1 gap-4 pb-6 sm:grid-cols-2 xl:grid-cols-3">
                {Object.values(selectedPatient.contactInfo).map(
                  (info, index) => {
                    const Icon = info.Icon

                    return (
                      <article
                        key={index}
                        className="flex flex-col items-center justify-center gap-2 rounded-md bg-white py-4"
                      >
                        <Icon color="#FFA726" size={32} />

                        <h3 className="text-base text-[#64748B] capitalize">
                          {info.label}
                        </h3>

                        <p className="px-3 text-center text-base font-medium wrap-break-words text-[#1A1A1A]">
                          {info.value}
                        </p>
                      </article>
                    )
                  }
                )}
              </section>

              {/*Informação da sessão*/}
              <section className="pb-3">
                <header className="flex items-center gap-2 px-2">
                  <CalendarDays color="#FFA726" size={24} />

                  <h3 className="text-xl text-[#2D3748] md:text-2xl">
                    Informações das sessões
                  </h3>
                </header>

                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                  {Object.entries(selectedPatient.sessionPackageInfo ?? {}).map(
                    ([key, info], index) => {
                      return (
                        <article
                          key={index}
                          className="flex flex-col items-center justify-center gap-2 rounded-md bg-white py-6"
                        >
                          <h3 className="text-lg text-[#64748B] md:text-xl">
                            {info.label}
                          </h3>

                          <p className="text-lg font-medium text-[#1A1A1A] md:text-xl">
                            {key === "preco_sessao"
                              ? info.value.toLocaleString("pt-BR", {
                                  style: "currency",
                                  currency: "BRL",
                                })
                              : info.value}
                          </p>
                        </article>
                      )
                    }
                  )}
                  {Object.entries(
                    selectedPatient.separateSessionInfo ?? {}
                  ).map(([key, info], index) => {
                    return (
                      <article
                        key={index}
                        className="flex flex-col items-center justify-center gap-2 rounded-md bg-white py-6"
                      >
                        <h3 className="text-lg text-[#64748B] md:text-xl">
                          {info.label}
                        </h3>

                        <p className="text-lg font-medium text-[#1A1A1A] md:text-xl">
                          {key === "preco_sessao"
                            ? info.value.toLocaleString("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              })
                            : info.value}
                        </p>
                      </article>
                    )
                  })}
                </div>
              </section>

              {/*Sessões*/}
              <section className="rounded-md bg-white px-2 py-3">
                <header className="flex flex-col justify-between gap-3 md:flex-row md:items-center border-b border-[#ECEFF3] pb-3">
                  <div className="flex items-center gap-2">
                    <CalendarDays color="#FFA726" size={24} />

                    <h4 className="text-xl font-semibold text-[#344054] md:text-2xl">
                      Agenda de sessões
                    </h4>
                  </div>

                  <p className="text-sm font-medium text-slate-500 md:text-base">
                    Início: 12/02/2025
                  </p>
                </header>

                {/*caixa de seleção*/}
                <section aria-labelledby="selected-sessions">
                  <h2
                    id="selected-sessions"
                    className="mb-4 text-sm font-semibold text-gray-900"
                  >
                    1 selecionada
                  </h2>

                  <div className="space-y-4">
                    {/* Status da Sessão */}
                    <section aria-labelledby="session-status">
                      <h3
                        id="session-status"
                        className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500"
                      >
                        Status da Sessão
                      </h3>

                      <ul className="flex flex-wrap gap-2 w-auto">
                        {sessionActions.map((action) => (
                          <li key={action.id}>
                            <button
                              type="button"
                              className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${action.inactive}`}
                            >
                              {action.label}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </section>

                    {/* Status do Pagamento */}
                    <section aria-labelledby="payment-status">
                      <h3
                        id="payment-status"
                        className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500"
                      >
                        Status do Pagamento
                      </h3>

                      <ul className="flex flex-wrap gap-2">
                        {paymentActions.map((action) => (
                          <li key={action.id}>
                            <button
                              type="button"
                              className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${action.inactive}`}
                            >
                              {action.label}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </section>
                  </div>
                </section>
                {/*caixa de seleção*/}

                {/* Modal de Confirmação de Delete */}
                {deleteModal.isOpen && (
                  <div
                    onClick={closeDeleteModal}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm animate-fade-in"
                  >
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-sm mx-4 animate-scale-in"
                    >
                      {/* Header */}
                      <div className="flex items-start gap-3 mb-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100">
                          <Trash2 className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div className="flex-1">
                          <h2 className="text-lg font-semibold text-slate-900">
                            Excluir sessão?
                          </h2>
                          <p className="text-sm text-slate-500 mt-1">
                            Tem certeza que deseja excluir a sessão{" "}
                            <span className="font-medium">
                              #{deleteModal.sessionNumber}
                            </span>
                            ?
                          </p>
                        </div>
                      </div>

                      {/* Warning Message */}
                      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-6">
                        <p className="text-sm text-emerald-700">
                          ⚠️ Esta ação não pode ser desfeita. A sessão será
                          removida permanentemente.
                        </p>
                      </div>

                      {/* Replacement Session */}
                      <fieldset className="mb-6">
                        <legend className="sr-only">
                          Opções ao excluir a sessão
                        </legend>

                        <label
                          htmlFor="replacement-session"
                          className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-3 transition-colors hover:bg-slate-50"
                        >
                          <input
                            id="replacement-session"
                            type="checkbox"
                            checked={createReplacementSession}
                            onChange={(e) =>
                              setCreateReplacementSession(e.target.checked)
                            }
                            className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                          />

                          <div>
                            <span className="block text-sm font-medium text-slate-800">
                              Adicionar nova sessão ao final da agenda
                            </span>

                            <p className="mt-1 text-xs text-slate-500">
                              Uma nova sessão será criada automaticamente na
                              próxima data disponível, respeitando os dias de
                              atendimento configurados para este paciente.
                            </p>
                          </div>
                        </label>
                      </fieldset>
                      {/* Footer Actions */}
                      <div className="flex gap-3">
                        <button
                          onClick={closeDeleteModal}
                          className="flex-1 px-4 py-2 rounded-full font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all outline-none"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={confirmDelete}
                          className="flex-1 px-4 py-2.5 rounded-full font-medium text-emerald-700 bg-emerald-100 hover:bg-emerald-200 transition-all outline-none flex items-center justify-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Excluir
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                {/* Modal de Confirmação de Delete */}

                <ol className="flex flex-col gap-2 pt-4 md:flex-row md:flex-wrap">
                  {selectedPatient.session.map((item, index) => {
                    const convertDate = parseISO(item.date)

                    const weekDay = format(convertDate, "EEEE", {
                      locale: ptBR,
                    })
                      .replace("-feira", "")
                      .replace(/^./, (letter) => letter.toUpperCase())

                    return (
                      <>
                        <li
                          key={index}
                          className="rounded-2xl border border-[#EAECF0] bg-[#FCFCFD] px-4 py-3 transition-all duration-200 hover:border-[#D0D5DD] hover:shadow-sm"
                        >
                          <article className="flex items-center justify-between">
                            <div className="flex flex-col w-full">
                              {/* Conteúdo principal */}
                              <div className="flex justify-between w-full flex-wrap md:flex-nowrap">
                                {/*Número e data*/}
                                <div className="flex flex-col gap-3 md:flex-row md:items-center w-full pb-2">
                                  <div className="flex items-center justify-between gap-3">
                                    {/*Checkbox*/}
                                    <div className="flex items-center gap-2">
                                      <label className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md border border-[#D0D5DD] bg-white">
                                        <input
                                          type="checkbox"
                                          className="peer hidden"
                                        />

                                        <Check
                                          className="hidden peer-checked:flex"
                                          color="red"
                                          size={20}
                                        />
                                      </label>

                                      {/*Número da sessão*/}
                                      <span
                                        className={`flex h-9 w-9 items-center justify-center font-medium text-lg rounded-full
                                  ${item.finish ? "bg-emerald-100 text-emerald-700" : "bg-[#FEF3C7] text-[#D97706]"}
                                `}
                                      >
                                        {item.number}
                                      </span>
                                    </div>

                                    <div className="flex flex-col leading-tight">
                                      {/*Data*/}
                                      <time
                                        dateTime={item.date}
                                        className="text-sm font-medium text-slate-600"
                                      >
                                        {format(convertDate, "dd/MM/yyyy")}
                                      </time>
                                      {/*Dia por extenso*/}
                                      <span className="rounded-full text-xs text-slate-400">
                                        {weekDay}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/*status de realização e status de pagamento */}
                                <div className="hidden md:flex justify-between md:justify-end gap-3 text-sm w-full">
                                  {/*Status de realização*/}
                                  <div
                                    className={`
                                  flex flex-col font-medium  
                                `}
                                  >
                                    <span className="text-xs px-3 py-2 text-slate-600 uppercase">
                                      Realização
                                    </span>

                                    {(() => {
                                      const status =
                                        statusRealizacao[
                                          item.finish ? "realizado" : "pendente"
                                        ]

                                      return (
                                        <span
                                          className={`rounded-full border px-3 py-1 text-sm 
                                        ${status.className}
                                      `}
                                        >
                                          {item.finish
                                            ? "Realizado"
                                            : "Pendente"}
                                        </span>
                                      )
                                    })()}
                                  </div>

                                  {/*Status de pagamento*/}
                                  <div className="hidden md:flex flex-col">
                                    <span className="text-xs px-3 py-2 text-slate-600 uppercase">
                                      Pagamento
                                    </span>
                                    {(() => {
                                      const pay = statusPagamento[item.paid]

                                      return (
                                        <button
                                          className={`rounded-full border  px-3 py-1 text-sm font-medium ${pay.className} `}
                                        >
                                          {pay.label}
                                        </button>
                                      )
                                    })()}
                                  </div>
                                </div>
                              </div>
                              {/*Parte de cima*/}
                              {/*Parte de baixo*/}
                              {openSessionId === item.id && (
                                <div
                                  className={` overflow-hidden transition-all duration-300 ease-in-out w-full
                                  ${openSessionId === item.id ? " opacity-100 translate-y-0 pt-3" : "max-h-0 opacity-0 -translate-y-2"} 
                                `}
                                >
                                  {/*Divider*/}
                                  <div className="h-px w-full bg-linear-to-r from-transparent via-[#E4E7EC] to-transparent" />
                                  <div className="flex justify-between items-center w-full gap-3 mt-2 lg:flex-row">
                                    {/*Realizado, pendente, pago, cancelado, data*/}
                                    <div className="flex flex-col gap-2 md:flex-row md:flex-wrap w-auto bg-red-500">
                                      {/* Realizado, pendente */}
                                      <div className="flex flex-wrap gap-1 px-2 py-2 border border-solid border-[#EAECF0] bg-white rounded-md w-full md:w-auto">
                                        {Object.values(statusConfig).map(
                                          (status, key) => {
                                            const Icon = status.Icon
                                            const isActive =
                                              item.finish === status.value

                                            return (
                                              <button
                                                key={key}
                                                type="button"
                                                onClick={() =>
                                                  handleChange(
                                                    item.id,
                                                    "finish",
                                                    status.value
                                                  )
                                                }
                                                className={`flex items-center gap-2 rounded-full px-4 py-1 text-sm font-medium outline-none flex-1 md:flex-none md:w-auto
                                                ${isActive ? status.button.active : status.button.inactive}
                                              `}
                                              >
                                                <Icon size={16} />{" "}
                                                {status.label}
                                              </button>
                                            )
                                          }
                                        )}{" "}
                                      </div>{" "}
                                      {/*Pagamento*/}
                                      <div className="flex flex-wrap px-2 py-2 border border-solid border-[#D9D9D9] rounded-md w-full sm:w-auto">
                                        {Object.values(pagamentoConfig).map(
                                          (pay, key) => {
                                            const isActive =
                                              item.paid === pay.value
                                            {
                                              /* console.log(item.paid, pay.value) */
                                            }
                                            {
                                              /* console.log(pay.value) */
                                            }
                                            return (
                                              <button
                                                key={key}
                                                type="button"
                                                onClick={() =>
                                                  handleChange(
                                                    item.id,
                                                    "paid",
                                                    pay.value
                                                  )
                                                }
                                                className={`flex items-center gap-2 rounded-full px-4 py-1 text-sm font-medium outline-none 
                                                ${isActive ? pay.button.active : pay.button.inactive}
                                              `}
                                              >
                                                {pay.label}
                                              </button>
                                            )
                                          }
                                        )}
                                      </div>
                                      {/*Pagamento*/}
                                      {/* Data */}
                                      <DatePicker
                                        date={convertDate}
                                        setDate={(value) => {
                                          if (value instanceof Date) {
                                            handleChange(
                                              item.id,
                                              "date",
                                              format(value, "yyyy-MM-dd")
                                            )
                                          }
                                        }}
                                      />{" "}
                                    </div>
                                    {/* Excluir */}
                                    <button
                                      onClick={() =>
                                        openDeleteModal(item.id, item.number)
                                      }
                                      className="  flex items-center justify-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 h-10.5 text-sm font-medium text-red-600 w-full md:w-auto cursor-pointer"
                                    >
                                      <Trash2 className="h-4 w-4" /> Excluir
                                    </button>
                                  </div>
                                </div>
                              )}{" "}
                              {/*Botões de ações*/}
                            </div>
                            {/*Parte de baixo*/}

                            {/* Seta */}
                            <button
                              onClick={() => {
                                setOpenSessionId((prev) =>
                                  prev === item.id ? null : item.id
                                )
                              }}
                              className="ml-4 flex items-center justify-center self-center cursor-pointer outline-none"
                            >
                              <ChevronDown
                                size={20}
                                className={`transition-transform duration-300
                                ${
                                  openSessionId === item.id
                                    ? "rotate-180 text-[#FFA726]"
                                    : "text-slate-400 hover:text-[#FFA726]"
                                }
                              `}
                              />
                            </button>
                            {/* Seta*/}
                          </article>
                        </li>
                      </>
                    )
                  })}
                </ol>
              </section>
              {/*Sessões*/}
            </div>
          </section>
        )}
      </div>
    </section>
  )
}

export default ListPatient
