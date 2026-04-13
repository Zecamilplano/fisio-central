import React from "react"
import { PatientProvider } from "../../context/patientContext"

function LayoutPatient({ children }: { children: React.ReactNode }) {
  return <PatientProvider>{children}</PatientProvider>
}

export default LayoutPatient
