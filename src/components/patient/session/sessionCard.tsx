import { DatePicker } from "@/components/ui/dataPicker"
import {
  pagamentoConfig,
  statusConfig,
  statusPagamento,
  statusRealizacao,
} from "@/data/optionsSessionsData"
import type { Session } from "@/types"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Check, ChevronDown, Trash2 } from "lucide-react"

type SessionCardProps = {
  session: Session
  isSelected: boolean
  isOpen: boolean
  isDeleting: boolean
  onSelect: () => void
  onToggleOpen: () => void
  onOpenDeleteModal: (sessionId: string, sessionNumber: number) => void
  onChangeSession: (
    sessionId: string,
    field: "finish" | "paid" | "date",
    value: boolean | string
  ) => void
}

export function SessionCard({
  session,
  isSelected,
  isOpen,
  isDeleting,
  onSelect,
  onToggleOpen,
  onOpenDeleteModal,
  onChangeSession,
}: SessionCardProps) {
  const convertDate = parseISO(session.date)

  const weekDay = format(convertDate, "EEEE", { locale: ptBR })
    .replace("-feira", "")
    .replace(/^./, (letter) => letter.toUpperCase())

  return (
    <li
      className={`
        w-full rounded-2xl border border-[#EAECF0] bg-[#FCFCFD] px-4 py-3
        transition-all duration-300 ease-in-out hover:border-[#D0D5DD] hover:shadow-sm
        ${isDeleting ? "translate-x-40 scale-95 opacity-0" : "translate-x-0 scale-100 opacity-100"}
        ${isOpen ? "col-span-2" : ""}
      `}
    >
      <article className="flex items-center justify-between">
        <div className="flex w-full flex-col">
          <div className="flex w-full flex-wrap justify-between md:flex-nowrap">
            <div className="flex w-full flex-col gap-3 pb-2 md:flex-row md:items-center">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
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

                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-lg font-medium ${
                      session.finish
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-[#FEF3C7] text-[#D97706]"
                    }`}
                  >
                    {session.number}
                  </span>
                </div>

                <div className="flex flex-col leading-tight">
                  <time
                    dateTime={session.date}
                    className="text-sm font-medium text-slate-600"
                  >
                    {format(convertDate, "dd/MM/yyyy")}
                  </time>

                  <span className="rounded-full text-xs text-slate-400">
                    {weekDay}
                  </span>
                </div>
              </div>
            </div>

            <div className="hidden w-full justify-between gap-3 text-sm md:flex md:justify-end">
              <div className="flex flex-col font-medium">
                <span className="px-3 py-2 text-xs text-slate-600 uppercase">
                  Realização
                </span>

                {(() => {
                  const status =
                    statusRealizacao[session.finish ? "realizado" : "pendente"]

                  return (
                    <span
                      className={`rounded-full border px-3 py-1 text-sm ${status.className}`}
                    >
                      {session.finish ? "Realizado" : "Pendente"}
                    </span>
                  )
                })()}
              </div>

              <div className="hidden flex-col md:flex">
                <span className="px-3 py-2 text-xs text-slate-600 uppercase">
                  Pagamento
                </span>

                {(() => {
                  const pay = statusPagamento[session.paid]

                  return (
                    <button
                      className={`rounded-full border px-3 py-1 text-sm font-medium ${pay.className}`}
                    >
                      {pay.label}
                    </button>
                  )
                })()}
              </div>
            </div>
          </div>

          {isOpen && (
            <div className="w-full overflow-hidden pt-3 transition-all duration-300 ease-in-out">
              <div className="h-px w-full bg-linear-to-r from-transparent via-[#E4E7EC] to-transparent" />

              <div className="mt-2 flex w-full items-center justify-between gap-3 lg:flex-row">
                <div className="flex w-auto flex-col gap-2 md:flex-row md:flex-wrap">
                  <div className="flex w-full flex-wrap gap-1 rounded-md border border-solid border-[#EAECF0] bg-white px-2 py-2 md:w-auto">
                    {Object.values(statusConfig).map((status) => {
                      const Icon = status.Icon
                      const isActive = session.finish === status.value

                      return (
                        <button
                          key={status.label}
                          type="button"
                          onClick={() =>
                            onChangeSession(session.id, "finish", status.value)
                          }
                          className={`flex flex-1 items-center gap-2 rounded-full px-4 py-1 text-sm font-medium outline-none md:w-auto md:flex-none ${
                            isActive
                              ? status.button.active
                              : status.button.inactive
                          }`}
                        >
                          <Icon size={16} />
                          {status.label}
                        </button>
                      )
                    })}
                  </div>

                  <div className="flex w-full flex-wrap rounded-md border border-solid border-[#D9D9D9] px-2 py-2 sm:w-auto">
                    {Object.values(pagamentoConfig).map((pay) => {
                      const isActive = session.paid === pay.value

                      return (
                        <button
                          key={pay.label}
                          type="button"
                          onClick={() =>
                            onChangeSession(session.id, "paid", pay.value)
                          }
                          className={`flex items-center gap-2 rounded-full px-4 py-1 text-sm font-medium outline-none ${
                            isActive ? pay.button.active : pay.button.inactive
                          }`}
                        >
                          {pay.label}
                        </button>
                      )
                    })}
                  </div>

                  <DatePicker
                    date={convertDate}
                    setDate={(value) => {
                      if (value instanceof Date) {
                        onChangeSession(
                          session.id,
                          "date",
                          format(value, "yyyy-MM-dd")
                        )
                      }
                    }}
                  />
                </div>

                <button
                  onClick={() => onOpenDeleteModal(session.id, session.number)}
                  className="flex h-10.5 w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 md:w-auto"
                >
                  <Trash2 className="h-4 w-4" />
                  Excluir
                </button>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={onToggleOpen}
          className="ml-4 flex cursor-pointer items-center justify-center self-center outline-none"
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
  )
}
