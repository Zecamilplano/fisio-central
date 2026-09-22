import { CalendarDays } from "lucide-react"
import type { ListPatient, SessionController, UsePackageSession } from "@/types"
import { SelectedSessionsActions } from "./selectedSessionsActions"
import { DeleteSessionModal } from "./deleteSessionModal"
import { SessionCard } from "./sessionCard"
import { AddSessionModal } from "./addSessionModal"
import { UsePackageSessionReturn } from "@/hook/usePackageSession"
import { cn } from "tailwind-variants"

type PackageSessionProps = {
  patient: ListPatient
  packageSession: UsePackageSessionReturn
  sessionController: SessionController
}

export function PackageSession({
  patient,
  packageSession,
  sessionController,
}: PackageSessionProps) {
  const {
    sessionState,
    selectionState,
    deleteState,
    sessionActions,
    selectionActions,
    deleteActions,
  } = packageSession

  const {
    openSessionId,
    currentPackage,
    isAddSessionModalOpen,
    packageIsComplete,
    suggestedPackageStartDate,
  } = sessionState

  const { selectedSessions, allSessionsSelected, selectedStatus } =
    selectionState

  const {
    deleteModal,
    deletingSessionId,
    createReplacementSession,
    isDeletingAllSessions,
  } = deleteState

  const {
    setOpenSessionId,
    openDeleteModal,
    handleChange,
    openAddSessionModal,
    closeAddSessionModal,
    addSessionToCurrentPackage,
    addSeparateSession,
    createNextPackage,
  } = sessionActions

  const { handleSelectSession, handleSelectAllSessions, selectedActions } =
    selectionActions

  const { setCreateReplacementSession, closeDeleteModal, confirmDelete } =
    deleteActions

  const visibleSession =
    patient.typeService === "Pacote" && currentPackage
      ? [...patient.session]
          .filter((session) => session.packageId === currentPackage.id)
          .sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          )
      : [...patient.session].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        )

  return (
    <section className="rounded-md bg-white px-2 py-3">
      <header className="flex flex-col justify-between gap-3 border-b border-[#ECEFF3] pb-3 md:flex-row md:items-center">
        <div className="flex items-center gap-2">
          <CalendarDays color="#FFA726" size={24} />

          <h4 className="text-xl font-semibold text-[#344054] md:text-2xl">
            Agenda de sessões
          </h4>
        </div>

        <button
          onClick={openAddSessionModal}
          className="flex justify-center items-center gap-2 rounded-lg bg-[#FDB022] px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-[#F79009]"
        >
          + Adicionar sessão
        </button>
        <AddSessionModal
          suggestedPackageStartDate={suggestedPackageStartDate}
          isOpen={isAddSessionModalOpen}
          patientType={patient.typeService}
          packageIsComplete={packageIsComplete}
          onClose={closeAddSessionModal}
          onContinueCurrentPackage={addSessionToCurrentPackage}
          onStartNextPackage={() => {}}
          currentPackage={currentPackage}
          onCreateSeparateSession={addSeparateSession}
          onCreateNextPackage={createNextPackage}
        />
      </header>

      {patient.typeService === "Pacote" && (
        <div className="flex items-center justify-between py-3">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-600 select-none">
            <input
              type="checkbox"
              checked={allSessionsSelected}
              onChange={handleSelectAllSessions}
              className="h-4 w-4 accent-[#FDB022]"
            />
            Selecionar todas
          </label>

          <span className="text-sm font-medium text-slate-500 text-nowrap">
            Início: {patient.startDate.toLocaleDateString("pt-BR")}
          </span>
        </div>
      )}

      <SelectedSessionsActions
        selectedCount={selectedSessions.length}
        status={selectedStatus}
        actions={selectedActions}
      />

      <ol
        className={cn(
          "grid gap-3",
          visibleSession.length === 1
            ? "grid-cols-1"
            : "grid-cols-1 lg:grid-cols-2"
        )}
      >
        {visibleSession.map((session) => (
          <SessionCard
            key={`${session.id}-${session.date}`}
            patient={patient}
            session={session}
            defaultTime={currentPackage?.defaultTime ?? "08:00"}
            isSelected={selectedSessions.includes(session.id)}
            isOpen={openSessionId === session.id}
            isDeleting={deletingSessionId === session.id}
            onSelect={() => handleSelectSession(session.id)}
            onToggleOpen={() =>
              setOpenSessionId((prev) =>
                prev === session.id ? null : session.id
              )
            }
            onOpenDeleteModal={openDeleteModal}
            onChangeSession={handleChange}
          />
        ))}
      </ol>
    </section>
  )
}
