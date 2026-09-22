import type { ListPatient } from "@/types"
import { PatientDetails } from "./patientDetails"
import { usePackageSession } from "@/hook/usePackageSession"

type SelectedPatientProps = {
  patient: ListPatient
  currentPackageIndex: number
  setCurrentPackageIndex: React.Dispatch<React.SetStateAction<number>>
}

function SelectedPatient({
  patient,
  currentPackageIndex,
  setCurrentPackageIndex,
}: SelectedPatientProps) {
  const packageSession = usePackageSession({
    patient,
    currentPackageIndex,
  })

  return (
    <PatientDetails
      patient={patient}
      currentPackageIndex={currentPackageIndex}
      setCurrentPackageIndex={setCurrentPackageIndex}
      packageSession={packageSession}
    />
  )
}

export { SelectedPatient }
