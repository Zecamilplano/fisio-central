import { CalendarDays } from "lucide-react"
import type { ListPatient } from "@/types"
import { SelectedSessionsActions } from "./selectedSessionsActions"
import { DeleteSessionModal } from "./deleteSessionModal"
import { SessionCard } from "./sessionCard"
import { useSessionAgenda } from "@/hook/useSessionAgenda"
import { AddSessionModal } from "./addSessionModal"

type SessionAgendaProps = {
  patient: ListPatient
  setListPatient: React.Dispatch<React.SetStateAction<ListPatient[]>>
}

export function SessionAgenda({ patient, setListPatient }: SessionAgendaProps) {
  const {
    sessionState,
    selectionState,
    deleteState,
    sessionActions,
    selectionActions,
    deleteActions,
  } = useSessionAgenda({ patient, setListPatient })

  const {
    openSessionId,
    currentPackage,
    deletingSessionId,
    isAddSessionModalOpen,
    packageIsComplete,
    suggestedPackageStartDate,
  } = sessionState

  const {
    selectedSessions,
    allSessionsSelected,
    isSingleSession,
    allFinished,
    allPending,
    allPaid,
    allUnpaid,
    allCancelled,
  } = selectionState

  const { deleteModal, createReplacementSession, isDeletingAllSessions } =
    deleteState

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

  const {
    clearSelection,
    handleSelectSession,
    handleSelectAllSessions,
    changeFinishStatus,
    changePaymentStatus,
  } = selectionActions

  const {
    openSelectedDeleteModal,
    setCreateReplacementSession,
    closeDeleteModal,
    confirmDelete,
  } = deleteActions

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
          className="flex items-center gap-2 rounded-lg bg-[#FDB022] px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-[#F79009]"
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
        allFinished={allFinished}
        allPending={allPending}
        allPaid={allPaid}
        allCancelled={allCancelled}
        allUnpaid={allUnpaid}
        onMarkFinished={() => changeFinishStatus(true)}
        onMarkPending={() => changeFinishStatus(false)}
        onMarkPaid={() => changePaymentStatus("pago")}
        onMarkUnpaid={() => changePaymentStatus("pendente")}
        onMarkCancelled={() => changePaymentStatus("cancelado")}
        onClearSelection={clearSelection}
        onDeleteSelected={openSelectedDeleteModal}
      />

      <DeleteSessionModal
        isOpen={deleteModal.isOpen}
        isDeletingAllSessions={isDeletingAllSessions}
        sessionNumber={deleteModal.sessionNumber}
        createReplacementSession={createReplacementSession}
        setCreateReplacementSession={setCreateReplacementSession}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
      />

      <ol
        className={`grid gap-3 ${
          isSingleSession ? "grid-cols-1" : "grid-cols-2"
        }`}
      >
        {patient.session.map((session) => (
          <SessionCard
            key={session.id}
            session={session}
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
