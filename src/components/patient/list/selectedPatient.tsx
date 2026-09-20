import type { ListPatient } from "@/types"
import { PatientDetails } from "./patientDetails"
import { usePackageSession } from "@/hook/usePackageSession"

type SelectedPatientProps = {
  patient: ListPatient
  setListPatient: React.Dispatch<React.SetStateAction<ListPatient[]>>
  currentPackageIndex: number
  setCurrentPackageIndex: React.Dispatch<React.SetStateAction<number>>
}

function SelectedPatient({
  patient,
  setListPatient,
  currentPackageIndex,
  setCurrentPackageIndex,
}: SelectedPatientProps) {
  const packageSession = usePackageSession({
    patient,
    setListPatient,
    currentPackageIndex,
  })

  return (
    <PatientDetails
      patient={patient}
      setListPatient={setListPatient}
      currentPackageIndex={currentPackageIndex}
      setCurrentPackageIndex={setCurrentPackageIndex}
      packageSession={packageSession}
    />
  )
}

export { SelectedPatient }
