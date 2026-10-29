import type { ListPatient, SessionController } from "@/types"
import { ArrowLeft, PencilLine } from "lucide-react"
import { CurrentPackageCard } from "../package/currentPackageCard"
import { PatientContactGrid, SeparateSessionInfoCard } from "./"
import { PackageSession } from "../session/packageSession"
import { useEffect } from "react"
import {
  usePackageSession,
  UsePackageSessionReturn,
} from "@/hook/usePackageSession"
import { DeleteSessionModal } from "../session/deleteSessionModal"
import { getInitialLetters } from "@/utils/patient/getInitialLetters"
import { EditPatientModal } from "./editPatientModal"
import { useState } from "react"
import {
  deletePatientPermanently,
  updatePatientProfile,
} from "@/services/patients/patientRepository"
import { useFisioStore } from "@/store/fisio/fisioStore"
import type { PatientType } from "@/types/registerPatientsTypes"

type PatientDetailsProps = {
  patient: ListPatient
  currentPackageIndex: number
  setCurrentPackageIndex: React.Dispatch<React.SetStateAction<number>>
  packageSession?: UsePackageSessionReturn
  onPatientDeleted?: () => void
  onBackToPatients?: () => void
}

export function PatientDetails({
  patient,
  currentPackageIndex,
  setCurrentPackageIndex,
  onPatientDeleted,
  onBackToPatients,
}: PatientDetailsProps) {
  const [isEditPatientOpen, setIsEditPatientOpen] = useState(false)
  const updatePatientInStore = useFisioStore((state) => state.updatePatient)
  const removePatientFromStore = useFisioStore((state) => state.removePatient)
  const removeEvolution = useFisioStore((state) => state.removeEvolution)
  const evolutions = useFisioStore((state) => state.evolutions)
  const packageSession = usePackageSession({
    patient,
    currentPackageIndex,
  })

  const {
    deleteModal,
    createReplacementSession,
    showReplacementOption,
    isDeletingAllSessions,
  } = packageSession.deleteState
  const { setCreateReplacementSession, closeDeleteModal, confirmDelete } =
    packageSession.deleteActions
  const patientName = `${patient.firstName} ${patient.surName}`.trim()

  async function handleSavePatientProfile(
    updatedPatient: PatientType,
    photo?: File,
    removePhoto?: boolean
  ) {
    const result = await updatePatientProfile(
      patient.id,
      updatedPatient,
      photo,
      removePhoto
    )
    updatePatientInStore(patient.id, (currentPatient) => ({
      ...currentPatient,
      ...updatedPatient,
      address: updatedPatient.address,
      image:
        result.photoUrl === undefined
          ? currentPatient.image
          : result.photoUrl,
    }))
  }

  async function handleDeletePatient() {
    return deletePatientPermanently(patient.id)
  }

  function handlePatientDeleted() {
    patient.session.forEach((session) => removeEvolution(session.id))
    removePatientFromStore(patient.id)
    onPatientDeleted?.()
  }

  const patientEvolutionCount = patient.session.filter(
    (session) => evolutions[session.id]
  ).length

  const sessionController: SessionController = {
    selectedSessions: packageSession.selectionState.selectedSessions,
    openSessionId: packageSession.sessionState.openSessionId,
    deletingSessionId: packageSession.deleteState.deletingSessionId,

    selectedStatus: packageSession.selectionState.selectedStatus,
    selectedAction: packageSession.selectionActions.selectedActions,

    selectSession: packageSession.selectionActions.handleSelectSession,
    toggleSession: packageSession.sessionActions.handleToggleSession,

    openDeleteModal: packageSession.sessionActions.openDeleteModal,
    openNewPackageModal: () => {
      if (patient.typeService === "Pacote") {
        const activePackageIndex = patient.packages.findIndex(
          (item) => item.current
        )
        if (activePackageIndex >= 0) {
          setCurrentPackageIndex(activePackageIndex)
        }
      }
      packageSession.sessionActions.openNewPackageModal()
    },
    changeSession: packageSession.sessionActions.handleChange,
    changePackageWeekDays: packageSession.sessionActions.changePackageWeekDays,
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
    <section className="font-open-sans flex h-full min-h-0 w-full flex-col gap-6 overflow-y-hidden rounded-md bg-[#F4F6F5] md:rounded-l-none md:rounded-r-md lg:overflow-y-auto">
      <div className="h-full min-h-0 flex-1 overflow-y-auto px-3 py-4">
        {onBackToPatients && (
          <div className="-mx-3 -mt-4 mb-3 border-b border-slate-200 px-3 py-2 lg:hidden">
            <button
              type="button"
              onClick={onBackToPatients}
              data-patient-back
              className="inline-flex min-h-10 items-center gap-1 rounded-lg px-2 text-sm font-semibold text-slate-700 transition hover:bg-white active:bg-slate-100"
              aria-label="Voltar para a lista de pacientes"
            >
              <ArrowLeft size={20} />
              Pacientes
            </button>
          </div>
        )}

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
                {getInitialLetters(patientName)}
              </div>
            )}

            <div className="text-center sm:text-left">
              <h1 className="text-xl font-medium text-slate-700 ">
                {patientName}
              </h1>

              <p className="mt-2 inline-flex min-w-28 justify-center rounded-full bg-amber-100 px-4 py-1 text-sm text-amber-500">
                {patient.typeService}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsEditPatientOpen(true)}
            aria-label="Editar cadastro do paciente"
            className="self-end rounded-full p-2 transition hover:bg-white md:self-auto cursor-pointer"
          >
            <PencilLine size={28} color="#737373" />
          </button>
        </header>

        {/* ContactGrid */}
        <PatientContactGrid address={patient.address} />

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
        <PackageSession patient={patient} packageSession={packageSession} />

        {/* Modal de exclusão de sessão*/}
        <DeleteSessionModal
          isOpen={deleteModal.isOpen}
          isDeletingAllSessions={isDeletingAllSessions}
          sessionNumber={deleteModal.sessionNumber}
          createReplacementSession={createReplacementSession}
          showReplacementOption={showReplacementOption}
          setCreateReplacementSession={setCreateReplacementSession}
          onClose={closeDeleteModal}
          onConfirm={confirmDelete}
        />
        <EditPatientModal
          patient={patient}
          isOpen={isEditPatientOpen}
          onClose={() => setIsEditPatientOpen(false)}
          onSave={handleSavePatientProfile}
          onDelete={handleDeletePatient}
          onDeleted={handlePatientDeleted}
          deletionCounts={{
            packages: patient.typeService === "Pacote" ? patient.packages.length : 0,
            sessions: patient.session.length,
            evolutions: patientEvolutionCount,
          }}
          onApplyGlobalSchedule={packageSession.sessionActions.applyGlobalSchedule}
        />
      </div>
    </section>
  )
}
