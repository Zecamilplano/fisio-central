import type { ListPatient } from "@/types"
import { getCurrentPackage } from "./getCurrentPackage"

export function getPackageProgress(patient: ListPatient) {
  if (patient.typeService !== "Pacote") return null

  const currentPackage = getCurrentPackage(patient)

  if (!currentPackage) return null

  const completedSessions = patient.session.filter(
    (session) => session.packageId === currentPackage.id && session.finish
  ).length

  const remainingSessions = currentPackage.totalSessions - completedSessions

  const progress = (completedSessions / currentPackage.totalSessions) * 100

  return {
    currentPackage,
    completedSessions,
    remainingSessions,
    progress,
  }
}
