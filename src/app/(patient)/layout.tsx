import { ClinicGate } from "@/components/clinic/clinicGate"
import React from "react"

function LayoutPatient({ children }: { children: React.ReactNode }) {
  return <ClinicGate>{children}</ClinicGate>
}

export default LayoutPatient
