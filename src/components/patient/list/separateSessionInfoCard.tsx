import type { ListPatient } from "@/types"

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
    <section className="grid grid-cols-1 gap-4 pb-3 md:grid-cols-3">
      <article className="flex flex-col items-center justify-center gap-2 rounded-md bg-white py-6">
        <h3 className="text-lg text-[#64748B] md:text-xl">Sessões feitas</h3>

        <p className="text-lg font-medium text-[#1A1A1A] md:text-xl">
          {sessionsDone}
        </p>
      </article>

      <article className="flex flex-col items-center justify-center gap-2 rounded-md bg-white py-6">
        <h3 className="text-lg text-[#64748B] md:text-xl">Sessões agendadas</h3>

        <p className="text-lg font-medium text-[#1A1A1A] md:text-xl">
          {sessionsScheduled}
        </p>
      </article>

      <article className="flex flex-col items-center justify-center gap-2 rounded-md bg-white py-6">
        <h3 className="text-lg text-[#64748B] md:text-xl">Preço da sessão</h3>

        <p className="text-lg font-medium text-[#1A1A1A] md:text-xl">
          {patient.separateSessionInfo.priceSession.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
        </p>
      </article>
    </section>
  )
}
