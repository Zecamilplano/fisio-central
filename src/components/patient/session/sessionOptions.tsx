import { format } from "date-fns"
import { Trash2 } from "lucide-react"
import { DatePicker } from "@/components/ui/datePicker"
import {
  PagamentoConfig,
  StatusConfig,
  StatusSessaoKey,
} from "@/data/optionsSessionsData"
import { PaidKey, Session } from "@/types"

type SessionFieldValue = {
  finish: StatusSessaoKey
  paid: PaidKey
  date: string
  time: string
}

type SessionOptionsProps = {
  session: Session
  convertDate: Date | undefined
  defaultTime: string
  timeOptions: string[]

  statusConfig: Record<StatusSessaoKey, StatusConfig>
  pagamentoConfig: Record<PaidKey, PagamentoConfig>
  onChangeSession: <K extends keyof SessionFieldValue>(
    sessionId: string,
    field: K,
    value: SessionFieldValue[K]
  ) => void
  onOpenDeleteModal: (sessionId: string, sessionNumber: number) => void
}

export function SessionOptions({
  session,
  convertDate,
  defaultTime,
  timeOptions,
  statusConfig,
  pagamentoConfig,
  onChangeSession,
  onOpenDeleteModal,
}: SessionOptionsProps) {
  return (
    <div className="w-full overflow-hidden pt-3 transition-all duration-300 ease-in-out">
      <div className="h-px w-full bg-linear-to-r from-transparent via-[#E4E7EC] to-transparent" />

      <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-1 gap-3 flex-wrap">
          <section className="rounded-md border border-[#EAECF0] bg-white p-3">
            <h4 className="mb-2 text-xs font-semibold tracking-wide text-[#667085] uppercase">
              Realização
            </h4>

            <div className="min-w-55 max-w-70 flex-1 flex flex-col gap-1">
              {Object.values(statusConfig).map((status) => {
                const isActive = session.finish === status.value

                return (
                  <button
                    key={status.label}
                    type="button"
                    onClick={() =>
                      onChangeSession(session.id, "finish", status.value)
                    }
                    className={`flex items-center gap-2 rounded-full px-4 py-1 text-sm font-medium ${
                      isActive ? status.button.active : status.button.inactive
                    }`}
                  >
                    {status.label}
                  </button>
                )
              })}
            </div>
          </section>

          <section className="rounded-md border border-[#EAECF0] bg-white p-3">
            <h4 className="mb-2 text-xs font-semibold tracking-wide text-[#667085] uppercase">
              Pagamento
            </h4>

            <div className="min-w-55 max-w-70 flex-1 flex flex-col gap-1">
              {Object.values(pagamentoConfig).map((pay: any) => {
                const isActive = session.paid === pay.value

                return (
                  <button
                    key={pay.label}
                    type="button"
                    onClick={() =>
                      onChangeSession(session.id, "paid", pay.value)
                    }
                    className={`flex w-28 items-center gap-2 rounded-full px-4 py-1 text-sm font-medium ${
                      isActive ? pay.button.active : pay.button.inactive
                    }`}
                  >
                    {pay.label}
                  </button>
                )
              })}
            </div>
          </section>

          <section className=" flex h-full flex-col rounded-md border border-[#EAECF0] bg-white p-3">
            <h4 className="mb-2 text-xs font-semibold tracking-wide text-[#667085] uppercase">
              Horário
            </h4>

            <div className="min-w-55 flex flex-col gap-2">
              <DatePicker
                date={convertDate || new Date()}
                setDate={(value) => {
                  onChangeSession(
                    session.id,
                    "date",
                    format(value, "yyyy-MM-dd")
                  )
                }}
              />
              <select
                value={session.time ?? defaultTime}
                onChange={(e) =>
                  onChangeSession(session.id, "time", e.target.value)
                }
                className="w-34 rounded-lg border border-[#D0D5DD] bg-white px-3 py-2 text-sm text-[#344054] outline-none"
              >
                {timeOptions.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
          </section>
        </div>

        <button
          type="button"
          onClick={() => onOpenDeleteModal(session.id, session.number)}
          className="flex h-10.5 items-center justify-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600"
        >
          <Trash2 className="h-4 w-4" />
          Excluir
        </button>
      </div>
    </div>
  )
}
