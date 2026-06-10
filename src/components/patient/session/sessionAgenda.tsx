import { CalendarDays } from "lucide-react"
import type { ListPatient, PaidKey } from "@/types"
import { SelectedSessionsActions } from "./selectedSessionsActions"
import { DeleteSessionModal } from "./deleteSessionModal"
import { SessionCardProvider } from "@/context/sessionCardContext"
import { SessionCard } from "./sessionCard"

type SessionAgendaProps = {
  patient: ListPatient
  selectedSessions: string[]

  allFinished: boolean
  allPending: boolean
  allPaid: boolean
  allCancelled: boolean
  allUnpaid: boolean

  deleteModal: {
    isOpen: boolean
    sessionId: string | null
    sessionNumber: number | null
  }
  createReplacementSession: boolean
  setCreateReplacementSession: (value: boolean) => void
  closeDeleteModal: () => void
  confirmDelete: () => void

  changeFinishStatus: (value: boolean) => void
  changePaymentStatus: (value: PaidKey) => void
  clearSelection: () => void
}

// type SessionAgendaProps = {
//   patient: ListPatient }

export function SessionAgenda({
  patient,
  selectedSessions,
  allFinished,
  allPending,
  allPaid,
  allCancelled,
  allUnpaid,
  deleteModal,
  createReplacementSession,
  setCreateReplacementSession,
  closeDeleteModal,
  confirmDelete,
  changeFinishStatus,
  changePaymentStatus,
  clearSelection,
}: SessionAgendaProps) {
  return (
    <section className="rounded-md bg-white px-2 py-3">
      <header className="flex flex-col justify-between gap-3 border-b border-[#ECEFF3] pb-3 md:flex-row md:items-center">
        <div className="flex items-center gap-2">
          <CalendarDays color="#FFA726" size={24} />

          <h4 className="text-xl font-semibold text-[#344054] md:text-2xl">
            Agenda de sessões
          </h4>
        </div>

        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-[#667085] md:text-base">
            Início: {patient.startDate.toLocaleDateString("pt-BR")}
          </p>

          <button className="flex items-center gap-2 rounded-lg bg-[#FDB022] px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-[#F79009]">
            + Adicionar sessão
          </button>
        </div>
      </header>

      <SelectedSessionsActions
        selectedSessions={selectedSessions}
        allFinished={allFinished}
        allPending={allPending}
        allPaid={allPaid}
        allCancelled={allCancelled}
        allUnpaid={allUnpaid}
        changeFinishStatus={changeFinishStatus}
        changePaymentStatus={changePaymentStatus}
        clearSelection={clearSelection}
      />

      <DeleteSessionModal
        isOpen={deleteModal.isOpen}
        sessionNumber={deleteModal.sessionNumber}
        createReplacementSession={createReplacementSession}
        setCreateReplacementSession={setCreateReplacementSession}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
      />

      <ol className="grid grid-cols-1 gap-4 pt-4 md:grid-cols-2">
        {patient.session.map((session) => (
          <SessionCard key={session.id} session={session} />
        ))}
      </ol>
    </section>
  )
}
