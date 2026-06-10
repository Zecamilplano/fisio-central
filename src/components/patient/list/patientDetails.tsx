import type { ListPatient, PaidKey } from "@/types"
import Image from "next/image"
import { PencilLine } from "lucide-react"
import { PatientContactGrid } from "./patientContactGrid"
import { CurrentPackageCard } from "../package/currentPackageCard"
import { getPackageProgress } from "@/utils/package/getPackageProgress"
import { SeparateSessionInfoCard } from "./separateSessionInfoCard"
import { SessionAgenda } from "../session/sessionAgenda"

type PatientDetailsProps = {
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

export function PatientDetails({
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
}: PatientDetailsProps) {
  const packageProgress = getPackageProgress(patient)
  return (
    <section className="font-open-sans flex w-full flex-col gap-6 overflow-y-hidden rounded-md bg-[#F4F6F5] md:rounded-l-none md:rounded-r-md lg:overflow-y-auto">
      <div className="h-full overflow-y-auto px-3 py-4">
        <header className="flex flex-col justify-between gap-4 pb-5 md:flex-row md:items-center">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <Image
              src={patient.image ?? "/person.png"}
              width={110}
              height={110}
              alt="Foto de perfil"
              className="rounded-full"
            />

            <div className="text-center sm:text-left">
              <h2 className="text-xl text-[#2D3748] md:text-2xl">
                {patient.name}
              </h2>

              <p className="mt-2 rounded-4xl bg-[#FFA726]/20 px-5 py-2 text-center text-[#FFA726]">
                {patient.typeService}
              </p>
            </div>
          </div>

          <button className="self-end md:self-auto">
            <PencilLine size={28} color="#737373" />
          </button>
        </header>

        {/* ContactGrid */}
        <PatientContactGrid contactInfo={patient.contactInfo} />

        {/* CurrentPackageCard */}
        {patient.typeService === "Pacote" && packageProgress && (
          <CurrentPackageCard packageProgress={packageProgress} />
        )}

        {/* SeparateSessionCard */}
        {patient.typeService === "Sessão avulsa" && (
          <SeparateSessionInfoCard patient={patient} />
        )}

        {/* SessionAgenda */}
        <SessionAgenda
          patient={patient}
          selectedSessions={selectedSessions}
          allFinished={allFinished}
          allPending={allPending}
          allPaid={allPaid}
          allCancelled={allCancelled}
          allUnpaid={allUnpaid}
          deleteModal={deleteModal}
          createReplacementSession={createReplacementSession}
          setCreateReplacementSession={setCreateReplacementSession}
          closeDeleteModal={closeDeleteModal}
          confirmDelete={confirmDelete}
          changeFinishStatus={changeFinishStatus}
          changePaymentStatus={changePaymentStatus}
          clearSelection={clearSelection}
        />
      </div>
    </section>
  )
}
