import {
  pagamentoConfig,
  statusConfig,
  statusPagamento,
  statusRealizacao,
} from "@/data/optionsSessionsData"
import type {
  DayOfWeek,
  ListPatient,
  Session,
  SessionChangeField,
  SessionChangeValue,
} from "@/types"
import { createTimeOptions } from "@/utils/sessions/createTimeOptions"
import { format, getDay, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Check, ChevronDown } from "lucide-react"
import { SessionOptions } from "./sessionOptions"
import EvolutionIcon from "@/components/icons/evolutionIcon"
import { useState } from "react"
import EvolutionView from "../evolution/evolutionView"
import Modal from "@/components/ui/modal"
import { EvolutionFormData, EvolutionSaveData } from "../evolution"
import EvolutionForm from "../evolution/evolutionForm"
import { cn } from "tailwind-variants"
import { useFisioStore } from "@/store/fisio/fisioStore"
import { saveSessionEvolution } from "@/services/patients/sessionEvolutionRepository"
import { toast } from "react-toastify"
import { daysOfWeek } from "@/data"

type SessionCardProps = {
  patient: ListPatient
  session: Session
  defaultTime: string
  isSelected: boolean
  isOpen: boolean
  isDeleting: boolean
  onSelect: () => void
  onToggleOpen: () => void
  onOpenDeleteModal: (sessionId: string, sessionNumber: number) => void
  onChangeSession: (
    sessionId: string,
    field: SessionChangeField,
    value: SessionChangeValue
  ) => void
}

type EvolutionMode = "view" | "create" | "edit" | null

export function SessionCard({
  patient,
  session,
  defaultTime,
  isSelected,
  isOpen,
  isDeleting,
  onSelect,
  onToggleOpen,
  onOpenDeleteModal,
  onChangeSession,
}: SessionCardProps) {
  const [evolutionMode, setEvolutionMode] = useState<EvolutionMode>(null)
  const evolution = useFisioStore(
    (state) => state.evolutions[session.id] ?? null
  )
  const saveEvolution = useFisioStore((state) => state.saveEvolution)

  const convertDate = parseISO(session.date)

  const weekDay = format(convertDate, "EEEE", { locale: ptBR })
    .replace("-feira", "")
    .replace(/^./, (letter) => letter.toUpperCase())

  const currentTime = session.time?.slice(0, 5)
  const timeOptions = createTimeOptions()
  if (currentTime && !timeOptions.includes(currentTime)) {
    timeOptions.push(currentTime)
    timeOptions.sort()
  }

  const hasCustomTime = session.time && session.time !== defaultTime
  const hasRescheduledDate =
    session.originalDate !== undefined && session.originalDate !== session.date
  const isStandaloneExtra =
    patient.typeService === "Pacote" && Boolean(session.isExtra)
  const nextPendingAvulsaSession =
    patient.typeService === "Sessão avulsa"
      ? patient.session
          .filter(
            (item) => item.finish === "pendente" && item.number > session.number
          )
          .sort((a, b) => a.number - b.number)[0]
      : undefined
  const nextWeekdayNumber = nextPendingAvulsaSession
    ? getDay(parseISO(nextPendingAvulsaSession.date))
    : 0
  const nextSessionWeekDay: DayOfWeek | undefined =
    nextWeekdayNumber > 0 ? daysOfWeek[nextWeekdayNumber - 1] : undefined

  function handleOpenEvolution() {
    if (evolution) {
      setEvolutionMode("view")
      return
    }

    if (session.finish !== "realizado") {
      toast.error(
        "Só é possível registrar uma evolução depois que a sessão for realizada."
      )
      return
    }

    setEvolutionMode("create")
  }

  function normalizeEvolutionForForm(
    data: EvolutionSaveData
  ): EvolutionFormData {
    return {
      goals: data.goals ?? [""],
      exercises: data.exercises ?? [],
      vitalSigns: {
        bloodPressure: "",
        heartRate: "",
        respiratoryRate: "",
        oxygenSaturation: "",
        observations: "",
        ...data.vitalSigns,
      },
      conducts: data.conducts ?? [""],
      orientations: data.orientations ?? [""],
      complications: data.complications ?? "",
      progress: data.progress ?? "",
      painBefore: data.painBefore ?? null,
      painAfter: data.painAfter ?? null,
      nextConducts: data.nextConducts ?? [""],
    }
  }
  return (
    <>
      <li
        className={`
        w-full rounded-2xl border border-[#EAECF0] bg-[#FCFCFD] px-4 py-3
        transition-all duration-300 ease-in-out
        hover:border-[#D0D5DD] hover:shadow-sm
        ${
          isDeleting
            ? "translate-x-40 scale-95 opacity-0"
            : "translate-x-0 scale-100 opacity-100"
        }
        ${isOpen ? "lg:col-span-2" : ""}
      `}
      >
        <article className="flex min-w-0 items-start gap-2 sm:gap-3">
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex min-w-0 flex-col gap-3 pb-2 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                  <div className="flex shrink-0 items-center gap-2">
                    <label className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md border border-[#D0D5DD] bg-white">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={onSelect}
                        className="peer hidden"
                      />

                      <Check
                        className="hidden peer-checked:flex"
                        color="red"
                        size={20}
                      />
                    </label>

                    {!isStandaloneExtra &&
                      (() => {
                        const status = statusRealizacao[session.finish]

                        return (
                          <span
                            className={cn(
                              "flex h-9 w-9 items-center justify-center rounded-full text-lg font-medium",
                              status.className
                            )}
                          >
                            {session.number}
                          </span>
                        )
                      })()}
                  </div>

                  <div className="min-w-0 flex-1 leading-tight">
                    <time
                      dateTime={session.date}
                      className="block text-sm font-semibold text-slate-700"
                    >
                      {format(convertDate, "dd/MM/yyyy")}
                    </time>

                    <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                      <span className="text-slate-500">{weekDay}</span>

                      {isStandaloneExtra && (
                        <span className="rounded-full bg-violet-50 px-2 py-0.5 font-medium text-violet-700">
                          Avulsa extra · fora do pacote
                        </span>
                      )}

                      {hasRescheduledDate && (
                        <span className="rounded-full bg-amber-50 px-2 py-0.5 font-medium text-[#F79009]">
                          Data remarcada
                        </span>
                      )}

                      {hasCustomTime && (
                        <span className="rounded-full bg-amber-50 px-2 py-0.5 font-medium text-[#F79009]">
                          {session.time}
                        </span>
                      )}
                    </div>
                  </div>
              </div>

              <div className="hidden shrink-0 items-center justify-end gap-3 text-sm lg:flex">
                <div className="flex flex-col items-start font-medium">
                  <span className="px-3 py-2 text-xs text-slate-600 uppercase">
                    Realização
                  </span>

                  {(() => {
                    const status = statusRealizacao[session.finish]

                    return (
                      <span
                        className={`rounded-full border px-3 py-1 text-sm capitalize ${status.className}`}
                      >
                        {session.finish}
                      </span>
                    )
                  })()}
                </div>

                <div className="flex flex-col items-start">
                  <span className="px-3 py-2 text-xs text-slate-600 uppercase">
                    Pagamento
                  </span>

                  {(() => {
                    const pay = statusPagamento[session.paid]

                    return (
                      <button
                        type="button"
                        className={`rounded-full border px-3 py-1 text-sm font-medium ${pay.className}`}
                      >
                        {pay.label}
                      </button>
                    )
                  })()}
                </div>

                <EvolutionIcon
                  hasEvolution={Boolean(evolution)}
                  onclick={handleOpenEvolution}
                />
              </div>
            </div>

            <div className="mb-2 flex flex-wrap items-center gap-2 lg:hidden">
              <span
                className={`rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${statusRealizacao[session.finish].className}`}
              >
                {session.finish}
              </span>
              <span
                className={`rounded-full border px-2.5 py-1 text-xs font-medium ${statusPagamento[session.paid].className}`}
              >
                {statusPagamento[session.paid].label}
              </span>
              <EvolutionIcon
                hasEvolution={Boolean(evolution)}
                onclick={handleOpenEvolution}
              />
            </div>

            {isOpen && (
              <SessionOptions
                session={session}
                defaultTime={defaultTime}
                timeOptions={timeOptions}
                nextSessionWeekDay={
                  patient.typeService === "Sessão avulsa"
                    ? nextSessionWeekDay
                    : undefined
                }
                statusConfig={statusConfig}
                pagamentoConfig={pagamentoConfig}
                onChangeSession={onChangeSession}
                onOpenDeleteModal={onOpenDeleteModal}
              />
            )}
          </div>

          <button
            type="button"
            onClick={onToggleOpen}
            className="ml-4 flex cursor-pointer items-center justify-center self-center outline-none"
            aria-expanded={isOpen}
            aria-label={
              isOpen ? "Fechar opções da sessão" : "Abrir opções da sessão"
            }
          >
            <ChevronDown
              size={20}
              className={`transition-transform duration-300 ${
                isOpen
                  ? "rotate-180 text-[#FFA726]"
                  : "text-slate-400 hover:text-[#FFA726]"
              }`}
            />
          </button>
        </article>
      </li>

      <Modal
        isOpen={evolutionMode !== null}
        onClose={() => setEvolutionMode(null)}
      >
        {evolutionMode === "view" && evolution && (
          <EvolutionView
            evolution={normalizeEvolutionForForm(evolution)}
            patient={patient}
            session={session}
            defaultTime={defaultTime}
            onEdit={() => setEvolutionMode("edit")}
          />
        )}

        {(evolutionMode === "create" || evolutionMode === "edit") && (
          <EvolutionForm
            mode={evolutionMode}
            patient={patient}
            session={session}
            defaultTime={defaultTime}
            initialData={
              evolutionMode === "edit" && evolution
                ? normalizeEvolutionForForm(evolution)
                : undefined
            }
            onCancel={() => {
              if (evolution) {
                setEvolutionMode("view")
                return
              }

              setEvolutionMode(null)
            }}
            onUnchanged={() => {
              setEvolutionMode("view")
              toast.info("Não houve alterações para salvar.")
            }}
            onSave={async (data) => {
              try {
                await saveSessionEvolution(session.id, data)
                saveEvolution(session.id, data)
                setEvolutionMode("view")
                toast.success("Evolução salva no servidor.")
              } catch (error) {
                toast.error(
                  error instanceof Error
                    ? `Não foi possível salvar a evolução: ${error.message}`
                    : "Não foi possível salvar a evolução."
                )
              }
            }}
          />
        )}
      </Modal>
    </>
  )
}
