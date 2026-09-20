import type { ListPatient, SessionController } from "@/types"
import { PencilLine } from "lucide-react"
import { PatientContactGrid } from "./patientContactGrid"
import { CurrentPackageCard } from "../package/currentPackageCard"
import { SeparateSessionInfoCard } from "./separateSessionInfoCard"
import { PackageSession } from "../session/packageSession"
import { useEffect } from "react"
import {
  usePackageSession,
  UsePackageSessionReturn,
} from "@/hook/usePackageSession"
import { DeleteSessionModal } from "../session/deleteSessionModal"
import { getInitialLetters } from "@/utils/patient/getInitialLetters"

type PatientDetailsProps = {
  patient: ListPatient
  setListPatient: React.Dispatch<React.SetStateAction<ListPatient[]>>
  currentPackageIndex: number
  setCurrentPackageIndex: React.Dispatch<React.SetStateAction<number>>
  packageSession?: UsePackageSessionReturn
}

export function PatientDetails({
  patient,
  currentPackageIndex,
  setListPatient,
  setCurrentPackageIndex,
  // packageSession,
}: PatientDetailsProps) {
  const packageSession = usePackageSession({
    patient,
    setListPatient,
    currentPackageIndex,
  })

  const { deleteModal, createReplacementSession, isDeletingAllSessions } =
    packageSession.deleteState
  const { setCreateReplacementSession, closeDeleteModal, confirmDelete } =
    packageSession.deleteActions

  const sessionController: SessionController = {
    selectedSessions: packageSession.selectionState.selectedSessions,
    openSessionId: packageSession.sessionState.openSessionId,
    deletingSessionId: packageSession.deleteState.deletingSessionId,

    selectedStatus: packageSession.selectionState.selectedStatus,
    selectedAction: packageSession.selectionActions.selectedActions,

    selectSession: packageSession.selectionActions.handleSelectSession,
    toggleSession: packageSession.sessionActions.handleToggleSession,

    openDeleteModal: packageSession.sessionActions.openDeleteModal,
    changeSession: packageSession.sessionActions.handleChange,
  }

  useEffect(() => {
    if (patient.typeService !== "Pacote") {
      setCurrentPackageIndex(0)
      return
    }

    const currentIndex = patient.packages.findIndex((item) => item.current)

    setCurrentPackageIndex(
      currentIndex >= 0 ? currentIndex : patient.packages.length - 1
    )
  }, [patient])

  return (
    <section className="font-open-sans flex w-full flex-col gap-6 overflow-y-hidden rounded-md bg-[#F4F6F5] md:rounded-l-none md:rounded-r-md lg:overflow-y-auto">
      <div className="h-full overflow-y-auto px-3 py-4">
        <header className="flex flex-col justify-between gap-4 pb-5 md:flex-row md:items-center">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            {(patient.image?.length ?? 0) > 1 ? (
              <img
                src={patient.image ?? "/person.png"}
                alt="Foto de perfil"
                height={64}
                width={64}
                className="h-16 w-16 shrink-0 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-amber-400 text-xl font-medium text-white uppercase">
                {getInitialLetters(patient.name)}
              </div>
            )}

            <div className="text-center sm:text-left">
              <h1 className="text-xl font-medium text-slate-700 ">
                {patient.name}
              </h1>

              <p className="mt-2 inline-flex min-w-28 justify-center rounded-full bg-amber-100 px-4 py-1 text-sm text-amber-500">
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
        {patient.typeService === "Pacote" && (
          <CurrentPackageCard
            patient={patient}
            currentPackageIndex={currentPackageIndex}
            setCurrentPackageIndex={setCurrentPackageIndex}
            sessionController={sessionController}
          />
        )}

        {/*sessões */}
        {/* sessões avulsa */}
        {patient.typeService === "Sessão avulsa" && (
          <SeparateSessionInfoCard patient={patient} />
        )}

        {/* Sessões em pacote */}
        <PackageSession
          patient={patient}
          packageSession={packageSession}
          sessionController={sessionController}
        />

        {/* Modal de exclusão de sessão*/}
        <DeleteSessionModal
          isOpen={deleteModal.isOpen}
          isDeletingAllSessions={isDeletingAllSessions}
          sessionNumber={deleteModal.sessionNumber}
          createReplacementSession={createReplacementSession}
          setCreateReplacementSession={setCreateReplacementSession}
          onClose={closeDeleteModal}
          onConfirm={confirmDelete}
        />
      </div>
    </section>
  )
}
