import { useClinicStore } from "@/store/clinic/clinicStore"

export const PATIENT_READ_ONLY_MESSAGE =
  "Você não tem permissão para alterar os dados. Peça à clínica."

// Pacientes só visualizam. Chamado no início de toda função que grava no banco.
// (A RLS também bloqueia; isto garante uma mensagem clara em vez de falha silenciosa.)
export function assertCanEdit(): void {
  if (useClinicStore.getState().role === "patient") {
    throw new Error(PATIENT_READ_ONLY_MESSAGE)
  }
}
