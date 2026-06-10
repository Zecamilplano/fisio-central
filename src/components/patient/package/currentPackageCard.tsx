import type { ListPatient } from "@/types"

type PackageProgress = {
  currentPackage: Extract<
    ListPatient,
    { typeService: "Pacote" }
  >["packages"][number]
  completedSessions: number
  remainingSessions: number
  progress: number
}

type CurrentPackageCardProps = {
  packageProgress: PackageProgress
}

export function CurrentPackageCard({
  packageProgress,
}: CurrentPackageCardProps) {
  return (
    <section className="pb-3">
      <article
        aria-labelledby="current-package-title"
        className="rounded-2xl border border-[#EAECF0] bg-white p-5 shadow-sm"
      >
        <header className="mb-5 flex flex-col gap-3 border-b border-[#ECEFF3] pb-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-[#667085]">
              Tratamento em andamento
            </p>

            <h3
              id="current-package-title"
              className="mt-1 text-xl font-semibold text-[#344054] md:text-2xl"
            >
              📦 Pacote Atual
            </h3>
          </div>

          <button
            type="button"
            className="w-full rounded-lg border border-[#FEDF89] bg-[#FFFAEB] px-4 py-2 text-sm font-semibold text-[#B54708] transition-all duration-200 hover:bg-[#FEF0C7] md:w-auto"
          >
            Ver histórico
          </button>
        </header>

        <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <div className="mb-3 flex items-end justify-between gap-3">
              <p className="text-2xl font-bold text-[#101828] md:text-3xl">
                {packageProgress.completedSessions} /{" "}
                {packageProgress.currentPackage.totalSessions}
                <span className="ml-2 text-sm font-medium text-[#667085]">
                  sessões
                </span>
              </p>

              <p className="text-sm font-semibold text-[#667085]">
                {Math.round(packageProgress.progress)}%
              </p>
            </div>

            <div
              role="progressbar"
              aria-valuenow={Math.round(packageProgress.progress)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Progresso do pacote atual"
              className="h-3 w-full overflow-hidden rounded-full bg-[#EAECF0]"
            >
              <div
                className="h-full rounded-full bg-[#FFA726] transition-all duration-500"
                style={{
                  width: `${Math.min(packageProgress.progress, 100)}%`,
                }}
              />
            </div>
          </div>

          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-[#F9FAFB] p-4">
              <dt className="text-sm font-medium text-[#667085]">
                Início do pacote
              </dt>
              <dd className="mt-1 text-base font-semibold text-[#101828]">
                {packageProgress.currentPackage.startDate.toLocaleDateString(
                  "pt-BR"
                )}
              </dd>
            </div>

            <div className="rounded-xl bg-[#F9FAFB] p-4">
              <dt className="text-sm font-medium text-[#667085]">Restantes</dt>
              <dd className="mt-1 text-base font-semibold text-[#101828]">
                {packageProgress.remainingSessions} sessões
              </dd>
            </div>

            <div className="rounded-xl bg-[#F9FAFB] p-4">
              <dt className="text-sm font-medium text-[#667085]">Dias fixos</dt>
              <dd className="mt-1 text-base font-semibold text-[#101828]">
                {packageProgress.currentPackage.fixedWeekDays.join(" • ")}
              </dd>
            </div>

            <div className="rounded-xl bg-[#F9FAFB] p-4">
              <dt className="text-sm font-medium text-[#667085]">
                Valor da sessão
              </dt>
              <dd className="mt-1 text-base font-semibold text-[#101828]">
                {packageProgress.currentPackage.valueSession.toLocaleString(
                  "pt-BR",
                  {
                    style: "currency",
                    currency: "BRL",
                  }
                )}
              </dd>
            </div>
          </dl>
        </div>
      </article>
    </section>
  )
}
