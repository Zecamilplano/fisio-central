import { ListPatient, SessionController } from "@/types"
import { ChevronDown, CircleDot, X } from "lucide-react"
import { useEffect, useState } from "react"
import { SessionCard } from "../session/sessionCard"
import { SelectedSessionsActions } from "../session/selectedSessionsActions"
import { cn } from "tailwind-variants"
import { format } from "date-fns"
import { getInitialLetters } from "@/utils/patient/getInitialLetters"

type PackageHistoryModalProps = {
  patient: Extract<ListPatient, { typeService: "Pacote" }>
  sessionController: SessionController
  onClose: () => void
}

export function PackageHistoryModal({
  patient,
  sessionController,
  onClose,
}: PackageHistoryModalProps) {
  const packages = patient.packages.toReversed()
  const sessions = patient.session

  // console.log("packages: ", packages)
  // console.log("quantidade: ", packages.length)

  const [openPackageId, setOpenPackageId] = useState<string | null>(
    packages[0]?.id ?? null
  )
  const [isPackageListOpen, setIsPackageListOpen] = useState(true)

  const firstPackage = packages[0]
  const treatmentStartDate = firstPackage?.startDate
  const currentPackage = packages.find((pkg) => pkg.current)
  const treatmentIsActive = Boolean(currentPackage)

  const {
    selectedSessions,
    openSessionId,
    deletingSessionId,
    selectedStatus,
    selectedAction,
    selectSession,
    toggleSession,
    openDeleteModal,
    changeSession,
  } = sessionController

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose()
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4 backdrop-blur-[1px]">
      <div className="flex max-h-[80vh] w-full max-w-180 flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
        <header className="flex items-start justify-between border-b border-slate-200 px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-400 text-xs font-bold text-white">
              {getInitialLetters(patient.name)}
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Histórico de Pacotes
              </h2>

              <p className="text-[11px] text-slate-500">{patient.name}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
            aria-label="Fechar histórico de pacotes"
          >
            <X size={16} />
          </button>
        </header>

        <main className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 py-4">
          <section className="w-full">
            <div className="flex w-full items-center justify-between rounded-md bg-emerald-500/10 px-4 py-3">
              <div className="flex items-start gap-3">
                <CircleDot
                  className="mt-1 shrink-0 text-emerald-600"
                  size={14}
                />

                <div>
                  <p className="text-sm font-semibold text-emerald-700">
                    Início do tratamento:{" "}
                    {treatmentStartDate
                      ? format(treatmentStartDate, "dd/MM/yyyy")
                      : "Não informado"}
                  </p>

                  <p className="text-xs text-slate-500">
                    {packages.length}{" "}
                    {packages.length === 1 ? "pacote" : "pacotes"}
                    {" • "}
                    {treatmentIsActive
                      ? "Pacote atual em andamento"
                      : "Tratamento encerrado"}
                  </p>
                </div>
              </div>

              <span
                className={cn(
                  "rounded-full px-3 py-1 text-[11px] font-semibold",
                  treatmentIsActive
                    ? "bg-emerald-500/15 text-emerald-700"
                    : "bg-slate-500/15 text-slate-600"
                )}
              >
                {treatmentIsActive ? "Ativo" : "Encerrado"}
              </span>
            </div>
          </section>

          {isPackageListOpen && (
            <ol className="flex flex-col gap-3">
              {packages.map((pkg, index) => {
                const packageNumber =
                  patient.packages.findIndex((item) => item.id === pkg.id) + 1
                const packageSession = sessions.filter(
                  (session) => session.packageId === pkg.id
                )

                const isPackageOpen = openPackageId === pkg.id

                return (
                  <li
                    key={pkg.id}
                    className={cn(
                      "overflow-hidden rounded-xl border",
                      pkg.current
                        ? "border-emerald-300 bg-emerald-50/20"
                        : "border-slate-200 bg-white"
                    )}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setOpenPackageId((current) =>
                          current === pkg.id ? null : pkg.id
                        )
                      }
                      className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-slate-50/80 cursor-pointer"
                      aria-expanded={isPackageOpen}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span
                          className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                            pkg.current
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-100 text-slate-600"
                          )}
                        >
                          {packageNumber}
                        </span>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={cn(
                                "text-sm font-semibold",
                                pkg.current
                                  ? "text-emerald-700"
                                  : "text-slate-700"
                              )}
                            >
                              {pkg.current
                                ? "Pacote atual"
                                : `Pacote ${packageNumber}`}
                            </span>

                            {pkg.current && (
                              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                                Atual
                              </span>
                            )}
                          </div>

                          <p className="mt-0.5 text-xs text-slate-500">
                            {format(pkg.startDate, "dd/MM/yyyy")}
                            {" • "}
                            {packageSession.length}{" "}
                            {packageSession.length === 1 ? "sessão" : "sessões"}
                          </p>
                        </div>
                      </div>

                      <ChevronDown
                        size={18}
                        className={cn(
                          "shrink-0 text-slate-400 transition-transform duration-300",
                          isPackageOpen && "rotate-180"
                        )}
                      />
                    </button>

                    {isPackageOpen && (
                      <div className="border-t border-slate-200 px-3 py-3">
                        <SelectedSessionsActions
                          selectedCount={selectedSessions.length}
                          status={selectedStatus}
                          actions={selectedAction}
                        />

                        {packageSession.length > 0 ? (
                          <ol className="flex flex-col gap-3">
                            {packageSession.map((session) => (
                              <SessionCard
                                key={`${session.id}-${session.date}`}
                                patient={patient}
                                session={session}
                                defaultTime={pkg.defaultTime}
                                isSelected={selectedSessions.includes(
                                  session.id
                                )}
                                isOpen={openSessionId === session.id}
                                isDeleting={deletingSessionId === session.id}
                                onSelect={() => selectSession(session.id)}
                                onToggleOpen={() => toggleSession(session.id)}
                                onOpenDeleteModal={openDeleteModal}
                                onChangeSession={changeSession}
                              />
                            ))}
                          </ol>
                        ) : (
                          <p className="py-3 text-center text-sm text-slate-500">
                            Nenhuma sessão encontrada neste pacote.
                          </p>
                        )}
                      </div>
                    )}
                  </li>
                )
              })}
            </ol>
          )}
        </main>

        <footer className="flex justify-end gap-3 border-t border-slate-200 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-300 px-5 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            Fechar
          </button>

          <button
            type="button"
            className="rounded-md bg-emerald-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            + Novo Pacote
          </button>
        </footer>
      </div>
    </div>
  )
}
