import type { ListPatient } from "@/types"

export function getCurrentPackage(patient: ListPatient) {
  if (patient.typeService !== "Pacote") return null

  return patient.packages.find((pkg) => pkg.current) ?? null
}
