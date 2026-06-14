import type { ListPatient } from "@/types"
import { CalendarCheck } from "lucide-react"

type SeparateSessionInfoCardProps = {
  patient: Extract<ListPatient, { typeService: "Sessão avulsa" }>
}

export function SeparateSessionInfoCard({
  patient,
}: SeparateSessionInfoCardProps) {
  const sessionsDone = patient.session.filter(
    (session) => session.finish
  ).length

  const sessionsScheduled = patient.session.filter(
    (session) => !session.finish
  ).length

  return (
    <section className="mb-6 rounded-2xl border border-[#EAECF0] bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-green-600">
            <CalendarCheck size={26} />
          </div>

          <div>
            <p className="text-sm font-semibold text-[#344054]">
              Atendimento avulso
            </p>
            <p className="text-xs text-[#667085]">Resumo das sessões</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 md:flex md:items-center md:gap-8">
          <div>
            <p className="text-xs font-medium text-[#667085]">Realizadas</p>
            <strong className="text-lg font-bold text-[#101828]">
              {sessionsDone}
            </strong>
          </div>

          <div>
            <p className="text-xs font-medium text-[#667085]">Pendentes</p>
            <strong className="text-lg font-bold text-[#101828]">
              {sessionsScheduled}
            </strong>
          </div>

          <div>
            <p className="text-xs font-medium text-[#667085]">Valor</p>
            <strong className="text-lg font-bold text-[#101828]">
              {patient.separateSessionInfo.priceSession.toLocaleString(
                "pt-BR",
                {
                  style: "currency",
                  currency: "BRL",
                }
              )}
            </strong>
          </div>
        </div>
      </div>
    </section>
  )
}
