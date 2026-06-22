import type { ListPatient, Session, TreatmentPackage } from "@/types"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ChevronLeft, ChevronRight, History } from "lucide-react"
import { useEffect, useState } from "react"

type CurrentPackageCardProps = {
  patient: Extract<ListPatient, { typeService: "Pacote" }>
  currentPackageIndex: number
  setCurrentPackageIndex: React.Dispatch<React.SetStateAction<number>>
}

export function CurrentPackageCard({
  patient,
  currentPackageIndex,
  setCurrentPackageIndex,
}: CurrentPackageCardProps) {
  // const [currentPackageIndex, setCurrentPackageIndex] = useState(() => {
  //   const currentIndex = patient.packages.findIndex((item) => item.current)
  //
  //   return currentIndex >= 0 ? currentIndex : patient.packages.length - 1
  // })

  const currentPackage = patient.packages[currentPackageIndex]

  const packageSessions = patient.session.filter(
    (session) => session.packageId === currentPackage.id
  )

  const completedSessions = packageSessions.filter(
    (session) => session.finish
  ).length

  const remainingSessions = currentPackage.totalSessions - completedSessions

  const progress =
    currentPackage.totalSessions > 0
      ? Math.round((completedSessions / currentPackage.totalSessions) * 100)
      : 0

  const packageProgress = {
    completedSessions,
    progress,
  }

  const nextSession = packageSessions.find((session) => !session.finish) ?? null

  const packageEndDate =
    packageSessions.length > 0
      ? parseISO(packageSessions[packageSessions.length - 1].date)
      : currentPackage.endDate

  const isFirstPackage = currentPackageIndex === 0
  const isLastPackage = currentPackageIndex === patient.packages.length - 1

  function handlePreviousPackage() {
    setCurrentPackageIndex((prev) => Math.max(prev - 1, 0))
  }

  function handleNextPackage() {
    setCurrentPackageIndex((prev) =>
      Math.min(prev + 1, patient.packages.length - 1)
    )
  }

  useEffect(() => {
    const currentIndex = patient.packages.findIndex((item) => item.current)

    // console.log("packages:", patient.packages)
    // console.log("currentIndex:", currentIndex)

    setCurrentPackageIndex(
      currentIndex >= 0 ? currentIndex : patient.packages.length - 1
    )

    // console.log("packages mudou", patient.packages.length)
  }, [patient.packages])

  return (
    <section
      aria-labelledby="current-package-title"
      className="my-6 rounded-md bg-white p-4 px-3"
    >
      <header className="mb-5">
        <div className="mb-4 grid grid-cols-3 items-center">
          <h3
            id="current-package-title"
            className="font-semibold text-[#101828]"
          >
            Pacote atual
          </h3>

          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handlePreviousPackage}
              disabled={isFirstPackage}
              className="rounded-lg border border-[#D0D5DD] bg-white px-3 py-2 hover:bg-[#F9FAFB] opacity-40 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer "
            >
              <ChevronLeft size={18} />
            </button>

            <strong className="block text-lg text-[#101828]">
              {format(currentPackage.startDate, "dd MMM yyyy", {
                locale: ptBR,
              })}

              {currentPackage.endDate && (
                <>
                  {" - "}
                  {format(currentPackage.endDate, "dd MMM yyyy", {
                    locale: ptBR,
                  })}
                </>
              )}

              {currentPackage.current && (
                <span className="ml-1 text-emerald-600">(Atual)</span>
              )}
            </strong>

            <button
              onClick={handleNextPackage}
              disabled={isLastPackage}
              className="rounded-lg border border-[#D0D5DD] bg-white px-3 py-2 hover:bg-[#F9FAFB] disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <span className="text-right text-sm font-medium text-[#667085]">
            {packageProgress.completedSessions} / {currentPackage.totalSessions}
          </span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-[#EAECF0]">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{ width: `${packageProgress.progress}%` }}
          />
        </div>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <article className="rounded-xl bg-[#F9FAFB] p-4">
          <dl>
            <dt className="text-sm text-[#667085]">Início</dt>
            <dd className="mt-2 font-semibold text-[#101828]">
              {format(currentPackage.startDate, "dd/MM/yyyy")}
            </dd>
            <dd className="mt-1 font-medium text-emerald-600">
              Período:{" "}
              {format(currentPackage.startDate, "MMM/yyyy", { locale: ptBR })}
            </dd>
          </dl>
        </article>

        <article className="rounded-xl bg-[#F9FAFB] p-4">
          <dl>
            <dt className="text-sm text-[#667085]">Sessões restantes</dt>
            <dd className="mt-2 font-semibold text-[#101828]">
              {remainingSessions} sessões
            </dd>
          </dl>
        </article>

        <article className="rounded-xl bg-[#F9FAFB] p-4">
          <dl>
            <dt className="text-sm text-[#667085]">Horário padrão</dt>
            <dd className="mt-2 font-semibold text-[#101828]">
              {currentPackage.defaultTime}
            </dd>
          </dl>
        </article>

        <article className="rounded-xl bg-[#F9FAFB] p-4">
          <dl>
            <dt className="text-sm text-[#667085]">Dias fixos</dt>
            <dd className="mt-2 font-semibold text-[#101828]">
              {currentPackage.fixedWeekDays.join(" • ")}
            </dd>
          </dl>
        </article>

        <article className="rounded-xl bg-[#F9FAFB] p-4">
          <dl>
            <dt className="text-sm text-[#667085]">Valor da sessão</dt>
            <dd className="mt-2 font-semibold text-[#101828]">
              {currentPackage.valueSession.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </dd>
          </dl>
        </article>

        <article className="rounded-xl bg-[#F9FAFB] p-4">
          <dl>
            <dt className="text-sm text-[#667085]">Próxima sessão</dt>
            <dd className="mt-2 font-semibold text-[#101828]">
              {nextSession
                ? format(parseISO(nextSession.date), "dd/MM/yyyy")
                : "Nenhuma"}
            </dd>

            {nextSession && (
              <dd className="mt-1 text-sm text-[#667085]">
                {nextSession.time ?? currentPackage.defaultTime}
              </dd>
            )}
          </dl>
        </article>
      </div>

      <div className="mt-8 flex justify-center border-t border-[#EAECF0] pt-6">
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg border border-[#D0D5DD] bg-white px-4 py-2 text-sm font-medium text-[#344054] transition-colors hover:bg-[#F9FAFB]"
        >
          <History size={16} />
          Histórico
        </button>
      </div>
    </section>
  )
}
