import { useClinicStore } from "@/store/clinic/clinicStore"

export function getClinicId(): string {
  const clinicId = useClinicStore.getState().clinicId
  if (!clinicId) throw new Error("Clínica não carregada. Recarregue a página.")
  return clinicId
}
